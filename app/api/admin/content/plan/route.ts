import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rejectUnlessAgent } from "@/lib/agent-auth";
import { triggerAgentWorkflow } from "@/lib/github-dispatch";
import { PLAN_ACTIONS, PLAN_INTENTS, queuePlanItem } from "@/lib/content-plan";

/**
 * Endpoint machine-to-machine untuk Agent 5 (Keyword Strategist, Karyawan
 * AI, `python -m falya_crew.keyword_strategist`): simpan rencana konten
 * mingguan & antrikan artikel teratas ke Content Writer.
 *
 * Body snake_case apa adanya (ContentPlan Pydantic di
 * Karyawan AI/src/falya_crew/models.py). Per item, upsert by cluster_key:
 * - item baru -> dibuat "proposed", baseline impresi/posisi dicatat.
 * - item lama -> angka terbaru diperbarui; aksi/intent hanya diubah kalau
 *   masih "proposed" (item yang sudah queued/drafted/skipped tidak diubah
 *   keputusannya).
 * Item "proposed" dari run sebelumnya yang TIDAK ada lagi di batch ini
 * dihapus (sinyalnya sudah hilang). Item ber-`queue: true` diantrikan lewat
 * queuePlanItem (dibatasi MAX_PENDING_PLAN_JOBS), lalu Content Writer
 * di-dispatch sekali.
 */

interface PlanItemBody {
  cluster_key: string;
  primary_keyword: string;
  secondary_keywords: string[];
  intent: (typeof PLAN_INTENTS)[number];
  action: (typeof PLAN_ACTIONS)[number];
  target_url: string | null;
  source: string;
  score: number;
  impressions: number;
  clicks: number;
  position: number | null;
  queue: boolean;
}

function isValidItem(value: unknown): value is PlanItemBody {
  if (!value || typeof value !== "object") return false;
  const i = value as Record<string, unknown>;
  return (
    typeof i.cluster_key === "string" &&
    i.cluster_key.length > 0 &&
    typeof i.primary_keyword === "string" &&
    i.primary_keyword.length > 0 &&
    Array.isArray(i.secondary_keywords) &&
    i.secondary_keywords.every((k) => typeof k === "string") &&
    PLAN_INTENTS.includes(i.intent as PlanItemBody["intent"]) &&
    PLAN_ACTIONS.includes(i.action as PlanItemBody["action"]) &&
    (i.target_url === null || typeof i.target_url === "string") &&
    typeof i.source === "string" &&
    typeof i.score === "number" &&
    typeof i.impressions === "number" &&
    typeof i.clicks === "number" &&
    (i.position === null || typeof i.position === "number") &&
    typeof i.queue === "boolean"
  );
}

export async function POST(request: NextRequest) {
  const rejection = rejectUnlessAgent(request);
  if (rejection) return rejection;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid." }, { status: 400 });
  }

  const items = (body as { items?: unknown } | null)?.items;
  if (!Array.isArray(items) || !items.every(isValidItem)) {
    return NextResponse.json(
      { error: "Body harus berupa ContentPlan yang valid (lihat Karyawan AI/src/falya_crew/models.py)." },
      { status: 400 }
    );
  }

  const toQueue: string[] = [];
  for (const item of items) {
    const metrics = {
      primaryKeyword: item.primary_keyword,
      secondaryKeywords: item.secondary_keywords,
      source: item.source,
      score: item.score,
      impressions: Math.round(item.impressions),
      clicks: Math.round(item.clicks),
      position: item.position,
    };
    const decision = { intent: item.intent, action: item.action, targetUrl: item.target_url };

    const existing = await prisma.contentPlanItem.findUnique({ where: { clusterKey: item.cluster_key } });
    if (!existing) {
      await prisma.contentPlanItem.create({
        data: {
          clusterKey: item.cluster_key,
          ...metrics,
          ...decision,
          baselineImpressions: Math.round(item.impressions),
          baselinePosition: item.position,
        },
      });
    } else {
      await prisma.contentPlanItem.update({
        where: { id: existing.id },
        data: existing.status === "proposed" ? { ...metrics, ...decision } : metrics,
      });
    }
    if (item.queue) toQueue.push(item.cluster_key);
  }

  const { count: removed } = await prisma.contentPlanItem.deleteMany({
    where: { status: "proposed", clusterKey: { notIn: items.map((i) => i.cluster_key) } },
  });

  let queued = 0;
  for (const clusterKey of toQueue) {
    const item = await prisma.contentPlanItem.findUnique({ where: { clusterKey } });
    if (item && (await queuePlanItem(item))) queued++;
  }
  if (queued > 0) {
    await triggerAgentWorkflow("content_writer_dispatch");
  }

  return NextResponse.json({
    success: true,
    saved: items.length,
    removed,
    queued,
    timestamp: new Date().toISOString(),
  });
}

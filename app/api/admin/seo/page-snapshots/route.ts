import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rejectUnlessAgent } from "@/lib/agent-auth";

/**
 * Endpoint machine-to-machine untuk SEO Auditor (Agent 3, Karyawan AI) --
 * simpan snapshot performa Search Console per halaman untuk minggu ini
 * (tabel PagePerformanceSnapshot). Body snake_case apa adanya (serialisasi
 * PageSnapshotBatch Pydantic, Karyawan AI/src/falya_crew/models.py), pola
 * sama endpoint audit-report.
 *
 * Upsert by (weekOf, pageUrl) -- idempotent: audit yang di-run ulang di
 * minggu yang sama menimpa angka minggu itu, tidak bikin baris dobel.
 */

interface SnapshotBody {
  page_url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  top_queries: unknown[];
}

interface SnapshotBatchBody {
  week_of: string;
  snapshots: SnapshotBody[];
}

function isValidBody(body: unknown): body is SnapshotBatchBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (typeof b.week_of !== "string" || Number.isNaN(Date.parse(b.week_of))) return false;
  if (!Array.isArray(b.snapshots)) return false;
  return b.snapshots.every((s) => {
    if (!s || typeof s !== "object") return false;
    const snap = s as Record<string, unknown>;
    return (
      typeof snap.page_url === "string" &&
      typeof snap.clicks === "number" &&
      typeof snap.impressions === "number" &&
      typeof snap.ctr === "number" &&
      typeof snap.position === "number" &&
      Array.isArray(snap.top_queries)
    );
  });
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

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "Body harus berupa PageSnapshotBatch yang valid (lihat Karyawan AI/src/falya_crew/models.py)." },
      { status: 400 }
    );
  }

  const weekOf = new Date(body.week_of);

  await prisma.$transaction(
    body.snapshots.map((snap) => {
      const data = {
        clicks: Math.round(snap.clicks),
        impressions: Math.round(snap.impressions),
        ctr: snap.ctr,
        position: snap.position,
        topQueries: snap.top_queries as Prisma.InputJsonValue,
      };
      return prisma.pagePerformanceSnapshot.upsert({
        where: { weekOf_pageUrl: { weekOf, pageUrl: snap.page_url } },
        create: { weekOf, pageUrl: snap.page_url, ...data },
        update: data,
      });
    })
  );

  return NextResponse.json({
    success: true,
    weekOf: weekOf.toISOString(),
    saved: body.snapshots.length,
    timestamp: new Date().toISOString(),
  });
}

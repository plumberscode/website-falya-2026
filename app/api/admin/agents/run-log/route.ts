import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint machine-to-machine untuk 3 agent Python (Karyawan AI:
 * sales_sync, seo_audit, content_writer) mencatat siklus hidup tiap run.
 * Dipanggil 2x per run: POST awal (status=running) create row & balikin
 * run_id, POST akhir (status=success|error) update row yang sama pakai
 * run_id -- bukan 2 row terpisah, lihat AgentRunLog di schema.prisma.
 *
 * Body snake_case apa adanya (pemanggil Python) -- pola sama endpoint audit
 * SEO & content draft.
 *
 * GET tetap x-agent-secret-gated untuk paritas/debug, TAPI dashboard
 * /admin/agents TIDAK memanggil route ini -- dashboard baca AgentRunLog
 * langsung lewat Prisma di app/actions/agents.ts (server action), sama
 * seperti /admin/seo & /admin/blog tidak pernah fetch API route mereka
 * sendiri.
 */

const VALID_AGENT_NAMES = ["sales_sync", "seo_audit", "content_writer"] as const;
type AgentName = (typeof VALID_AGENT_NAMES)[number];

function isValidAgentName(value: unknown): value is AgentName {
  return typeof value === "string" && (VALID_AGENT_NAMES as readonly string[]).includes(value);
}

interface StartBody {
  agent_name: AgentName;
  status: "running";
  started_at: string;
}

interface FinishBody {
  run_id: string;
  status: "success" | "error";
  summary?: string;
  error_message?: string;
  input_tokens?: number;
  output_tokens?: number;
  estimated_cost_usd?: number;
  finished_at: string;
}

function isStartBody(body: unknown): body is StartBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return isValidAgentName(b.agent_name) && b.status === "running" && typeof b.started_at === "string";
}

function isFinishBody(body: unknown): body is FinishBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.run_id === "string" &&
    (b.status === "success" || b.status === "error") &&
    typeof b.finished_at === "string"
  );
}

function checkAgentSecret(request: NextRequest): NextResponse | null {
  const expectedSecret = process.env.AGENT_API_SECRET;
  if (!expectedSecret) {
    console.error("AGENT_API_SECRET belum di-set di environment.");
    return NextResponse.json(
      { error: "Server belum dikonfigurasi (AGENT_API_SECRET kosong)." },
      { status: 500 }
    );
  }

  const providedSecret = request.headers.get("x-agent-secret");
  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  return null;
}

export async function POST(request: NextRequest) {
  const authError = checkAgentSecret(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid." }, { status: 400 });
  }

  // Dibedakan lewat presence run_id: tanpa run_id = start call (create),
  // dengan run_id = finish call (update).
  const hasRunId = !!body && typeof body === "object" && "run_id" in (body as Record<string, unknown>);

  if (!hasRunId) {
    if (!isStartBody(body)) {
      return NextResponse.json(
        { error: "Body start run-log harus berisi agent_name, status='running', started_at." },
        { status: 400 }
      );
    }

    const log = await prisma.agentRunLog.create({
      data: {
        agentName: body.agent_name,
        status: "running",
        startedAt: new Date(body.started_at),
      },
    });

    return NextResponse.json({ run_id: log.id });
  }

  if (!isFinishBody(body)) {
    return NextResponse.json(
      { error: "Body finish run-log harus berisi run_id, status='success'|'error', finished_at." },
      { status: 400 }
    );
  }

  try {
    const log = await prisma.agentRunLog.update({
      where: { id: body.run_id },
      data: {
        status: body.status,
        summary: body.summary ?? null,
        errorMessage: body.error_message ?? null,
        inputTokens: body.input_tokens ?? null,
        outputTokens: body.output_tokens ?? null,
        estimatedCostUsd: body.estimated_cost_usd ?? null,
        finishedAt: new Date(body.finished_at),
      },
    });

    return NextResponse.json({ success: true, run_id: log.id });
  } catch (error: unknown) {
    const code = (error as { code?: string } | null)?.code;
    if (code === "P2025") {
      return NextResponse.json({ error: `run_id ${body.run_id} tidak ditemukan.` }, { status: 404 });
    }
    console.error("Gagal update AgentRunLog:", error);
    return NextResponse.json({ error: "Gagal menyimpan run-log." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const authError = checkAgentSecret(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const agentName = searchParams.get("agentName");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 20, 1), 100) : 20;

  const logs = await prisma.agentRunLog.findMany({
    where: agentName ? { agentName } : undefined,
    orderBy: { startedAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ logs });
}

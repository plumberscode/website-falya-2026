import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint machine-to-machine: dipanggil main.py/seo_main.py (Karyawan AI)
 * untuk cek instruksi ad-hoc pending sebelum/sesudah crew jalan -- pola
 * sama persis app/api/admin/content/next-job/route.ts, digeneralisasi ke
 * agentName. HANYA untuk sales_sync & seo_audit (AgentTaskRequest) --
 * content_writer tetap pakai /api/admin/content/next-job (ContentJobRequest),
 * tidak digabung, lihat komentar AgentTaskRequest di schema.prisma.
 *
 * READ-ONLY tapi tetap x-agent-secret-gated (mengungkap keberadaan
 * instruksi internal), sama seperti next-job.
 */
export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const agentName = searchParams.get("agentName");
  if (!agentName) {
    return NextResponse.json({ error: "Query param agentName wajib diisi." }, { status: 400 });
  }

  const task = await prisma.agentTaskRequest.findFirst({
    where: { agentName, status: "pending" },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ task_id: task?.id ?? null, instruction: task?.instruction ?? null });
}

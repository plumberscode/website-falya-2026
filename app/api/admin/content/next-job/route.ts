import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Endpoint machine-to-machine untuk Agent "Content Writer" (crew Python di
 * folder Karyawan AI, `python -m falya_crew.content_writer`, lihat
 * agents.md bagian 7). Dicek DULUAN oleh Python sebelum crew (DeepSeek)
 * dibangun sama sekali -- kalau tidak ada job pending, tidak ada biaya API
 * yang terpakai untuk hal yang tidak perlu dikerjakan.
 *
 * Otentikasi x-agent-secret (reuse AGENT_API_SECRET, pola sama endpoint
 * lain) -- endpoint ini READ-ONLY (tidak mengubah apapun), jadi risikonya
 * rendah, tapi tetap di-gate karena mengungkap keberadaan job internal.
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

  const job = await prisma.contentJobRequest.findFirst({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ job_id: job?.id ?? null, instruction: job?.instruction ?? null });
}

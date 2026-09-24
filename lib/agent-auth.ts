import { NextRequest, NextResponse } from "next/server";

/**
 * Gate x-agent-secret untuk endpoint machine-to-machine agent Python
 * (Karyawan AI) -- logika sama persis yang ditulis inline di
 * app/api/admin/seo/audit-report/route.ts dkk. Return response error
 * (500 kalau secret belum di-set, 401 kalau salah), atau null kalau lolos.
 */
export function rejectUnlessAgent(request: NextRequest): NextResponse | null {
  const expectedSecret = process.env.AGENT_API_SECRET;
  if (!expectedSecret) {
    console.error("AGENT_API_SECRET belum di-set di environment.");
    return NextResponse.json(
      { error: "Server belum dikonfigurasi (AGENT_API_SECRET kosong)." },
      { status: 500 }
    );
  }

  if (request.headers.get("x-agent-secret") !== expectedSecret) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  return null;
}

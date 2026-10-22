import type { NextRequest } from "next/server";
import { clientIp, fetchMemberDashboard } from "@/lib/member/dashboard";
import { renderMemberCard } from "@/lib/member/cardImage";

/** Tombol "Simpan kartu" di dashboard: unduh kartu member sebagai PNG. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await fetchMemberDashboard(token, clientIp(request.headers));
  if (!result.ok) {
    return new Response("Kartu tidak ditemukan", {
      status: result.error === "NOT_FOUND" ? 404 : 503,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
    });
  }
  const { name, memberNumber } = result.data;
  return renderMemberCard(
    { name, memberNumber, token },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
        "Content-Disposition": `attachment; filename="kartu-member-falya-${memberNumber}.png"`,
      },
    }
  );
}

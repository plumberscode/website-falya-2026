import type { NextRequest } from "next/server";
import { clientIp, fetchMemberDashboard } from "@/lib/member/dashboard";

const NO_STORE = {
  "Cache-Control": "no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow",
};

/**
 * Penyegaran dashboard member (dipanggil browser tiap DASHBOARD_POLL_SECONDS
 * selama halaman terlihat). Token tidak dikenal / di-reset / member nonaktif
 * semuanya 404 yang sama, tanpa membedakan alasannya.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await fetchMemberDashboard(token, clientIp(request.headers));
  if (result.ok) return Response.json(result.data, { headers: NO_STORE });
  const status = result.error === "NOT_FOUND" ? 404 : result.error === "RATE_LIMITED" ? 429 : 503;
  return Response.json({ error: result.error }, { status, headers: NO_STORE });
}

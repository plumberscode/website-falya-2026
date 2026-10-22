/**
 * Data dashboard member (falyarisol.com/m/{token}) dari backend POS Falya Hub.
 *
 * Website TIDAK menyimpan poin. Server Next.js memanggil RPC Supabase
 * `member_dashboard(p_secret, p_token, p_client_ip)` milik aplikasi kasir
 * (lihat Falya Hub/app/supabase/sql/member_points.sql). Fungsi itu hanya
 * mengembalikan data member pemilik token, dan menolak panggilan tanpa
 * MEMBER_DASHBOARD_SECRET. Ketiga env di bawah HANYA ada di server (tanpa
 * NEXT_PUBLIC_), jadi browser tidak pernah terhubung ke database POS.
 */

export type HistoryEntry = {
  at: string; // "2026-10-22T11:42" (WITA, tanpa offset)
  type: string;
  points: number;
  note: string;
};

export type MemberDashboardData = {
  token: string;
  name: string;
  memberNumber: string;
  phoneMasked: string;
  balance: number;
  maxBalance: number;
  dailyBonusToday: boolean;
  dailyBonus: number;
  dailyMinIdr: number;
  expiresAt: string; // "2027-10-22"
  nextDoublePointDate: string | null;
  doublePointToday: boolean;
  quarter: string;
  leaderboard: {
    eligible: boolean;
    spenderRank: number | null;
    diligentRank: number | null;
    diligentDays: number;
  };
  rules: {
    spendRateIdr: number;
    maxSpendPointsPerTrx: number;
    dailyBonus: number;
    dailyMinIdr: number;
    maxBalance: number;
    expiryMonths: number;
    maxRedeemPerTrx: number;
    doublePointMultiplier: number;
  };
  pollSeconds: number;
  tiers: { points: number; reward: string }[];
  history: HistoryEntry[];
  updatedAt: string;
};

export type DashboardResult =
  | { ok: true; data: MemberDashboardData }
  | { ok: false; error: "NOT_FOUND" | "RATE_LIMITED" | "UNAVAILABLE" };

// Token kartu: base62, 22-64 karakter (lihat loyalty_new_token)
const TOKEN_PATTERN = /^[A-Za-z0-9]{22,64}$/;

export function isPlausibleToken(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}

/** IP pengunjung asli untuk rate limit per IP di server POS. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

export async function fetchMemberDashboard(token: string, ip: string): Promise<DashboardResult> {
  // Token yang jelas tidak valid tidak perlu sampai ke server POS
  if (!isPlausibleToken(token)) return { ok: false, error: "NOT_FOUND" };

  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const secret = process.env.MEMBER_DASHBOARD_SECRET;
  if (!url || !anonKey || !secret) {
    console.error("SUPABASE_URL / SUPABASE_ANON_KEY / MEMBER_DASHBOARD_SECRET belum di-set.");
    return { ok: false, error: "UNAVAILABLE" };
  }

  try {
    const res = await fetch(`${url}/rest/v1/rpc/member_dashboard`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_secret: secret, p_token: token, p_client_ip: ip }),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("member_dashboard gagal:", res.status, await res.text());
      return { ok: false, error: "UNAVAILABLE" };
    }
    const body = (await res.json()) as (MemberDashboardData & { error?: undefined }) | { error: string };
    if (body && "error" in body && body.error) {
      if (body.error === "NOT_FOUND") return { ok: false, error: "NOT_FOUND" };
      if (body.error === "RATE_LIMITED") return { ok: false, error: "RATE_LIMITED" };
      console.error("member_dashboard menolak:", body.error);
      return { ok: false, error: "UNAVAILABLE" };
    }
    return { ok: true, data: body as MemberDashboardData };
  } catch (err) {
    console.error("member_dashboard error:", err);
    return { ok: false, error: "UNAVAILABLE" };
  }
}

/** URL kartu yang tercetak di QR: sama dengan dashboard_url di aplikasi kasir. */
export function cardUrl(token: string): string {
  return `https://falyarisol.com/m/${token}`;
}

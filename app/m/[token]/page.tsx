import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { cardUrl, clientIp, fetchMemberDashboard } from "@/lib/member/dashboard";
import { qrSvg } from "@/lib/member/qr";
import MemberDashboard from "./MemberDashboard";
import styles from "./member.module.css";

// Halaman pribadi member: tidak diindeks dan tidak di-cache (lihat juga headers di next.config.ts)
export const metadata: Metadata = {
  title: "Poin Member – Falya Risol Mayo",
  description: "Kartu member, saldo poin, dan hadiah Falya Risol Mayo.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  openGraph: {
    title: "Kartu Member Falya Risol Mayo",
    description: "Cek poin & hadiah Kakak di sini. Link ini pribadi, jangan dibagikan.",
    siteName: "Falya Risol Mayo",
    locale: "id_ID",
    type: "website",
  },
};

export default async function MemberPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  // Render awal selalu data terbaru dari server POS; selanjutnya browser menyegarkan lewat /api/m/[token]
  const result = await fetchMemberDashboard(token, clientIp(await headers()));
  if (!result.ok && result.error === "NOT_FOUND") notFound();
  if (!result.ok) {
    return (
      <div className={styles.page}>
        <div className={styles.notice}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/member/falya-logo.png" alt="Falya Risol Mayo" />
          <h1>{result.error === "RATE_LIMITED" ? "Terlalu sering dibuka" : "Sedang ada gangguan"}</h1>
          <p>Coba muat ulang halaman ini sebentar lagi.</p>
        </div>
      </div>
    );
  }
  return <MemberDashboard initial={result.data} qrSvg={await qrSvg(cardUrl(token))} />;
}

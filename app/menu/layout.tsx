import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Menu Risol & Harga Terbaru 2026 | Falya Balikpapan",
  description:
    "Daftar menu risol Falya Balikpapan lengkap: risol mayo, mozza, tuna, mulai Rp 5.000. Plus nasi liwet, snack, kopi & jus. Pesan gampang via WhatsApp.",
  keywords: [
    "daftar menu falya",
    "harga risol mayo balikpapan",
    "menu snack box balikpapan",
    "kuliner balikpapan",
    "falya menu",
  ],
  alternates: {
    canonical: "https://www.falyarisol.com/menu",
  },
  openGraph: {
    title: "Daftar Menu Risol & Harga Terbaru 2026 | Falya Balikpapan",
    description:
      "Daftar menu risol Falya Balikpapan lengkap: risol mayo, mozza, tuna, mulai Rp 5.000. Plus nasi liwet, snack, kopi & jus. Pesan gampang via WhatsApp.",
    url: "https://www.falyarisol.com/menu",
    siteName: "Falya Risol Mayo",
    images: [
      {
        url: "/images/2026/risol-mayo-2026.webp",
        width: 1200,
        height: 630,
        alt: "Daftar Menu Falya Risol Balikpapan",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daftar Menu Risol & Harga Terbaru 2026 | Falya Balikpapan",
    description:
      "Daftar menu risol Falya Balikpapan lengkap: risol mayo, mozza, tuna, mulai Rp 5.000. Plus nasi liwet, snack, kopi & jus. Pesan gampang via WhatsApp.",
    images: ["/images/2026/risol-mayo-2026.webp"],
  },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

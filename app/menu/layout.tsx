import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Menu & Harga Risol, Snack, Kuliner | Falya Balikpapan",
  description:
    "Lihat daftar menu lengkap & harga Falya Risol Mayo Balikpapan. Aneka risol gurih, snack nikmat, aneka jus buah segar, kopi, dan kuliner khas siap pesan via WhatsApp.",
  keywords: [
    "daftar menu falya",
    "harga risol mayo balikpapan",
    "menu snack box balikpapan",
    "kuliner balikpapan",
    "falya menu",
  ],
  alternates: {
    canonical: "https://falyarisol.com/menu",
  },
  openGraph: {
    title: "Daftar Menu & Harga Risol, Snack, Kuliner | Falya Balikpapan",
    description:
      "Lihat daftar menu lengkap & harga Falya Risol Mayo Balikpapan. Pesan mudah via WhatsApp.",
    url: "https://falyarisol.com/menu",
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
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

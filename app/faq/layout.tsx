import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tanya Jawab (FAQ) & Cara Pemesanan | Falya Balikpapan",
  description:
    "Informasi lengkap seputar ketahanan risol mayo, isi paket nasi liwet tampah, pemesanan snack box acara, dan jam operasional Falya di Balikpapan.",
  keywords: [
    "faq falya",
    "cara pesan risol mayo balikpapan",
    "ketahanan risol mayo",
    "lokasi falya balikpapan",
    "kontak falya balikpapan",
  ],
  alternates: {
    canonical: "https://falyarisol.com/faq",
  },
  openGraph: {
    title: "Tanya Jawab (FAQ) & Cara Pemesanan | Falya Balikpapan",
    description:
      "Temukan jawaban seputar produk, pemesanan, dan layanan Falya Balikpapan.",
    url: "https://falyarisol.com/faq",
    siteName: "Falya Risol Mayo",
    images: [
      {
        url: "/images/restaurant-menu.webp",
        width: 1200,
        height: 630,
        alt: "Pusat Bantuan & FAQ Falya Balikpapan",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

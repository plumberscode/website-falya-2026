import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paket Nasi Liwet Kotak & Tampah Balikpapan | Falya",
  description:
    "Sajikan kelezatan nasi liwet ayam serundeng, ayam bakar, nila goreng/bakar, dan paket nasi liwet tampah khas Falya untuk berbagai acara dan syukuran di Balikpapan.",
  keywords: [
    "nasi liwet balikpapan",
    "nasi liwet tampah balikpapan",
    "nasi kotak balikpapan",
    "nasi liwet ayam serundeng balikpapan",
    "catering nasi liwet balikpapan",
    "kuliner liwet balikpapan",
  ],
  alternates: {
    canonical: "https://falyarisol.com/nasi-liwet",
  },
  openGraph: {
    title: "Paket Nasi Liwet Kotak & Tampah Balikpapan | Falya",
    description:
      "Paket nasi liwet otentik kotak & tampah di Balikpapan. Pas untuk acara kantor, keluarga, dan syukuran.",
    url: "https://falyarisol.com/nasi-liwet",
    siteName: "Falya Risol Mayo",
    images: [
      {
        url: "/images/2026/liwet-ayam-bakar.webp",
        width: 1200,
        height: 630,
        alt: "Paket Nasi Liwet Falya Balikpapan",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function NasiLiwetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

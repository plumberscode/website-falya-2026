import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paket Nasi Liwet Sunda Kotak & Tampah Balikpapan | Falya",
  description:
    "Nasi liwet sunda ala Falya Balikpapan: ayam goreng serundeng, ayam bakar, nila goreng/bakar, hingga paket tampah untuk syukuran & acara. Pesan via WhatsApp.",
  keywords: [
    "nasi liwet balikpapan",
    "nasi liwet tampah balikpapan",
    "nasi kotak balikpapan",
    "nasi liwet ayam serundeng balikpapan",
    "catering nasi liwet balikpapan",
    "kuliner liwet balikpapan",
    "nasi liwet sunda balikpapan",
    "nasi liwet sunda",
  ],
  alternates: {
    canonical: "https://www.falyarisol.com/nasi-liwet",
  },
  openGraph: {
    title: "Paket Nasi Liwet Sunda Kotak & Tampah Balikpapan | Falya",
    description:
      "Nasi liwet sunda ala Falya Balikpapan: ayam goreng serundeng, ayam bakar, nila goreng/bakar, hingga paket tampah untuk syukuran & acara. Pesan via WhatsApp.",
    url: "https://www.falyarisol.com/nasi-liwet",
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
  twitter: {
    card: "summary_large_image",
    title: "Paket Nasi Liwet Sunda Kotak & Tampah Balikpapan | Falya",
    description:
      "Nasi liwet sunda ala Falya Balikpapan: ayam goreng serundeng, ayam bakar, nila goreng/bakar, hingga paket tampah untuk syukuran & acara. Pesan via WhatsApp.",
    images: ["/images/2026/liwet-ayam-bakar.webp"],
  },
};

export default function NasiLiwetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

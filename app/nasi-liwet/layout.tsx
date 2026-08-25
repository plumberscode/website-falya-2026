import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nasi Liwet Tampah & Ayam Bakar Balikpapan | Pesan Sekarang | Falya",
  description:
    "Pesan nasi liwet enak di Balikpapan: paket ayam bakar, goreng, kremes, nila & tampah untuk berbagai acara. Chat Falya via WhatsApp.",
  alternates: {
    canonical: "/nasi-liwet",
  },
  openGraph: {
    title: "Nasi Liwet Tampah & Ayam Bakar Balikpapan | Pesan Sekarang | Falya",
    description:
      "Nasi liwet ayam bakar, goreng, kremes, nila & tampah untuk berbagai acara di Balikpapan. Pesan via WhatsApp.",
    url: "https://falyarisol.com/nasi-liwet",
  },
};

export default function NasiLiwetLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

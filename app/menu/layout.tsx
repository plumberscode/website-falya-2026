import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Menu & Harga Risol, Nasi Liwet, Snack Box Balikpapan | Falya",
  description:
    "Lihat daftar menu lengkap Falya Risol Mayo di Balikpapan: risol mayo renyah, nasi liwet, snack box & kue nampan. Pesan mudah via WhatsApp.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title:
      "Daftar Menu & Harga Risol, Nasi Liwet, Snack Box Balikpapan | Falya",
    description:
      "Daftar menu lengkap Falya Risol Mayo di Balikpapan: risol mayo, nasi liwet, snack box & kue nampan.",
    url: "https://falyarisol.com/menu",
  },
};

export default function MenuLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

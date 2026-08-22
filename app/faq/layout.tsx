import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ Risol Mayo, Nasi Liwet & Snack Box Balikpapan | Falya",
  description:
    "Jawaban atas pertanyaan tentang risol mayo tahan berapa lama, isi nasi liwet tampah, isi & harga snack box untuk acara, serta cara pemesanan di Falya Balikpapan.",
  openGraph: {
    title: "FAQ Risol Mayo, Nasi Liwet & Snack Box Balikpapan | Falya",
    description:
      "Risol mayo tahan berapa lama, isi nasi liwet tampah, isi & harga snack box acara, dan cara pemesanan di Falya Balikpapan.",
  },
};

export default function FaqLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

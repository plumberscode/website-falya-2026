import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jual Snack Box Balikpapan untuk Acara, Kantor & Hajatan | Falya",
  description:
    "Snack box & kue nampan Balikpapan untuk rapat kantor, tahlilan, pengajian, dan hajatan. Pesan snack box kekinian dari Falya via WhatsApp.",
  alternates: {
    canonical: "/snackbox",
  },
  openGraph: {
    title: "Jual Snack Box Balikpapan untuk Acara, Kantor & Hajatan | Falya",
    description:
      "Snack box & kue nampan untuk rapat kantor, tahlilan, pengajian, dan hajatan di Balikpapan. Pesan via WhatsApp.",
    url: "https://falyarisol.com/snackbox",
  },
};

export default function SnackboxLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}

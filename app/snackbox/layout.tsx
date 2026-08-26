import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paket Snack Box & Kue Nampan Balikpapan | Falya Risol",
  description:
    "Pesan paket snack box mini, reguler, komplit, dan kue nampan lezat di Balikpapan. Pilihan terbaik untuk rapat kantor, pengajian, hajatan, & arisan. Pesan praktis via WhatsApp.",
  keywords: [
    "snack box balikpapan",
    "jual snack box balikpapan",
    "snack box kantor balikpapan",
    "snack box pengajian balikpapan",
    "kue nampan balikpapan",
    "paket snack box murah balikpapan",
    "catering snack balikpapan",
  ],
  alternates: {
    canonical: "https://falyarisol.com/snackbox",
  },
  openGraph: {
    title: "Paket Snack Box & Kue Nampan Balikpapan | Falya Risol",
    description:
      "Pilihan paket snack box dan kue nampan untuk berbagai acara di Balikpapan. Praktis dan lezat.",
    url: "https://falyarisol.com/snackbox",
    siteName: "Falya Risol Mayo",
    images: [
      {
        url: "/images/2026/snackbox01.webp",
        width: 1200,
        height: 630,
        alt: "Paket Snack Box Falya Balikpapan",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function SnackboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

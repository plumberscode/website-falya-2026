import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snack Box & Kue Nampan Balikpapan | Meeting, Rapat & Acara | Falya Risol",
  description:
    "Paket snack box mini, reguler, komplit & kue nampan Balikpapan untuk rapat kantor, pengajian, hajatan, arisan. Mulai Rp13.000/box. WhatsApp 085954227622.",
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
    canonical: "https://www.falyarisol.com/snackbox",
  },
  openGraph: {
    title: "Snack Box & Kue Nampan Balikpapan | Meeting, Rapat & Acara | Falya Risol",
    description:
      "Paket snack box mini, reguler, komplit & kue nampan Balikpapan untuk rapat kantor, pengajian, hajatan, arisan. Mulai Rp13.000/box. WhatsApp 085954227622.",
    url: "https://www.falyarisol.com/snackbox",
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

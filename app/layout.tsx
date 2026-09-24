import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSheet from "@/components/cart/CartSheet";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { Toaster } from "@/components/ui/sonner";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import { FALYA_CONTACT } from "@/lib/data/menuData";
import { buildReviewJsonLd } from "@/lib/seo/reviewJsonLd";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.falyarisol.com"),
  title: "Risol Enak di Balikpapan | Risol Mayo & Nasi Liwet – Falya",
  description:
    "Risol mayo renyah hangat, nasi liwet, snack box & kue nampan enak di Balikpapan. Pesan mudah via WhatsApp — untuk acara kantor dan hajatan.",
  keywords: [
    "risol enak di balikpapan",
    "risol mayo balikpapan",
    "falya risol mayo balikpapan",
    "nasi liwet balikpapan",
    "nasi liwet tampah balikpapan",
    "snack box balikpapan",
    "jual snack box balikpapan",
    "snack box acara kantor balikpapan",
    "nasi kotak balikpapan",
    "kue nampan balikpapan",
    "catering balikpapan harian",
    "kuliner balikpapan",
  ],
  authors: [{ name: "Falya Risol Mayo" }],
  icons: {
    icon: "/images/favicon-falya.png",
  },
  openGraph: {
    title: "Risol Enak di Balikpapan | Risol Mayo & Nasi Liwet – Falya",
    description:
      "Risol mayo renyah, nasi liwet otentik, snack box & kue nampan untuk berbagai acara di Balikpapan. Pesan via WhatsApp.",
    url: "https://www.falyarisol.com",
    siteName: "Falya Risol Mayo",
    images: [
      {
        url: "/images/restaurant-menu.webp",
        width: 1200,
        height: 630,
        alt: "Falya Risol Mayo & Nasi Liwet",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
  // Verifikasi kepemilikan Google Search Console (metode HTML tag). JANGAN
  // dihapus -- kalau hilang, verifikasi gugur dan service account agent SEO
  // (Karyawan AI) kehilangan akses data Search Console (403).
  verification: {
    google: "drldupYqNuj_0TwNcpfVT3SBZabLk7wxbpsasUW0rX8",
  },
};

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "Falya Risol Mayo",
  image: "https://www.falyarisol.com/images/logo-risol-mayo.webp",
  url: "https://www.falyarisol.com",
  telephone: "+6285954227622",
  priceRange: "Rp",
  servesCuisine: ["Risol Mayo", "Nasi Liwet", "Snack Box", "Kue Nampan"],
  address: {
    "@type": "PostalAddress",
    streetAddress: FALYA_CONTACT.address,
    addressLocality: "Balikpapan",
    addressRegion: "Kalimantan Timur",
    addressCountry: "ID",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "18:00",
    },
  ],
  sameAs: [
    `https://www.instagram.com/${FALYA_CONTACT.instagram.replace("@", "")}`,
  ],
  // Angka asli dari Google Business Profile Falya (dikonfirmasi manual,
  // bukan hasil hitung dari 5 testimoni pilihan di bawah) — update manual
  // kalau rating/jumlah ulasan di Google Maps berubah.
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "59",
    bestRating: "5",
  },
  // Review individual dari testimoni Google Maps yang tampil di
  // TestimonialSlider (homepage) — lihat catatan di lib/seo/reviewJsonLd.ts.
  review: buildReviewJsonLd(),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={sans.variable}>
      <body className="bg-[#fdfbfc] text-[#241b18] font-sans antialiased selection:bg-[#f3d5e3] selection:text-[#861f53] min-h-screen flex flex-col">
        {/* strategy="lazyOnload" (bukan default "afterInteractive"): analytics
            pihak ketiga TIDAK KRITIS untuk render awal, jadi ditunda sampai
            browser idle -- praktik umum untuk script non-kritis, terlepas
            dari NO_LCP di homepage (sempat dicurigai terkait script ini,
            tapi sudah dikonfirmasi TIDAK -- NO_LCP tetap muncul walau
            Ahrefs dimatikan total saat investigasi). Akar penyebab NO_LCP
            masih belum diketahui pasti, kemungkinan besar karakteristik lab
            test Lighthouse untuk halaman ini, bukan bug spesifik yang bisa
            di-patch satu baris. */}
        <Script
          id="ahrefs-analytics"
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="XQbMYubDj4Ziw2NF/9RANQ"
          strategy="lazyOnload"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
        <SmoothScrollProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
          <CartSheet />
          <WhatsAppFAB />
          <Toaster richColors position="top-center" offset={{ top: 76 }} />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

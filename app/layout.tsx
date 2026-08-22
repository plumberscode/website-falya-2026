import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSheet from "@/components/cart/CartSheet";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { Toaster } from "@/components/ui/sonner";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import { FALYA_CONTACT } from "@/lib/data/menuData";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://falyarisol.com"),
  title: "Risol Enak di Balikpapan | Risol Mayo & Nasi Liwet – Falya",
  description:
    "Risol mayo renyah hangat, nasi liwet, snack box & kue nampan enak di Balikpapan. Pesan mudah via WhatsApp — untuk acara kantor, tahlilan, dan hajatan.",
  keywords: [
    "risol enak di balikpapan",
    "risol mayo balikpapan",
    "falya risol mayo balikpapan",
    "nasi liwet balikpapan",
    "nasi liwet tampah balikpapan",
    "snack box balikpapan",
    "jual snack box balikpapan",
    "snack box acara kantor balikpapan",
    "snack box tahlilan balikpapan",
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
    url: "https://falyarisol.com",
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
};

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "Falya Risol Mayo",
  image: "https://falyarisol.com/images/logo-risol-mayo.webp",
  url: "https://falyarisol.com",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${sans.variable} scroll-smooth`}>
      <body className="bg-[#fdfbfc] text-[#241b18] font-sans antialiased selection:bg-[#f3d5e3] selection:text-[#861f53] min-h-screen flex flex-col">
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

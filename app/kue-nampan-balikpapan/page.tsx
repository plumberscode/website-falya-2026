import type { Metadata } from "next";
import { getAllMenuItems } from "@/app/actions/menu";
import KueNampanPageClient from "@/components/menu/KueNampanPageClient";
import {
  buildKueNampanProductJsonLd,
  buildKueNampanFaqJsonLd,
} from "@/lib/seo/kueNampanJsonLd";

const PAGE_URL = "https://www.falyarisol.com/kue-nampan-balikpapan";

async function getKueNampanItems() {
  const items = await getAllMenuItems();
  return items.filter((item) => item.category === "kue-nampan");
}

// generateMetadata dinamis (bukan static `metadata` export seperti
// /snackbox, /menu, /nasi-liwet) karena deskripsi harus menyisipkan harga
// terendah live dari database, bukan angka hardcode.
export async function generateMetadata(): Promise<Metadata> {
  const kueNampanItems = await getKueNampanItems();
  const lowestPrice =
    kueNampanItems.length > 0
      ? Math.min(...kueNampanItems.map((item) => item.price))
      : 0;
  const lowestPriceLabel = `Rp${lowestPrice.toLocaleString("id-ID")}`;

  const title = "Kue Nampan Balikpapan - Paket Arisan & Acara | Falya Risol";
  const description = `Pesan kue nampan Balikpapan siap antar untuk arisan, acara keluarga, & acara kantor. Varian lengkap, harga mulai ${lowestPriceLabel}. Order via WhatsApp, proses cepat.`;

  return {
    title,
    description,
    alternates: {
      canonical: PAGE_URL,
    },
    openGraph: {
      title,
      description,
      url: PAGE_URL,
      siteName: "Falya Risol Mayo",
      images: [
        {
          url: "/images/snackbox/kue-nampan-01.webp",
          width: 1200,
          height: 630,
          alt: "Kue Nampan Balikpapan Falya Risol Mayo",
        },
      ],
      locale: "id_ID",
      type: "website",
    },
  };
}

// Statis per-deployment (revalidate: false) — freshness ditangani
// revalidatePath("/kue-nampan-balikpapan") di app/actions/menu.ts saat
// admin edit menu.
export const revalidate = false;

export default async function KueNampanPage() {
  const kueNampanItems = await getKueNampanItems();
  const productJsonLd = buildKueNampanProductJsonLd(kueNampanItems);
  const faqJsonLd = buildKueNampanFaqJsonLd();

  return (
    <>
      {/* Product per item kue nampan, dihitung dari `kueNampanItems` di atas
          supaya harga & ketersediaan di structured data selalu sinkron
          dengan yang tampil di halaman. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <KueNampanPageClient items={kueNampanItems} />
    </>
  );
}

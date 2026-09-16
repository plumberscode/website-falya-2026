import { MenuItem } from "@/lib/data/menuData";
import { KUE_NAMPAN_FAQ } from "@/lib/data/kueNampanFaq";

const SITE_URL = "https://www.falyarisol.com";
const PAGE_URL = `${SITE_URL}/kue-nampan-balikpapan`;

// Gambar item bisa berupa path relatif ("/images/...", seed data) atau URL
// absolut (mis. upload admin ke Cloudinary) — pola sama seperti
// lib/seo/snackboxJsonLd.ts. Jangan prefix SITE_URL kalau sudah absolut.
function toAbsoluteImageUrl(image: string): string {
  return image.startsWith("http") ? image : `${SITE_URL}${image}`;
}

/**
 * Generate JSON-LD (schema.org Product) untuk tiap item kue nampan di
 * halaman /kue-nampan-balikpapan. Beda dari buildSnackboxJsonLd (yang
 * aggregate per kategori dengan AggregateOffer), di sini tiap item adalah
 * SKU dengan harga pasti sendiri, jadi satu Product + Offer per item —
 * dihitung langsung dari `items` (data yang sama yang dirender ke UI),
 * bukan angka hardcode.
 */
export function buildKueNampanProductJsonLd(items: MenuItem[]) {
  const products = items.map((item) => ({
    "@type": "Product",
    name: `${item.name} - Falya Risol Mayo`,
    description: item.description,
    category: "Kue Nampan",
    image: toAbsoluteImageUrl(item.image),
    url: PAGE_URL,
    brand: {
      "@type": "Brand",
      name: "Falya Risol Mayo",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: String(item.price),
      availability: item.isAvailable
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: PAGE_URL,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@graph": products,
  };
}

/**
 * Generate JSON-LD (schema.org FAQPage) dari KUE_NAMPAN_FAQ — single
 * source of truth yang sama dipakai untuk render FAQ di UI, supaya
 * schema tidak pernah mismatch dengan konten yang tampil.
 */
export function buildKueNampanFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: KUE_NAMPAN_FAQ.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

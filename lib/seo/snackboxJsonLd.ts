import {
  MenuItem,
  SNACKBOX_ITEM_CATEGORIES,
} from "@/lib/data/menuData";
import { SNACKBOX_FAQ } from "@/lib/data/snackboxFaq";

const SITE_URL = "https://www.falyarisol.com";
const SNACKBOX_URL = `${SITE_URL}/snackbox`;

// Label per kategori khusus untuk structured data — tetap konsisten dengan
// label tab yang tampil di halaman (lihat SNACKBOX_CATEGORIES di menuData.ts).
const CATEGORY_LABELS: Record<
  (typeof SNACKBOX_ITEM_CATEGORIES)[number],
  string
> = {
  "snackbox-mini": "Snack Box Mini",
  "snackbox-reguler": "Snack Box Reguler",
  "snackbox-komplit": "Snack Box Komplit",
  "kue-nampan": "Paket Kue Nampan",
};

// Gambar item bisa berupa path relatif ("/images/...", seed data) atau URL
// absolut (mis. upload admin ke Cloudinary) — lihat pola yang sama di
// components/blog/BlogImage.tsx. Jangan prefix SITE_URL kalau sudah absolut.
function toAbsoluteImageUrl(image: string): string {
  return image.startsWith("http") ? image : `${SITE_URL}${image}`;
}

/**
 * Generate JSON-LD (schema.org Product + AggregateOffer) untuk halaman
 * /snackbox, satu Product per kategori (Mini, Reguler, Komplit, Kue Nampan).
 *
 * lowPrice/highPrice/offerCount dihitung langsung dari `items` (data menu
 * yang sama yang dirender ke UI) — bukan angka hardcode — supaya kalau
 * harga di database berubah, JSON-LD otomatis ikut berubah dan tidak
 * pernah mismatch dengan apa yang tampil di halaman.
 */
export function buildSnackboxJsonLd(items: MenuItem[]) {
  const products = SNACKBOX_ITEM_CATEGORIES.map((categoryId) => {
    const categoryItems = items.filter(
      (item) => item.category === categoryId && item.isAvailable,
    );
    if (categoryItems.length === 0) return null;

    const prices = categoryItems.map((item) => item.price);
    const lowPrice = Math.min(...prices);
    const highPrice = Math.max(...prices);

    return {
      "@type": "Product",
      name: `${CATEGORY_LABELS[categoryId]} - Falya Risol Mayo`,
      category: "Snack Box",
      image: toAbsoluteImageUrl(categoryItems[0].image),
      url: SNACKBOX_URL,
      brand: {
        "@type": "Brand",
        name: "Falya Risol Mayo",
      },
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "IDR",
        lowPrice: String(lowPrice),
        highPrice: String(highPrice),
        offerCount: String(categoryItems.length),
        availability: "https://schema.org/InStock",
        url: SNACKBOX_URL,
      },
    };
  }).filter((product): product is NonNullable<typeof product> => product !== null);

  return {
    "@context": "https://schema.org",
    "@graph": products,
  };
}

/**
 * Generate JSON-LD (schema.org FAQPage) dari SNACKBOX_FAQ — single source
 * of truth yang sama dipakai untuk render FAQ di UI (SnackboxPageClient),
 * supaya schema tidak pernah mismatch dengan konten yang tampil.
 */
export function buildSnackboxFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: SNACKBOX_FAQ.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

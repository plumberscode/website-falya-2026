import { getAllMenuItems } from "@/app/actions/menu";
import SnackboxPageClient from "@/components/menu/SnackboxPageClient";
import {
  buildSnackboxJsonLd,
  buildSnackboxFaqJsonLd,
} from "@/lib/seo/snackboxJsonLd";

// Statis per-deployment (revalidate: false) — lihat catatan lengkap
// di app/menu/page.tsx. revalidatePath("/snackbox") di
// app/actions/menu.ts sudah menangani freshness saat admin edit menu.
export const revalidate = false;

export default async function SnackboxPage() {
  const items = await getAllMenuItems();
  const snackboxJsonLd = buildSnackboxJsonLd(items);
  const faqJsonLd = buildSnackboxFaqJsonLd();

  return (
    <>
      {/* Product + AggregateOffer per kategori snack box, dihitung dari
          `items` di atas supaya Google (termasuk AI Overview) baca range
          harga per kategori yang akurat, bukan cuma harga item termahal. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(snackboxJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <SnackboxPageClient items={items} />
    </>
  );
}

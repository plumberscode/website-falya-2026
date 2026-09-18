// Single source of truth untuk FAQ halaman /snackbox — dipakai oleh
// SnackboxPageClient.tsx (render UI) dan lib/seo/snackboxJsonLd.ts
// (FAQPage schema), supaya keduanya tidak bisa mismatch satu sama lain.
// Pola sama seperti KUE_NAMPAN_FAQ di lib/data/kueNampanFaq.ts.
export interface SnackboxFaqItem {
  question: string;
  answer: string;
}

export const SNACKBOX_FAQ: SnackboxFaqItem[] = [
  {
    question: "Bisa custom isi snack box buat rapat kantor?",
    answer:
      "Bisa banget. Kamu bisa mix isi snack sesuai budget dan jumlah peserta rapat — tinggal chat mimin buat konsultasi paket. Harga mengikuti paket yang tersedia di katalog (Mini, Reguler, Komplit).",
  },
  {
    question: "Berapa lama sebelum acara harus pesan?",
    answer:
      "Disarankan pesan H-1 untuk memastikan ketersediaan, terutama untuk jumlah besar atau acara mendadak bisa tanya dulu ke mimin.",
  },
];

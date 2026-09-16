// Single source of truth untuk FAQ halaman /kue-nampan-balikpapan — dipakai
// oleh KueNampanPageClient.tsx (render UI) dan lib/seo/kueNampanJsonLd.ts
// (FAQPage schema), supaya keduanya tidak bisa mismatch satu sama lain.
// Pola sama seperti SNACKBOX_ITEM_CATEGORIES di menuData.ts.
export interface KueNampanFaqItem {
  question: string;
  answer: string;
}

export const KUE_NAMPAN_FAQ: KueNampanFaqItem[] = [
  {
    question: "Minimal order kue nampan berapa nampan?",
    answer:
      "Minimal order kue nampan Falya adalah 1 nampan. Untuk acara besar seperti arisan atau acara keluarga, kamu bisa pesan beberapa nampan sekaligus — tinggal sesuaikan jumlah tamu.",
  },
  {
    question: "Bisa custom isi kue nampan?",
    answer:
      "Bisa. Kamu bisa mix isi kue sesuai selera dan budget acara — tinggal chat mimin untuk konsultasi kombinasi isi yang kamu mau.",
  },
  {
    question: "Area pengiriman kue nampan sampai mana?",
    answer:
      "Kue nampan Falya bisa diantar ke seluruh area Balikpapan. Untuk lokasi di luar area tersebut, silakan konfirmasi dulu ke mimin via WhatsApp.",
  },
  {
    question: "Berapa lama sebelum acara harus pesan kue nampan?",
    answer:
      "Disarankan pesan minimal H-1 sebelum acara agar kue tetap fresh dan persiapan bisa maksimal, terutama untuk pesanan dalam jumlah banyak seperti arisan atau acara keluarga.",
  },
];

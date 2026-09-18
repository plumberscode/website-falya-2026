// Single source of truth untuk FAQ halaman /nasi-liwet — dipakai oleh
// NasiLiwetPageClient.tsx (render UI) dan lib/seo/nasiLiwetJsonLd.ts
// (FAQPage schema), supaya keduanya tidak bisa mismatch satu sama lain.
// Pola sama seperti SNACKBOX_FAQ (lib/data/snackboxFaq.ts) dan
// KUE_NAMPAN_FAQ (lib/data/kueNampanFaq.ts).
export interface NasiLiwetFaqItem {
  question: string;
  answer: string;
  // Bagian dari `answer` yang dirender sebagai hyperlink di UI (lihat
  // components/menu/FaqAccordionItem.tsx) — `answer` harus mengandung
  // `link.matchText` persis sekali. Structured data (FAQPage) tetap pakai
  // `answer` apa adanya sebagai plain text karena schema.org tidak
  // memerlukan markup link di dalamnya.
  link?: {
    matchText: string;
    href: string;
  };
}

export const NASI_LIWET_FAQ: NasiLiwetFaqItem[] = [
  {
    question: "Apa bedanya paket kotak dan paket tampah?",
    answer:
      "Paket kotak (Paket Ayam A–D, Nila E–H) itu porsi individual, cocok buat konsumsi per orang di rapat atau acara kantor. Paket tampah (10 & 15 porsi) disajikan dalam satu wadah besar, lebih pas buat acara keluarga, syukuran, atau kumpul bareng di rumah.",
  },
  {
    question: "Minimal order nasi liwet berapa porsi?",
    answer:
      "Untuk paket kotak, bisa pesan mulai dari beberapa porsi sesuai kebutuhan. Untuk paket tampah, minimal order mulai dari Tampah 10 Porsi. Mau tahu estimasi jumlah dan budget yang pas buat acaramu? Cek panduan porsi & budget nasi liwet di sini, atau langsung chat mimin.",
    link: {
      matchText: "di sini",
      href: "/blog/panduan-nasi-liwet-untuk-acara-balikpapan-porsi-budget-falya",
    },
  },
  {
    question: "Bisa custom lauk nasi liwet?",
    answer:
      "Bisa banget. Kamu bisa mix lauk sesuai selera untuk paket nasi liwet tampah — mau lebih banyak ayam, nila, atau nambah urap, bahkan tambah menu lain, tinggal chat mimin buat konsultasi kombinasi dan harganya.",
  },
  {
    question: "Berapa lama sebelum acara harus pesan nasi liwet?",
    answer:
      "Disarankan reservasi minimal H-1 sebelum acara, terutama untuk paket tampah atau pesanan dalam jumlah banyak, supaya kami bisa menyediakan bahan-bahan yang diperlukan.",
  },
  {
    question: "Area pengiriman nasi liwet sampai mana?",
    answer:
      "Falya siap antar nasi liwet ke seluruh area Balikpapan. Untuk lokasi di luar area tersebut, konfirmasi dulu ya ke mimin via WhatsApp.",
  },
  {
    question: "Nasi liwet Falya beneran otentik Sunda dan halal?",
    answer:
      "Iya, nasi liwet Falya dimasak dengan resep khas Sunda, tanpa santan dan 100% halal serta higienis dari bahan baku sampai proses masaknya.",
  },
];

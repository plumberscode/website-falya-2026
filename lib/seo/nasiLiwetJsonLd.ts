import { NASI_LIWET_FAQ } from "@/lib/data/nasiLiwetFaq";

/**
 * Generate JSON-LD (schema.org FAQPage) dari NASI_LIWET_FAQ — single
 * source of truth yang sama dipakai untuk render FAQ di UI
 * (NasiLiwetPageClient), supaya schema tidak pernah mismatch dengan
 * konten yang tampil. Pola sama seperti buildKueNampanFaqJsonLd /
 * buildSnackboxFaqJsonLd.
 */
export function buildNasiLiwetFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: NASI_LIWET_FAQ.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

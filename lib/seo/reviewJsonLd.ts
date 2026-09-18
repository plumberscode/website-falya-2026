import { TESTIMONIALS } from "@/lib/data/testimonials";

/**
 * Generate schema.org Review[] dari TESTIMONIALS — single source of truth
 * yang sama dipakai untuk render slider testimoni di homepage
 * (TestimonialSlider), supaya schema tidak pernah mismatch dengan konten
 * yang benar-benar tampil.
 *
 * Dipasang sebagai `review` di FoodEstablishment schema (app/layout.tsx).
 * `aggregateRating` didefinisikan terpisah langsung di app/layout.tsx
 * dengan angka asli dari Google Business Profile Falya (bukan dihitung
 * dari 5 testimoni pilihan ini) — update manual di sana kalau rating atau
 * jumlah ulasan di Google Maps berubah.
 */
export function buildReviewJsonLd() {
  return TESTIMONIALS.map((testimonial) => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: testimonial.name,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(testimonial.rating),
      bestRating: "5",
    },
    reviewBody: testimonial.text,
  }));
}

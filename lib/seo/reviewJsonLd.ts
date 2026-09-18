import { TESTIMONIALS } from "@/lib/data/testimonials";

/**
 * Generate schema.org Review[] dari TESTIMONIALS — single source of truth
 * yang sama dipakai untuk render slider testimoni di homepage
 * (TestimonialSlider), supaya schema tidak pernah mismatch dengan konten
 * yang benar-benar tampil.
 *
 * Dipasang sebagai `review` di FoodEstablishment schema (app/layout.tsx).
 * Catatan: `aggregateRating` SENGAJA belum ditambahkan di sini karena harus
 * mencerminkan rating & jumlah review asli dari Google Business Profile
 * Falya, bukan hasil hitung dari 5 testimoni pilihan ini — pakai angka
 * asli dari Google Maps saat menambahkannya, jangan menebak.
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

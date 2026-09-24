import { htmlToText } from "@/lib/utils";

export interface BlogFaqEntry {
  question: string;
  answer: string;
}

// Heading section FAQ: "FAQ", "FAQ Seputar Snack Box", "Pertanyaan yang
// Sering Ditanyakan", dst.
const FAQ_HEADING_PATTERN = /\b(faq|pertanyaan)\b/i;

/**
 * Ambil pasangan tanya-jawab dari blok FAQ di konten artikel (HTML TipTap).
 * Format yang dikenali = format yang diwajibkan ke Content Writer
 * (Karyawan AI/src/falya_crew/content_crew.py): `<h2>FAQ</h2>` lalu satu
 * `<h3>` per pertanyaan, jawaban = semua isi setelah `<h3>` itu sampai
 * `<h3>`/`<h2>` berikutnya. Artikel manual dengan format sama ikut
 * terbaca; artikel tanpa blok FAQ -> array kosong.
 */
export function extractBlogFaq(html: string): BlogFaqEntry[] {
  let sectionStart = -1;
  for (const match of html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)) {
    if (FAQ_HEADING_PATTERN.test(htmlToText(match[1]))) {
      sectionStart = (match.index ?? 0) + match[0].length;
      break;
    }
  }
  if (sectionStart < 0) return [];

  const rest = html.slice(sectionStart);
  const nextH2 = rest.search(/<h2\b/i);
  const section = nextH2 >= 0 ? rest.slice(0, nextH2) : rest;

  const entries: BlogFaqEntry[] = [];
  for (const part of section.split(/<h3\b[^>]*>/i).slice(1)) {
    const closeIndex = part.search(/<\/h3>/i);
    if (closeIndex < 0) continue;
    const question = htmlToText(part.slice(0, closeIndex));
    const answer = htmlToText(part.slice(closeIndex + "</h3>".length));
    if (question && answer) entries.push({ question, answer });
  }
  return entries;
}

/**
 * JSON-LD FAQPage untuk artikel blog, atau null kalau artikel tidak punya
 * blok FAQ. Shape sama seperti buildNasiLiwetFaqJsonLd -- bedanya sumbernya
 * konten artikel itu sendiri, jadi schema selalu cocok dengan yang tampil.
 */
export function buildBlogFaqJsonLd(html: string) {
  const faq = extractBlogFaq(html);
  if (faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}

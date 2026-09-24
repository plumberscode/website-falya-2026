import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getAllCategories } from "@/app/actions/blog";
import BlogPostCard from "@/components/blog/BlogPostCard";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog & Artikel Kuliner | Falya Risol Balikpapan",
  description:
    "Kumpulan tips, rekomendasi menu, panduan memilih snack box kantor, nasi liwet, dan aneka kuliner lezat dari Falya Risol Balikpapan.",
  alternates: {
    canonical: "https://www.falyarisol.com/blog",
  },
  openGraph: {
    title: "Blog & Artikel Kuliner | Falya Risol Balikpapan",
    description:
      "Kumpulan tips, rekomendasi menu, panduan memilih snack box kantor, nasi liwet, dan aneka kuliner lezat dari Falya Risol Balikpapan.",
    url: "https://www.falyarisol.com/blog",
    siteName: "Falya Risol",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "https://www.falyarisol.com/images/2026/snackbox01.webp",
        width: 1200,
        height: 630,
        alt: "Blog & Artikel Kuliner Falya Risol Balikpapan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog & Artikel Kuliner | Falya Risol Balikpapan",
    description:
      "Kumpulan tips, rekomendasi menu, panduan memilih snack box kantor, nasi liwet, dan aneka kuliner lezat dari Falya Risol Balikpapan.",
    images: ["https://www.falyarisol.com/images/2026/snackbox01.webp"],
  },
};

export const revalidate = 60; // ISR cache revalidation

export default async function BlogIndexPage(props: { searchParams: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams;
  const currentCategory = searchParams.category;
  
  // Halaman blog publik HANYA menampilkan artikel yang sudah terbit (isPublished: true)
  const posts = await getAllPosts(false, currentCategory);
  const categories = await getAllCategories();

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <BookOpen className="w-4 h-4" />
            Artikel & Informasi
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Blog <span className="text-emerald-600 dark:text-emerald-400">Falya</span>
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">
            Temukan inspirasi sajian kuliner, tips memilih paket snack box, dan cerita menarik di balik kelezatan menu kami.
          </p>
        </div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                !currentCategory
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              Semua Topik
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  currentCategory === cat
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        {/* Blog Post Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8">
            <p className="text-zinc-500 text-lg mb-4">
              {currentCategory ? `Belum ada artikel di kategori "${currentCategory}".` : "Belum ada artikel yang dipublikasikan."}
            </p>
            {!currentCategory && (
              <Link
                href="/admin/blog/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition shadow-sm"
              >
                Tulis Artikel Pertama
              </Link>
            )}
            {currentCategory && (
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition shadow-sm"
              >
                Lihat Semua Artikel
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

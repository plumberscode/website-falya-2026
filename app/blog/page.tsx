import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getAllCategories } from "@/app/actions/blog";
import { getAdminSession } from "@/lib/auth";
import BlogImage from "@/components/blog/BlogImage";
import { Calendar, ArrowRight, BookOpen, Tag, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog & Artikel | Falya Risol",
  description:
    "Kumpulan tips, resep, dan informasi seputar aneka camilan, snack box, dan kuliner premium dari Falya.",
  alternates: {
    canonical: "https://falyarisol.com/blog",
  },
};

export const revalidate = 60; // ISR cache revalidation

export default async function BlogIndexPage(props: { searchParams: Promise<{ category?: string }> }) {
  const searchParams = await props.searchParams;
  const currentCategory = searchParams.category;
  
  const session = await getAdminSession();
  const posts = await getAllPosts(!!session, currentCategory);
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
              <article
                key={post.id}
                className="group flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative"
              >
                {post.category && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-sm border border-white/20 dark:border-zinc-700/50">
                      <Tag className="w-3 h-3" />
                      {post.category}
                    </span>
                  </div>
                )}
                {post.imageUrl && (
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <BlogImage
                      src={post.imageUrl}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <time dateTime={(post.publishedAt || post.createdAt).toISOString()}>
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                    </div>

                    <h2 className="text-xl font-bold tracking-tight mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-2">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {post.metaDescription && (
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-3 mb-4">
                        {post.metaDescription}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:gap-2.5 transition-all pt-2"
                  >
                    Baca Selengkapnya
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

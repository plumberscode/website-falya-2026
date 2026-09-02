import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug } from "@/app/actions/blog";
import { cleanExcerpt } from "@/lib/utils";
import { getAdminSession } from "@/lib/auth";
import BlogImage from "@/components/blog/BlogImage";
import { Calendar, ArrowLeft, Share2, Tag, AlertTriangle, Clock, Edit3 } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

const DEFAULT_OG_IMAGE = "https://falyarisol.com/images/2026/snackbox01.webp";

// Next.js Dynamic SEO Metadata Generator
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const session = await getAdminSession();
  const post = await getPostBySlug(slug, !!session);

  const siteUrl = "https://falyarisol.com";
  const canonicalUrl = `${siteUrl}/blog/${slug}`;

  if (!post) {
    return {
      title: "Artikel Tidak Ditemukan | Blog Falya",
      description: "Artikel yang Anda cari tidak ditemukan atau belum dipublikasikan.",
      alternates: {
        canonical: canonicalUrl,
      },
      robots: { index: false, follow: false },
    };
  }

  const description = post.metaDescription?.trim()
    ? post.metaDescription.trim()
    : cleanExcerpt(post.content);

  const ogImage = post.imageUrl?.trim() || DEFAULT_OG_IMAGE;

  return {
    title: `${post.title} | Blog Falya`,
    description,
    robots: !post.isPublished ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description,
      url: canonicalUrl,
      siteName: "Falya Risol",
      locale: "id_ID",
      type: "article",
      publishedTime: (post.publishedAt || post.createdAt).toISOString(),
      modifiedTime: (post.updatedAt || post.createdAt).toISOString(),
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImage],
    },
  };
}

export const revalidate = 60; // Revalidate every 60s for fresh content

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await getAdminSession();
  const post = await getPostBySlug(slug, !!session);

  if (!post) {
    notFound();
  }

  const isDraft = !post.isPublished;
  const isScheduled = post.publishedAt && new Date(post.publishedAt) > new Date();

  const description = post.metaDescription?.trim()
    ? post.metaDescription.trim()
    : cleanExcerpt(post.content);

  const ogImage = post.imageUrl?.trim() || DEFAULT_OG_IMAGE;

  // Schema.org Article Structured Data for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: description,
    image: [ogImage],
    datePublished: (post.publishedAt || post.createdAt).toISOString(),
    dateModified: (post.updatedAt || post.createdAt).toISOString(),
    author: {
      "@type": "Organization",
      name: "Falya Risol",
      url: "https://falyarisol.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Falya Risol",
      logo: {
        "@type": "ImageObject",
        url: "https://falyarisol.com/images/logo-risol-mayo.webp",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://falyarisol.com/blog/${post.slug}`,
    },
  };

  return (
    <>
      {/* Google Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Admin Draft / Scheduled Preview Banner */}
          {(isDraft || isScheduled) && (
            <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 shadow-sm">
              <div className="flex items-center gap-3">
                {isDraft ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-purple-600 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider">
                    {isDraft ? "Pratinjau Mode Draf (Draft)" : "Pratinjau Artikel Terjadwal"}
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    {isDraft
                      ? "Artikel ini belum dipublikasikan ke publik dan hanya bisa dilihat oleh Anda sebagai Admin."
                      : `Artikel ini dijadwalkan terbit pada ${new Date(post.publishedAt).toLocaleString("id-ID")}.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/admin/blog"
                  className="px-3.5 py-1.5 bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-semibold rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/50 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Daftar Admin
                </Link>

                <Link
                  href={`/admin/blog/edit/${post.id}`}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Artikel
                </Link>
              </div>
            </div>
          )}

          {/* Back Navigation */}
          <div className="mb-8 flex items-center gap-3 flex-wrap">
            {session && (
              <Link
                href="/admin/blog"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Manajemen Blog (Admin)
              </Link>
            )}

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Semua Artikel
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
              {post.category && (
                <Link
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-200 transition"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {post.category}
                </Link>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={(post.publishedAt || post.createdAt).toISOString()}>
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight mb-6">
              {post.title}
            </h1>

            {post.metaDescription && (
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed italic border-l-4 border-emerald-500 pl-4">
                {post.metaDescription}
              </p>
            )}
          </header>

          {/* Featured Image (Cloudinary) */}
          {post.imageUrl && (
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden mb-12 shadow-md bg-zinc-100 dark:bg-zinc-800">
              <BlogImage
                src={post.imageUrl}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

          {/* Article Body Content */}
          <div
            className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-p:leading-relaxed prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-img:rounded-2xl prose-img:my-6 prose-img:shadow-md prose-img:mx-auto prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:underline hover:prose-a:text-emerald-500 transition-colors"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer of Article */}
          <footer className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <Link
              href="/blog"
              className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              ← Lihat artikel lainnya
            </Link>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Share2 className="w-4 h-4" />
              <span>Bagikan artikel ini untuk teman Anda</span>
            </div>
          </footer>
        </div>
      </article>
    </>
  );
}

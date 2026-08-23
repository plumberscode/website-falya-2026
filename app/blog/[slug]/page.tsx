import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug } from "@/app/actions/blog";
import BlogImage from "@/components/blog/BlogImage";
import { Calendar, ArrowLeft, Share2, Tag } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

// Next.js Dynamic SEO Metadata Generator
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Artikel Tidak Ditemukan - Falya",
    };
  }

  const siteUrl = "https://falyarisol.com";
  const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
  const description =
    post.metaDescription ||
    post.content.replace(/<[^>]+>/g, "").slice(0, 160) + "...";

  return {
    title: `${post.title} | Blog Falya`,
    description,
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
      modifiedTime: post.updatedAt.toISOString(),
      images: post.imageUrl
        ? [
            {
              url: post.imageUrl,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  };
}

export const revalidate = 60; // Revalidate every 60s for fresh content

export default async function BlogPostDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Schema.org Article Structured Data for Google Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    image: post.imageUrl ? [post.imageUrl] : undefined,
    datePublished: (post.publishedAt || post.createdAt).toISOString(),
    dateModified: post.updatedAt.toISOString(),
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
        url: "https://falyarisol.com/favicon.ico",
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

      <article className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-8">
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
            className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-p:leading-relaxed prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-img:rounded-2xl"
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

import Link from "next/link";
import BlogImage from "@/components/blog/BlogImage";
import { Calendar, ArrowRight, Tag } from "lucide-react";

interface BlogPostCardProps {
  post: {
    slug: string;
    title: string;
    category: string | null;
    imageUrl: string | null;
    metaDescription: string | null;
    publishedAt: Date;
    createdAt: Date;
  };
  // h2 di listing /blog; h3 di section "Artikel Terkait" (di bawah H1/H2 artikel).
  headingLevel?: "h2" | "h3";
}

/** Kartu artikel -- dipakai listing /blog dan "Artikel Terkait" di halaman artikel. */
export default function BlogPostCard({ post, headingLevel = "h2" }: BlogPostCardProps) {
  const Heading = headingLevel;
  return (
    <article className="group flex flex-col bg-white rounded-3xl border border-[#f3e2ec] overflow-hidden shadow-[0_2px_12px_rgba(36,27,24,0.04)] hover:shadow-[0_8px_28px_rgba(168,40,104,0.1)] transition-all duration-300 hover:-translate-y-1 relative">
      {post.category && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-[#a82868] shadow-sm border border-white/20">
            <Tag className="w-3 h-3" />
            {post.category}
          </span>
        </div>
      )}
      {post.imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-[#f7ebdd]">
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
          <div className="flex items-center gap-2 text-xs text-[#968b85] mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={(post.publishedAt || post.createdAt).toISOString()}>
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
          </div>

          <Heading className="text-xl font-bold tracking-tight text-[#241b18] mb-2 group-hover:text-[#a82868] transition line-clamp-2">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
          </Heading>

          {post.metaDescription && (
            <p className="text-[#665b56] text-sm line-clamp-3 mb-4">{post.metaDescription}</p>
          )}
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#a82868] hover:gap-2.5 transition-all pt-2"
        >
          Baca Selengkapnya
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

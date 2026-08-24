"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPostById, updatePost } from "@/app/actions/blog";
import CldUploadButton from "@/components/blog/CldUploadButton";
import RichTextEditor from "@/components/blog/RichTextEditor";
import { Sparkles, Globe, ArrowLeft, Save, Loader2, Calendar, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function EditBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [content, setContent] = useState("");
  
  // Penjadwalan & Status: "now" | "schedule" | "draft"
  const [publishMode, setPublishMode] = useState<"now" | "schedule" | "draft">("now");
  const [scheduledDateTime, setScheduledDateTime] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadPost() {
      if (!id) return;
      const post = await getPostById(id);
      if (post) {
        setTitle(post.title);
        setSlug(post.slug);
        setMetaDescription(post.metaDescription || "");
        setCategory(post.category || "");
        setImageUrl(post.imageUrl || null);
        setContent(post.content);

        const postDate = new Date(post.publishedAt || post.createdAt);
        const isFuture = postDate > new Date();

        if (!post.isPublished) {
          setPublishMode("draft");
        } else if (isFuture) {
          setPublishMode("schedule");
          // Format ke input datetime-local
          const tzOffset = postDate.getTimezoneOffset() * 60000;
          const localISOTime = new Date(postDate.getTime() - tzOffset)
            .toISOString()
            .slice(0, 16);
          setScheduledDateTime(localISOTime);
        } else {
          setPublishMode("now");
        }
      }
      setIsLoading(false);
    }
    loadPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !content) {
      toast.error("Judul, Slug, dan Konten wajib diisi.");
      return;
    }

    if (publishMode === "schedule" && !scheduledDateTime) {
      toast.error("Pilih tanggal dan jam untuk publikasi terjadwal.");
      return;
    }

    setIsSubmitting(true);

    const isDraft = publishMode === "draft";
    const publishedAt =
      !isDraft && publishMode === "schedule" && scheduledDateTime
        ? new Date(scheduledDateTime)
        : new Date();

    const res = await updatePost(id, {
      title,
      slug,
      content,
      metaDescription,
      category: category || undefined,
      imageUrl: imageUrl || undefined,
      publishedAt,
      isPublished: !isDraft,
    });

    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        isDraft
          ? "Artikel disimpan sebagai Draf!"
          : publishMode === "schedule"
          ? "Jadwal publikasi artikel berhasil diperbarui!"
          : "Artikel blog berhasil diperbarui & diterbitkan!"
      );
      router.push("/admin/blog");
    } else {
      toast.error(res.error || "Gagal memperbarui artikel.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-zinc-500">Memuat data artikel dari database Neon...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog"
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Artikel Blog</h1>
              <p className="text-sm text-zinc-500">Perbarui konten artikel dan jadwal publikasi</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul, Slug & Kategori */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Judul Artikel</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: 7 Tips Memilih Snack Box Berkualitas untuk Acara Kantor"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-lg font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold">URL Slug</label>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5" /> SEO
                  </span>
                </div>
                <div className="flex items-center px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-mono">
                  <span className="text-zinc-400 select-none">/blog/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="tips-memilih-snack-box"
                    className="w-full bg-transparent focus:outline-none text-emerald-600 dark:text-emerald-400 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Kategori (Opsional)</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Contoh: Snack Box"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Gambar Thumbnail */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <label className="block text-sm font-semibold">Gambar Utama (Cloudinary Media Storage)</label>
            <CldUploadButton
              onSuccess={(url) => setImageUrl(url)}
              currentImageUrl={imageUrl}
            />
          </div>

          {/* Konten Rich Text */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <label className="block text-sm font-semibold">Isi Konten Artikel</label>
            <RichTextEditor content={content} onChange={(html) => setContent(html)} />
          </div>

          {/* Pengaturan Penjadwalan Publikasi */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <label className="text-sm font-bold">Waktu Publikasi Artikel</label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  publishMode === "now"
                    ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <input
                  type="radio"
                  name="publishModeEdit"
                  checked={publishMode === "now"}
                  onChange={() => setPublishMode("now")}
                  className="accent-emerald-600 mt-1"
                />
                <div>
                  <p className="font-semibold text-sm">Terbitkan Sekarang</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Artikel langsung terbit dan dapat dibaca oleh pengunjung.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  publishMode === "schedule"
                    ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <input
                  type="radio"
                  name="publishModeEdit"
                  checked={publishMode === "schedule"}
                  onChange={() => setPublishMode("schedule")}
                  className="accent-emerald-600 mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    Jadwalkan Rilis
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Tentukan tanggal dan jam tayang otomatis.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                  publishMode === "draft"
                    ? "border-amber-500 bg-amber-500/5 dark:bg-amber-500/10"
                    : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <input
                  type="radio"
                  name="publishModeEdit"
                  checked={publishMode === "draft"}
                  onChange={() => setPublishMode("draft")}
                  className="accent-amber-600 mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-sm flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    Simpan Draf (Draft)
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Hanya tersimpan di admin, disembunyikan dari publik.
                  </p>
                </div>
              </label>
            </div>

            {publishMode === "schedule" && (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 animate-in fade-in">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Pilih Tanggal & Waktu Rilis:
                </label>
                <input
                  type="datetime-local"
                  required={publishMode === "schedule"}
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {/* SEO Meta Description & Google Preview */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-semibold">Meta Description (Cuplikan Google)</label>
                <span
                  className={`text-xs font-mono ${
                    metaDescription.length > 160
                      ? "text-red-500 font-bold"
                      : metaDescription.length >= 120
                      ? "text-emerald-500"
                      : "text-zinc-400"
                  }`}
                >
                  {metaDescription.length} / 160 karakter
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Tuliskan rangkuman menarik artikel Anda yang mengandung kata kunci pencarian..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-sm"
              />
            </div>

            {/* Google SERP Preview */}
            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Pratinjau Hasil Pencarian Google:</span>
              </div>
              <div className="text-xs text-zinc-500 truncate">
                https://falyarisol.com › blog › {slug || "judul-artikel"}
              </div>
              <div className="text-base text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer truncate">
                {title || "Judul Artikel Blog Anda"} - Falya
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {metaDescription ||
                  "Ini adalah contoh cuplikan deskripsi artikel yang akan dilihat pengunjung saat mencari kata kunci terkait di Google Search..."}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link href="/admin/blog">
              <button
                type="button"
                className="px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-sm transition"
              >
                Batal
              </button>
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? "Menyimpan ke Neon..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

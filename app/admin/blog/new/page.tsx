"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/app/actions/blog";
import CldUploadButton from "@/components/blog/CldUploadButton";
import RichTextEditor from "@/components/blog/RichTextEditor";
import { Sparkles, Globe, ArrowLeft, Send, Calendar, Clock, FileText } from "lucide-react";
import Link from "next/link";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [content, setContent] = useState("");
  
  // Penjadwalan & Status publikasi: "now" | "schedule" | "draft"
  const [publishMode, setPublishMode] = useState<"now" | "schedule" | "draft">("now");
  const [scheduledDateTime, setScheduledDateTime] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auto-generate SEO friendly slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  // Auto-generate excerpt from HTML content
  const handleGenerateMetaFromContent = () => {
    if (!content) return;
    const clean = content
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/\s+/g, " ")
      .trim();
    if (clean) {
      setMetaDescription(clean.slice(0, 155));
    }
  };

  const handleSavePost = async (forceDraft = false) => {
    const isDraft = forceDraft || publishMode === "draft";

    if (!title.trim() || !slug.trim()) {
      setMessage({ type: "error", text: "Judul dan Slug URL wajib diisi." });
      return;
    }

    if (!isDraft && !content.trim()) {
      setMessage({ type: "error", text: "Isi konten artikel wajib diisi sebelum dipublikasikan." });
      return;
    }

    if (!isDraft && publishMode === "schedule" && !scheduledDateTime) {
      setMessage({ type: "error", text: "Pilih tanggal dan jam untuk publikasi terjadwal." });
      return;
    }

    // Auto-generate meta description jika kosong sebelum publish
    let finalMetaDesc = metaDescription.trim();
    if (!finalMetaDesc && content) {
      const clean = content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      finalMetaDesc = clean.slice(0, 155);
      setMetaDescription(finalMetaDesc);
    }

    setIsSubmitting(true);
    setMessage(null);

    const publishedAt =
      !isDraft && publishMode === "schedule" && scheduledDateTime
        ? new Date(scheduledDateTime)
        : new Date();

    const res = await createPost({
      title: title.trim(),
      slug: slug.trim(),
      content: content || "<p></p>",
      metaDescription: finalMetaDesc,
      category: category.trim() || undefined,
      imageUrl: imageUrl || undefined,
      publishedAt,
      isPublished: !isDraft,
    });

    setIsSubmitting(false);

    if (res.success) {
      setMessage({
        type: "success",
        text: isDraft
          ? "Artikel berhasil disimpan sebagai Draf (Belum Terbit)!"
          : publishMode === "schedule"
          ? "Artikel berhasil dijadwalkan! Akan otomatis terbit pada waktu yang ditentukan."
          : "Artikel blog berhasil dipublikasikan sekarang dengan SEO & OG lengkap!",
      });
      setTimeout(() => {
        router.push("/admin/blog");
      }, 1500);
    } else {
      setMessage({ type: "error", text: res.error || "Terjadi kesalahan." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSavePost(false);
  };

  const previewDescription =
    metaDescription ||
    (content
      ? content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 155) + "..."
      : "Ini adalah contoh cuplikan deskripsi artikel yang akan dilihat pengunjung saat mencari kata kunci terkait di Google Search...");

  const fallbackOgImage = "https://falyarisol.com/images/2026/snackbox01.webp";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/blog"
              className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tulis Artikel Blog Baru</h1>
              <p className="text-sm text-zinc-500">Optimasi untuk kata kunci & SEO On-Page Otomatis</p>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Judul, Slug & Kategori */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Judul Artikel</label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
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

          {/* Gambar Thumbnail Cloudinary */}
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-semibold">Gambar Utama & OpenGraph Image (1200x630)</label>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Gambar ini akan menjadi thumbnail artikel serta cover otomatis saat artikel dibagikan di WhatsApp, Facebook, dan Twitter.
                </p>
              </div>
            </div>
            <CldUploadButton
              onSuccess={(url) => setImageUrl(url)}
              currentImageUrl={imageUrl}
            />
            {!imageUrl && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                💡 Jika tidak mengunggah gambar custom, sistem akan otomatis menggunakan gambar fallback default Falya untuk OpenGraph tag media sosial.
              </p>
            )}
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
                  name="publishMode"
                  checked={publishMode === "now"}
                  onChange={() => setPublishMode("now")}
                  className="accent-emerald-600 mt-1"
                />
                <div>
                  <p className="font-semibold text-sm">Publikasikan Sekarang</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Artikel langsung terbit dan tampil untuk publik.
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
                  name="publishMode"
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
                  name="publishMode"
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
                    Hanya tersimpan di admin, belum tampil di publik.
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
                <p className="text-[11px] text-zinc-500 italic">
                  Artikel akan tetap tersembunyi dari publik dan Google sitemap sampai waktu yang Anda tentukan tiba.
                </p>
              </div>
            )}
          </div>

          {/* SEO Meta Description & Google Preview */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-semibold">Meta Description (Cuplikan Google & OG)</label>
                  <button
                    type="button"
                    onClick={handleGenerateMetaFromContent}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition cursor-pointer"
                    title="Buat deskripsi otomatis dari paragraf pertama isi artikel"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate dari Konten
                  </button>
                </div>
                <span
                  className={`text-xs font-mono ${
                    metaDescription.length > 160
                      ? "text-red-500 font-bold"
                      : metaDescription.length >= 120
                      ? "text-emerald-500 font-semibold"
                      : "text-zinc-400"
                  }`}
                >
                  {metaDescription.length} / 160 karakter
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Tuliskan rangkuman menarik artikel Anda yang mengandung kata kunci pencarian, atau klik 'Generate dari Konten'..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-sm"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                💡 Jika dibiarkan kosong, sistem secara otomatis mengekstrak 155 karakter pertama dari konten artikel untuk mengisi meta description, canonical, dan OpenGraph tag.
              </p>
            </div>

            {/* Google SERP Preview */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span>Pratinjau Hasil Pencarian Google (SERP):</span>
              </div>
              <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="text-xs text-zinc-500 truncate">
                  https://falyarisol.com › blog › {slug || "judul-artikel"}
                </div>
                <div className="text-base text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer truncate">
                  {title || "Judul Artikel Blog Anda"} | Blog Falya
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {previewDescription}
                </div>
              </div>
            </div>

            {/* Social Media & WhatsApp Card Preview (OpenGraph) */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Pratinjau Kartu Berbagi Sosial Media (WhatsApp / Facebook / Twitter):</span>
              </div>
              <div className="max-w-md rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <div className="relative aspect-video w-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={imageUrl || fallbackOgImage}
                    alt="Preview OG"
                    className="w-full h-full object-cover"
                  />
                  {!imageUrl && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] rounded-md font-medium">
                      Default Brand OG Image
                    </div>
                  )}
                </div>
                <div className="p-3.5 space-y-1">
                  <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    falyarisol.com
                  </p>
                  <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {title || "Judul Artikel Blog Anda"}
                  </p>
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {previewDescription}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSavePost(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-zinc-500" />
              Simpan sebagai Draf
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg transition cursor-pointer disabled:opacity-50 text-white ${
                publishMode === "draft"
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/20"
                  : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
              }`}
            >
              {publishMode === "draft" ? (
                <FileText className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isSubmitting
                ? "Menyimpan ke Database..."
                : publishMode === "draft"
                ? "Simpan Draf (Belum Terbit)"
                : publishMode === "schedule"
                ? "Jadwalkan Artikel"
                : "Publikasikan Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

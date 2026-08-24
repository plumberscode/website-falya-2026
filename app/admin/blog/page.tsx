"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAllPosts, deletePost } from "@/app/actions/blog";
import { logoutAction } from "@/app/actions/auth";
import {
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Search,
  BookOpen,
  Calendar,
  UtensilsCrossed,
  LogOut,
  Sparkles,
  Loader2,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import BlogImage from "@/components/blog/BlogImage";

export default function AdminBlogListPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    setIsLoading(true);
    // true = include scheduled posts for admin view
    const data = await getAllPosts(true);
    setPosts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Yakin ingin menghapus artikel "${title}" dari database?`)) {
      const res = await deletePost(id);
      if (res.success) {
        toast.success(`Artikel "${title}" berhasil dihapus.`);
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error("Gagal menghapus artikel.");
      }
    }
  };

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-[#fdfbfc] text-[#241b18] min-h-screen pt-28 pb-20">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#f3d5e3]/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#f3d5e3] text-[#a82868] font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                ADMIN CONTROL
              </span>
              <span className="text-xs text-[#665b56]">Konten Blog & SEO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241b18]">
              Manajemen Artikel Blog
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/admin/blog/new">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-full text-xs flex items-center gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" />
                Tulis Artikel Baru
              </Button>
            </Link>

            <Button
              onClick={async () => {
                await logoutAction();
                toast.success("Berhasil logout");
                router.push("/admin/login");
              }}
              variant="ghost"
              className="text-[#c74343] hover:bg-red-50 text-xs rounded-full flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>

        {/* Tab Switcher: Menu vs Blog */}
        <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-[#f3d5e3]/40 w-fit shadow-xs">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#665b56] hover:bg-[#faf0f4] transition"
          >
            <UtensilsCrossed className="w-4 h-4 text-[#968b85]" />
            Katalog Menu ({`Menu & Harga`})
          </Link>

          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#a82868] text-white shadow-xs">
            <BookOpen className="w-4 h-4 text-white" />
            Artikel Blog ({posts.length})
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#968b85]" />
            <Input
              type="text"
              placeholder="Cari judul artikel atau slug SEO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-[#f3d5e3] rounded-full text-xs h-10 w-full shadow-xs"
            />
          </div>

          <div className="text-xs text-[#665b56] self-end sm:self-center">
            Total <strong className="text-[#241b18]">{filteredPosts.length}</strong> artikel terdaftar
          </div>
        </div>

        {/* Post Listing Table */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(168,40,104,0.05)] border border-[#f3d5e3]/40">
          {isLoading ? (
            <div className="p-16 text-center text-[#968b85] flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#a82868]" />
              <p className="text-xs">Memuat artikel dari database Neon...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-16 text-center text-[#968b85] space-y-3">
              <p className="text-sm font-semibold text-[#241b18]">
                {searchQuery ? "Tidak ada artikel yang cocok." : "Belum ada artikel blog yang terdaftar."}
              </p>
              {!searchQuery && (
                <Link href="/admin/blog/new">
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs">
                    Mulai Tulis Artikel Pertama
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#f3d5e3]/20">
              {filteredPosts.map((post) => {
                const publishDate = new Date(post.publishedAt || post.createdAt);
                const isDraft = !post.isPublished;
                const isScheduled = post.isPublished && publishDate > new Date();

                return (
                  <div
                    key={post.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#faf0f4]/40 transition"
                  >
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      {post.imageUrl ? (
                        <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0 shadow-xs">
                          <BlogImage
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded-xl bg-[#faf0f4] text-[#a82868] flex items-center justify-center shrink-0 border border-[#f3d5e3]/40">
                          <BookOpen className="w-5 h-5 opacity-50" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h2 className="font-bold text-sm sm:text-base text-[#241b18] truncate">
                            {post.title}
                          </h2>

                          {/* Status Badge: Draf vs Terjadwal vs Terbit */}
                          {isDraft ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 px-2 py-0.5 rounded-full shrink-0">
                              <FileText className="w-3 h-3" />
                              Draf (Draft)
                            </span>
                          ) : isScheduled ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 px-2 py-0.5 rounded-full shrink-0">
                              <Clock className="w-3 h-3" />
                              Terjadwal (
                              {publishDate.toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                              })}
                              ,{" "}
                              {publishDate.toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              )
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                              <CheckCircle className="w-3 h-3" />
                              Terbit
                            </span>
                          )}

                          {/* Kategori Badge */}
                          {post.category && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 px-2 py-0.5 rounded-full shrink-0">
                              {post.category}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-wrap text-xs text-[#665b56]">
                          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            /blog/{post.slug}
                          </span>
                          <span className="text-[#968b85]">•</span>
                          <span className="flex items-center gap-1 text-[11px] text-[#968b85]">
                            <Calendar className="w-3 h-3" />
                            Rilis:{" "}
                            {publishDate.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {/* View Live */}
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-white border border-[#f3d5e3] hover:bg-[#faf0f4] text-[#665b56] transition text-xs font-semibold flex items-center gap-1"
                        title={
                          isScheduled
                            ? "Lihat pratinjau artikel (masih terjadwal)"
                            : "Lihat artikel langsung di website"
                        }
                      >
                        <ExternalLink className="w-4 h-4 text-[#968b85]" />
                        <span className="hidden sm:inline">Lihat</span>
                      </a>

                      {/* Edit */}
                      <Link
                        href={`/admin/blog/edit/${post.id}`}
                        className="p-2 rounded-xl bg-[#faf0f4] hover:bg-[#f3d5e3] text-[#a82868] transition text-xs font-semibold flex items-center gap-1"
                        title="Edit artikel dan jadwal"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="p-2 rounded-xl text-[#968b85] hover:text-[#c74343] hover:bg-red-50 transition cursor-pointer"
                        title="Hapus artikel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

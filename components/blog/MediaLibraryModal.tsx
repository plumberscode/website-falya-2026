"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { getAllMedia, saveMedia } from "@/app/actions/media";
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  Check,
  X,
  Loader2,
  Calendar,
  Link as LinkIcon,
  RefreshCw,
} from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  name?: string | null;
  createdAt: Date | string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  title?: string;
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelectImage,
  title = "Pilih Gambar dari Galeri Cloudinary",
}: MediaLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "upload" | "url">("gallery");
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual URL state
  const [manualUrl, setManualUrl] = useState("");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "qemsyn4o";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ckqeshcx";

  const fetchMedia = async () => {
    setIsLoading(true);
    const list = await getAllMedia();
    setMediaList(list);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSelectedUrl(null);
      setUploadError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectAndConfirm = (url: string) => {
    onSelectImage(url);
    onClose();
  };

  // Upload file direct to Cloudinary & save to DB
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Harap pilih file gambar (JPG, PNG, WebP).");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        // Simpan ke database Media
        await saveMedia(data.secure_url, file.name);
        await fetchMedia();
        handleSelectAndConfirm(data.secure_url);
      } else {
        setUploadError(data.error?.message || "Gagal mengunggah gambar ke Cloudinary.");
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setUploadError("Koneksi gagal saat mengunggah gambar.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleManualUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      await saveMedia(manualUrl.trim(), "Gambar Eksternal");
      handleSelectAndConfirm(manualUrl.trim());
    }
  };

  const filteredMedia = mediaList.filter(
    (m) =>
      (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                {title}
              </h3>
              <p className="text-xs text-zinc-500">
                Pilih gambar yang sudah ada atau unggah gambar baru
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons & Search */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-200/60 dark:bg-zinc-800 rounded-xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "gallery"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              Galeri Terupload ({mediaList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === "upload"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
              Upload Baru
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "url"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
              }`}
            >
              Input URL
            </button>
          </div>

          {activeTab === "gallery" && (
            <div className="flex items-center gap-2 w-full sm:w-72">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama gambar..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="button"
                onClick={fetchMedia}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition cursor-pointer"
                title="Segarkan daftar gambar"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto min-h-[360px] max-h-[55vh]">
          {/* TAB 1: GALERI GAMBAR */}
          {activeTab === "gallery" && (
            <>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-2 text-zinc-400">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  <p className="text-xs">Memuat galeri Cloudinary...</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {searchQuery ? "Tidak ada gambar yang cocok" : "Belum ada gambar di galeri"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Klik tombol &quot;Upload Baru&quot; di atas untuk menambahkan foto pertama Anda.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("upload")}
                    className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload Gambar Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {filteredMedia.map((item) => {
                    const isSelected = selectedUrl === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedUrl(item.url)}
                        onDoubleClick={() => handleSelectAndConfirm(item.url)}
                        className={`group relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer flex flex-col bg-zinc-50 dark:bg-zinc-950 ${
                          isSelected
                            ? "border-emerald-500 ring-4 ring-emerald-500/20 shadow-md"
                            : "border-zinc-200 dark:border-zinc-800 hover:border-emerald-400 hover:shadow-xs"
                        }`}
                      >
                        <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                          <Image
                            src={item.url}
                            alt={item.name || "Gambar"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, 25vw"
                          />

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div className="p-2.5 flex flex-col gap-0.5">
                          <p className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 truncate" title={item.name || item.url}>
                            {item.name || "Gambar Cloudinary"}
                          </p>
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* TAB 2: UPLOAD BARU */}
          {activeTab === "upload" && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 rounded-3xl bg-zinc-50 dark:bg-zinc-950/50 transition">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>

              <h4 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                {isUploading ? "Sedang Mengunggah ke Cloudinary..." : "Unggah Gambar Baru"}
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm text-center mb-6">
                Pilih file foto dari perangkat Anda. Gambar akan otomatis tersimpan ke Cloudinary dan galeri media.
              </p>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                {isUploading ? "Proses..." : "Pilih File dari Komputer / HP"}
              </button>

              {uploadError && (
                <p className="mt-4 text-xs text-red-500 font-medium">{uploadError}</p>
              )}
            </div>
          )}

          {/* TAB 3: INPUT URL MANUAL */}
          {activeTab === "url" && (
            <form onSubmit={handleManualUrlSubmit} className="max-w-xl mx-auto py-10 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Masukkan Alamat URL Gambar:
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="url"
                    required
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/... atau https://images.unsplash.com/..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Gambar akan langsung disimpan ke galeri dan dapat digunakan kembali kapan saja.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Gunakan URL Ini
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer (Confirm Action) */}
        {activeTab === "gallery" && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
            <div className="text-xs text-zinc-500 truncate max-w-md">
              {selectedUrl ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Gambar terpilih ({selectedUrl.slice(0, 40)}...)
                </span>
              ) : (
                "Pilih satu gambar dari galeri di atas"
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Tutup
              </button>

              <button
                type="button"
                disabled={!selectedUrl}
                onClick={() => selectedUrl && handleSelectAndConfirm(selectedUrl)}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Gunakan Gambar Terpilih
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

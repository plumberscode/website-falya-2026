"use client";

import { useState } from "react";
import Image from "next/image";
import { UploadCloud, Image as ImageIcon, Trash2, FolderOpen } from "lucide-react";
import MediaLibraryModal from "./MediaLibraryModal";

interface CldUploadButtonProps {
  onSuccess: (url: string) => void;
  currentImageUrl?: string | null;
}

export default function CldUploadButton({ onSuccess, currentImageUrl }: CldUploadButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      {/* Tombol Buka Media Library / Upload */}
      {currentImageUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4 space-y-3">
          <div className="relative aspect-video w-full max-w-md rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
            <Image
              src={currentImageUrl}
              alt="Thumbnail preview"
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
              Pilih dari Galeri / Ganti Foto
            </button>

            <button
              type="button"
              onClick={() => onSuccess("")}
              className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center gap-3 px-4 py-10 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 rounded-2xl text-sm font-medium transition cursor-pointer text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-950 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              Pilih Gambar dari Galeri atau Upload Baru
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Klik untuk melihat foto yang sudah terupload di Cloudinary atau unggah foto baru
            </p>
          </div>
        </button>
      )}

      {/* Modal Galeri Media Cloudinary */}
      <MediaLibraryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectImage={(url) => onSuccess(url)}
        title="Galeri Media Cloudinary (Thumbnail Artikel)"
      />
    </div>
  );
}


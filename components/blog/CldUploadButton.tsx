"use client";

import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Link as LinkIcon, Loader2 } from "lucide-react";

interface CldUploadButtonProps {
  onSuccess: (url: string) => void;
  currentImageUrl?: string | null;
}

export default function CldUploadButton({ onSuccess, currentImageUrl }: CldUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "qemsyn4o";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ckqeshcx";

  // Direct REST API Upload ke Cloudinary (Sangat stabil & anti-adblocker)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Harap pilih file gambar (JPG, PNG, WebP).");
      return;
    }

    try {
      setIsUploading(true);
      setErrorMsg(null);

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
        onSuccess(data.secure_url);
      } else {
        setErrorMsg(data.error?.message || "Gagal mengunggah gambar ke Cloudinary.");
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setErrorMsg("Koneksi gagal saat mengunggah gambar. Periksa koneksi internet Anda.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      onSuccess(manualUrl.trim());
      setShowManualInput(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-3 px-4 py-12 border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 rounded-xl text-sm font-medium transition cursor-pointer text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-950 disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <span>Sedang mengunggah ke Cloudinary...</span>
          </>
        ) : (
          <>
            <UploadCloud className="w-8 h-8 text-emerald-500" />
            <span>{currentImageUrl ? "Ganti Gambar Thumbnail (Cloudinary)" : "Pilih & Upload Gambar Thumbnail (Cloudinary)"}</span>
          </>
        )}
      </button>

      {errorMsg && (
        <p className="text-xs text-red-500 font-medium">{errorMsg}</p>
      )}

      {/* Alternatif Input URL Manual */}
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Atau masukkan URL gambar langsung:</span>
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          {showManualInput ? "Tutup input URL" : "Input URL Manual"}
        </button>
      </div>

      {showManualInput && (
        <div className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... atau https://res.cloudinary.com/..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={handleManualSubmit}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
          >
            Terapkan
          </button>
        </div>
      )}

      {currentImageUrl && (
        <div className="relative rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 p-2.5 flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/50">
          <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="text-xs truncate text-zinc-600 dark:text-zinc-400 font-mono flex-1">
            {currentImageUrl}
          </span>
          <button
            type="button"
            onClick={() => onSuccess("")}
            className="text-xs text-red-500 hover:text-red-600 hover:underline shrink-0"
          >
            Hapus
          </button>
        </div>
      )}
    </div>
  );
}

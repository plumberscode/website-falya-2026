"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Upload,
  Loader2,
  X,
  Check,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  // Modal / Popover state for Link
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Modal / Popover state for Image
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "qemsyn4o";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ckqeshcx";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3], // H2 & H3 for SEO hierarchy
        },
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: {
          class: "text-emerald-600 dark:text-emerald-400 underline font-medium hover:text-emerald-500 transition-colors",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      ImageExtension.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "rounded-2xl max-w-full my-6 shadow-md border border-zinc-200 dark:border-zinc-800 mx-auto",
        },
      }),
    ],
    content: content || "<p>Mulai tulis konten artikel Anda di sini...</p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[500px] p-5 focus:outline-none max-w-none text-zinc-900 dark:text-zinc-100",
      },
    },
  });

  if (!editor) return null;

  // Handle Link Insertion
  const handleOpenLinkModal = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setShowLinkModal(true);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      let formattedUrl = linkUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl) && !formattedUrl.startsWith("/")) {
        formattedUrl = `https://${formattedUrl}`;
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: formattedUrl })
        .run();
    }
    setShowLinkModal(false);
    setLinkUrl("");
  };

  const handleRemoveLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowLinkModal(false);
  };

  // Handle Image Insertion via URL
  const handleApplyImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl("");
      setShowImageModal(false);
    }
  };

  // Handle Image Upload Direct to Cloudinary
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Harap pilih file format gambar (JPG, PNG, WebP).");
      return;
    }

    try {
      setIsUploadingImage(true);
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
        editor.chain().focus().setImage({ src: data.secure_url }).run();
        setShowImageModal(false);
      } else {
        setUploadError(data.error?.message || "Gagal mengunggah gambar ke Cloudinary.");
      }
    } catch (err) {
      console.error("Editor Image Upload Error:", err);
      setUploadError("Gagal mengunggah gambar. Pastikan koneksi internet aktif.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition relative">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            editor.isActive("bold")
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
          }`}
          title="Tebal (Bold)"
        >
          <Bold className="w-4 h-4" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            editor.isActive("italic")
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
          }`}
          title="Miring (Italic)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Link Button */}
        <button
          type="button"
          onClick={handleOpenLinkModal}
          className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
            editor.isActive("link")
              ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
          }`}
          title="Buat Tautan / Link (URL)"
        >
          <LinkIcon className="w-4 h-4" />
          <span className="text-[11px] hidden sm:inline">Link</span>
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            onClick={handleRemoveLink}
            className="p-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
            title="Hapus Link"
          >
            <Unlink className="w-4 h-4" />
          </button>
        )}

        {/* Insert Image Button */}
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          className="p-2 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1"
          title="Sisipkan Gambar di Posisi Paragraf Ini"
        >
          <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] hidden sm:inline">Gambar</span>
        </button>

        <div className="w-[1px] h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
          }`}
          title="Heading 2 (Subjudul Utama SEO)"
        >
          <Heading2 className="w-4 h-4" /> H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
            editor.isActive("heading", { level: 3 })
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
          }`}
          title="Heading 3 (Sub-subjudul)"
        >
          <Heading3 className="w-4 h-4" /> H3
        </button>

        <div className="w-[1px] h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            editor.isActive("bulletList")
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
          }`}
          title="Daftar Poin (Bullet List)"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            editor.isActive("orderedList")
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
          }`}
          title="Daftar Angka (Numbered List)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
            editor.isActive("blockquote")
              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
          }`}
          title="Kutipan (Quote)"
        >
          <Quote className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-zinc-300 dark:bg-zinc-700 mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition cursor-pointer"
          title="Urungkan (Undo)"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition cursor-pointer"
          title="Ulangi (Redo)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Link Input Popover Modal */}
      {showLinkModal && (
        <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 animate-in fade-in">
          <LinkIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <form onSubmit={handleApplyLink} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              autoFocus
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="Masukkan URL tautan (contoh: /nasi-liwet atau https://...)"
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Terapkan
            </button>
          </form>
          {editor.isActive("link") && (
            <button
              type="button"
              onClick={handleRemoveLink}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 transition cursor-pointer"
            >
              Hapus Link
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowLinkModal(false)}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Insert Image Modal */}
      {showImageModal && (
        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              Sisipkan Gambar ke Dalam Artikel
            </h4>
            <button
              type="button"
              onClick={() => {
                setShowImageModal(false);
                setUploadError(null);
              }}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opsi 1: Upload langsung ke Cloudinary */}
            <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  1. Upload dari Komputer / HP
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  File gambar otomatis disimpan ke Cloudinary Anda.
                </p>
              </div>

              <button
                type="button"
                disabled={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="w-full mt-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sedang Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    Pilih File Gambar
                  </>
                )}
              </button>
            </div>

            {/* Opsi 2: Input URL Gambar */}
            <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  2. Atau Masukkan URL Gambar
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Tautan web gambar langsung (Cloudinary, Unsplash, dsb).
                </p>
              </div>

              <form onSubmit={handleApplyImageUrl} className="flex gap-1.5 mt-1">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-700 dark:hover:bg-zinc-600 text-white transition cursor-pointer shrink-0"
                >
                  Sisipkan
                </button>
              </form>
            </div>
          </div>

          {uploadError && (
            <p className="text-xs text-red-500 font-medium">{uploadError}</p>
          )}
        </div>
      )}

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cartStore";
import {
  MENU_CATEGORIES,
  LIWET_CATEGORIES,
  SNACKBOX_CATEGORIES,
  MenuItem,
} from "@/lib/data/menuData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  DollarSign,
  FileText,
} from "lucide-react";
import CldUploadButton from "@/components/blog/CldUploadButton";

export default function EditMenuItemPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { menuItems, updateMenuItem, deleteMenuItem } = useCartStore();

  const [formData, setFormData] = useState<MenuItem | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const item = menuItems.find((m) => m.id === id);
    if (item) {
      setFormData({ ...item });
    }
    setIsLoaded(true);
  }, [id, menuItems]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#fdfbfc] text-[#241b18] pt-32 pb-20 flex items-center justify-center">
        <p className="text-sm text-zinc-500">Memuat data produk...</p>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-[#fdfbfc] text-[#241b18] pt-32 pb-20 px-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-3xl p-8 shadow-sm border border-[#f3d5e3]/40">
          <p className="text-base font-bold text-red-500 mb-2">Produk Tidak Ditemukan</p>
          <p className="text-xs text-[#665b56] mb-6">
            Produk dengan ID <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">{id}</code> tidak terdaftar di sistem.
          </p>
          <Link href="/admin">
            <Button className="bg-[#a82868] hover:bg-[#861f53] text-white rounded-full text-xs">
              Kembali ke Manajemen Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Nama produk tidak boleh kosong.");
      return;
    }
    if (formData.price <= 0) {
      toast.error("Harga produk harus lebih dari 0.");
      return;
    }

    updateMenuItem(id, {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      price: Number(formData.price),
      unit: formData.unit?.trim() || "pcs",
      isAvailable: formData.isAvailable,
      isPopular: formData.isPopular,
      image: formData.image,
    });

    toast.success(`Perubahan pada "${formData.name}" berhasil disimpan!`);
    router.push("/admin");
  };

  const handleDelete = () => {
    if (confirm(`Yakin ingin menghapus menu "${formData.name}"?`)) {
      deleteMenuItem(id);
      toast.success("Menu berhasil dihapus.");
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbfc] text-[#241b18] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#f3d5e3]/40">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-2xl bg-white border border-[#f3d5e3] hover:bg-[#faf0f4] text-[#665b56] transition shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#f3d5e3] text-[#a82868] px-2 py-0.5 rounded-full">
                  EDIT PRODUK
                </span>
                <span className="text-xs text-[#665b56] font-mono">ID: {formData.id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241b18] truncate max-w-md">
                {formData.name}
              </h1>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleDelete}
            variant="ghost"
            className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full text-xs flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Hapus Menu</span>
          </Button>
        </div>

        {/* Form Edit */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Informasi Dasar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(168,40,104,0.04)] border border-[#f3d5e3]/30 space-y-5">
            <h2 className="text-base font-bold text-[#241b18] flex items-center gap-2 pb-2 border-b border-[#f3d5e3]/20">
              <FileText className="w-4 h-4 text-[#a82868]" />
              Informasi Produk
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#241b18] mb-1.5">
                Nama Produk *
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Risol Mayo Super Cheese"
                className="bg-[#faf0f4]/50 border-[#ebd7c0] text-[#241b18] font-semibold text-base rounded-2xl h-12 focus:border-[#a82868]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#241b18] mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#a82868]" />
                  Kategori *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-[#faf0f4]/50 border border-[#ebd7c0] text-[#241b18] font-medium rounded-2xl text-sm h-12 px-3.5 focus:outline-none focus:border-[#a82868]"
                >
                  <optgroup label="Menu Reguler / Camilan">
                    {MENU_CATEGORIES.filter((c) => c.id !== "semua").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Paket Nasi Liwet">
                    {LIWET_CATEGORIES.filter((c) => c.id !== "semua").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Paket Snack Box">
                    {SNACKBOX_CATEGORIES.filter((c) => c.id !== "semua").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Lainnya">
                    <option value="kue-nampan">Kue Nampan</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241b18] mb-1.5">
                  Satuan (Unit)
                </label>
                <Input
                  value={formData.unit || "pcs"}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="pcs / kotak / porsi / tampah"
                  className="bg-[#faf0f4]/50 border-[#ebd7c0] text-[#241b18] rounded-2xl text-sm h-12 focus:border-[#a82868]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#241b18] mb-1.5">
                Deskripsi Menu
              </label>
              <Textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tuliskan keterangan detail komposisi atau isian menu..."
                className="bg-[#faf0f4]/50 border-[#ebd7c0] text-[#241b18] text-sm rounded-2xl resize-none focus:border-[#a82868]"
              />
            </div>
          </div>

          {/* Section 2: Harga & Status Ketersediaan */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(168,40,104,0.04)] border border-[#f3d5e3]/30 space-y-5">
            <h2 className="text-base font-bold text-[#241b18] flex items-center gap-2 pb-2 border-b border-[#f3d5e3]/20">
              <DollarSign className="w-4 h-4 text-[#a82868]" />
              Harga & Status Penjualan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#241b18] mb-1.5">
                  Harga Satuan (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#665b56]">
                    Rp
                  </span>
                  <Input
                    type="number"
                    required
                    min={500}
                    step={500}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="pl-12 bg-[#faf0f4]/50 border-[#ebd7c0] text-[#241b18] font-bold text-lg rounded-2xl h-12 focus:border-[#a82868]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#241b18] mb-1.5">
                  Status Ketersediaan *
                </label>
                <div className="flex items-center gap-3 h-12">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isAvailable: true })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                      formData.isAvailable
                        ? "bg-[#3e7c59] text-white border-[#3e7c59] shadow-xs"
                        : "bg-[#faf0f4]/40 text-[#665b56] border-[#ebd7c0] hover:bg-[#faf0f4]"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Tersedia
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isAvailable: false })}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                      !formData.isAvailable
                        ? "bg-[#c74343] text-white border-[#c74343] shadow-xs"
                        : "bg-[#faf0f4]/40 text-[#665b56] border-[#ebd7c0] hover:bg-[#faf0f4]"
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Stok Habis
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#241b18] p-3 rounded-2xl bg-[#faf0f4]/40 hover:bg-[#faf0f4] transition">
                <input
                  type="checkbox"
                  checked={formData.isPopular || false}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="accent-[#a82868] w-4 h-4 rounded cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#a82868]" />
                  Tandai sebagai Produk Terlaris (BEST SELLER)
                </span>
              </label>
            </div>
          </div>

          {/* Section 3: Foto Produk */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(168,40,104,0.04)] border border-[#f3d5e3]/30 space-y-4">
            <h2 className="text-base font-bold text-[#241b18] pb-2 border-b border-[#f3d5e3]/20">
              Foto Produk
            </h2>

            <CldUploadButton
              currentImageUrl={formData.image}
              onSuccess={(url) => setFormData({ ...formData, image: url })}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link href="/admin">
              <Button
                type="button"
                variant="outline"
                className="border-[#f3d5e3] hover:bg-[#faf0f4] text-[#665b56] rounded-full text-xs px-6 h-12"
              >
                Batal
              </Button>
            </Link>

            <Button
              type="submit"
              className="bg-[#a82868] hover:bg-[#861f53] text-white font-bold rounded-full text-xs px-8 h-12 shadow-md shadow-[#a82868]/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

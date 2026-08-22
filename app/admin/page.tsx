"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import {
  MenuItem,
  MENU_CATEGORIES,
  LIWET_CATEGORIES,
  SNACKBOX_CATEGORIES,
} from "@/lib/data/menuData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminPage() {
  const {
    menuItems,
    updateMenuItemPrice,
    toggleMenuItemAvailability,
    addMenuItem,
    deleteMenuItem,
    resetMenuToDefault,
  } = useCartStore();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: "",
    category: "risol",
    price: 6000,
    description: "",
    image: "/images/item-risol-mayo.webp",
    unit: "pcs",
    isAvailable: true,
    isPopular: false,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      pinInput === "1234" ||
      pinInput === "falya2026" ||
      pinInput === "falya"
    ) {
      setIsAuthenticated(true);
      setAuthError("");
      toast.success("Login Admin Berhasil!");
    } else {
      setAuthError("PIN salah. Coba: falya2026 atau 1234");
    }
  };

  const handleSavePrice = (id: string) => {
    if (tempPrice <= 0) {
      toast.error("Harga harus lebih dari 0");
      return;
    }
    updateMenuItemPrice(id, tempPrice);
    setEditingItemId(null);
    toast.success("Harga menu berhasil diperbarui!");
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      toast.error("Nama dan harga menu wajib diisi.");
      return;
    }

    const itemToAdd: MenuItem = {
      id: `custom-${Date.now()}`,
      name: newItem.name,
      category: (newItem.category as any) || "risol",
      price: Number(newItem.price),
      description: newItem.description || "",
      image: newItem.image || "/images/item-risol-mayo.webp",
      unit: newItem.unit || "pcs",
      isAvailable: true,
      isPopular: newItem.isPopular || false,
    };

    addMenuItem(itemToAdd);
    setShowAddForm(false);
    setNewItem({
      name: "",
      category: "risol",
      price: 6000,
      description: "",
      image: "/images/item-risol-mayo.webp",
      unit: "pcs",
      isAvailable: true,
      isPopular: false,
    });
    toast.success(`Menu "${itemToAdd.name}" berhasil ditambahkan!`);
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full bg-[#fdfbfc] text-[#241b18] min-h-screen pt-36 pb-20 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgba(168,40,104,0.06)] space-y-5 text-center">
          <div className="w-14 h-14 rounded-full bg-[#f3d5e3] text-[#a82868] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#241b18]">
              Admin Falya Risol
            </h1>
            <p className="text-xs text-[#665b56] mt-1">
              Masukkan PIN untuk mengelola daftar harga dan ketersediaan menu.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3.5">
            <Input
              type="password"
              placeholder="PIN Admin (Default: falya2026)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="bg-[#fff8ef] border-[#ebd7c0] text-[#241b18] text-center tracking-widest text-base rounded-full h-12"
              autoFocus
            />

            {authError && (
              <p className="text-xs text-[#c74343] font-medium">{authError}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#a82868] hover:bg-[#861f53] text-white font-semibold h-11 rounded-full shadow-xs"
            >
              Masuk Dashboard
            </Button>
          </form>

          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-[#665b56] hover:text-[#a82868]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Home
          </Link>
        </div>
      </div>
    );
  }

  const availableCount = menuItems.filter((i) => i.isAvailable).length;
  const unavailableCount = menuItems.length - availableCount;

  return (
    <div className="w-full bg-[#fdfbfc] text-[#241b18] min-h-screen pt-28 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#f3d5e3]/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#f3d5e3] text-[#a82868] font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                ADMIN CONTROL
              </span>
              <span className="text-xs text-[#665b56]">Katalog Menu Falya</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241b18]">
              Manajemen Menu & Harga
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-[#a82868] hover:bg-[#861f53] text-white font-semibold rounded-full text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Tambah Menu Baru
            </Button>

            <Button
              onClick={() => {
                if (confirm("Reset seluruh daftar menu ke default?")) {
                  resetMenuToDefault();
                  toast.success("Menu telah di-reset ke default.");
                }
              }}
              variant="outline"
              className="border-[#f3d5e3] hover:bg-[#faf0f4] text-[#665b56] text-xs rounded-full"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Reset Menu
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-[18px] p-5 shadow-[0_2px_12px_rgba(168,40,104,0.04)]">
            <span className="text-xs text-[#665b56]">Total Menu Terdaftar</span>
            <p className="text-2xl font-bold text-[#241b18] mt-1">
              {menuItems.length} Produk
            </p>
          </div>
          <div className="bg-white rounded-[18px] p-5 shadow-[0_2px_12px_rgba(168,40,104,0.04)]">
            <span className="text-xs text-[#3e7c59]">Tersedia (In Stock)</span>
            <p className="text-2xl font-bold text-[#3e7c59] mt-1">
              {availableCount} Produk
            </p>
          </div>
          <div className="bg-white rounded-[18px] p-5 shadow-[0_2px_12px_rgba(168,40,104,0.04)]">
            <span className="text-xs text-[#c74343]">
              Stok Habis (Out of Stock)
            </span>
            <p className="text-2xl font-bold text-[#c74343] mt-1">
              {unavailableCount} Produk
            </p>
          </div>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="bg-white rounded-[24px] p-6 sm:p-8 mb-8 shadow-[0_8px_30px_rgba(168,40,104,0.08)] animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#241b18] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#a82868]" />
                Tambah Menu Baru
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-[#968b85] hover:text-[#241b18] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateNewItem}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label className="text-xs font-semibold text-[#241b18] mb-1 block">
                  Nama Menu *
                </label>
                <Input
                  required
                  placeholder="Contoh: Risol Smoked Beef Extra"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  className="bg-[#faf0f4] border-0 rounded-xl text-sm h-11"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#241b18] mb-1 block">
                  Kategori *
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value as any })
                  }
                  className="w-full bg-[#faf0f4] border-0 text-[#241b18] rounded-xl text-sm h-11 px-3"
                >
                  <optgroup label="Menu Reguler">
                    {MENU_CATEGORIES.filter((c) => c.id !== "semua").map(
                      (c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ),
                    )}
                  </optgroup>
                  <optgroup label="Paket Nasi Liwet">
                    {LIWET_CATEGORIES.filter((c) => c.id !== "semua").map(
                      (c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ),
                    )}
                  </optgroup>
                  <optgroup label="Paket Snack Box">
                    {SNACKBOX_CATEGORIES.filter((c) => c.id !== "semua").map(
                      (c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ),
                    )}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#241b18] mb-1 block">
                  Harga (Rp) *
                </label>
                <Input
                  type="number"
                  required
                  min={1000}
                  step={500}
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: Number(e.target.value) })
                  }
                  className="bg-[#faf0f4] border-0 rounded-xl text-sm h-11"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#241b18] mb-1 block">
                  Satuan (Unit)
                </label>
                <Input
                  placeholder="pcs / kotak / tampah"
                  value={newItem.unit}
                  onChange={(e) =>
                    setNewItem({ ...newItem, unit: e.target.value })
                  }
                  className="bg-[#faf0f4] border-0 rounded-xl text-sm h-11"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-[#241b18] mb-1 block">
                  Deskripsi Menu
                </label>
                <Textarea
                  placeholder="Keterangan singkat komposisi atau isi paket..."
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  className="bg-[#faf0f4] border-0 rounded-xl text-sm resize-none h-20"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#241b18]">
                  <input
                    type="checkbox"
                    checked={newItem.isPopular}
                    onChange={(e) =>
                      setNewItem({ ...newItem, isPopular: e.target.checked })
                    }
                    className="accent-[#a82868] w-4 h-4"
                  />
                  Tandai sebagai BEST SELLER
                </label>

                <Button
                  type="submit"
                  className="bg-[#a82868] hover:bg-[#861f53] text-white font-semibold rounded-full text-xs px-6"
                >
                  Simpan Menu
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Menu Table */}
        <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(168,40,104,0.05)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#faf0f4] text-[#665b56] uppercase text-[11px]">
                <tr>
                  <th className="p-4 font-bold">Produk</th>
                  <th className="p-4 font-bold">Kategori</th>
                  <th className="p-4 font-bold">Harga</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3d5e3]/20">
                {menuItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#faf0f4]/40 transition-colors"
                  >
                    {/* Item */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-[10px] overflow-hidden bg-[#faf0f4] shrink-0 shadow-[0_1px_4px_rgba(36,27,24,0.08)]">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-[#241b18] text-sm">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-[#665b56] max-w-xs truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="text-xs bg-[#faf0f4] text-[#a82868] font-semibold px-2.5 py-1 rounded-full">
                        {item.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      {editingItemId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <Input
                            type="number"
                            value={tempPrice}
                            onChange={(e) =>
                              setTempPrice(Number(e.target.value))
                            }
                            className="w-24 bg-white border-[#a82868] text-[#241b18] font-bold h-8 text-xs rounded-lg"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePrice(item.id)}
                            className="p-1 bg-[#3e7c59] text-white rounded-lg hover:bg-[#2e5e43]"
                            title="Simpan"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1 bg-[#ebd7c0] text-[#665b56] rounded-lg hover:text-[#241b18]"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#241b18]">
                            Rp {item.price.toLocaleString("id-ID")}
                          </span>
                          <button
                            onClick={() => {
                              setEditingItemId(item.id);
                              setTempPrice(item.price);
                            }}
                            className="text-[#968b85] hover:text-[#a82868] p-1 cursor-pointer"
                            title="Ubah harga"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Availability */}
                    <td className="p-4">
                      <button
                        onClick={() => {
                          toggleMenuItemAvailability(item.id);
                          toast.info(`Status ${item.name} diubah.`);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          item.isAvailable
                            ? "bg-[#3e7c59]/10 border-[#3e7c59]/30 text-[#3e7c59] hover:bg-[#3e7c59]/20"
                            : "bg-[#c74343]/10 border-[#c74343]/30 text-[#c74343] hover:bg-[#c74343]/20"
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Tersedia
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Habis
                          </>
                        )}
                      </button>
                    </td>

                    {/* Delete */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus "${item.name}" dari menu?`)) {
                            deleteMenuItem(item.id);
                            toast.success(`Menu "${item.name}" dihapus.`);
                          }
                        }}
                        className="text-[#968b85] hover:text-[#c74343] p-1.5 transition-colors cursor-pointer"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import {
  getAllMenuItems,
  createMenuItem,
  toggleMenuItemAvailability as toggleMenuItemAvailabilityAction,
  deleteMenuItem as deleteMenuItemAction,
} from "@/app/actions/menu";
import {
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  LogOut,
  BookOpen,
  Search,
  ChevronRight,
  Sparkles,
  Edit3,
  UtensilsCrossed,
} from "lucide-react";
import {
  MenuItem,
  MENU_CATEGORIES,
  LIWET_CATEGORIES,
  SNACKBOX_CATEGORIES,
} from "@/lib/data/menuData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("semua");

  const loadMenuItems = useCallback(async () => {
    const items = await getAllMenuItems();
    setMenuItems(items);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Muat katalog menu dari database sekali di mount — tidak ada cara
    // lain mengetahui data server tanpa efek ini.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMenuItems();
  }, [loadMenuItems]);

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

  const handleCreateNewItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      toast.error("Nama dan harga menu wajib diisi.");
      return;
    }

    const result = await createMenuItem({
      name: newItem.name.trim(),
      category: (newItem.category as MenuItem["category"]) || "risol",
      price: Number(newItem.price),
      description: newItem.description?.trim() || "",
      image: newItem.image || "/images/item-risol-mayo.webp",
      unit: newItem.unit?.trim() || "pcs",
      isAvailable: true,
      isPopular: newItem.isPopular || false,
    });

    if (!result.success) {
      toast.error(result.error || "Gagal menambahkan menu.");
      return;
    }

    await loadMenuItems();
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
    toast.success(`Menu "${newItem.name}" berhasil ditambahkan!`);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    // Update optimis di UI, sinkron ke database di belakang layar.
    setMenuItems((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, isAvailable: !m.isAvailable } : m)),
    );
    const result = await toggleMenuItemAvailabilityAction(item.id);
    if (!result.success) {
      toast.error(result.error || "Gagal mengubah status.");
      await loadMenuItems(); // rollback ke state database yang sebenarnya
      return;
    }
    toast.info(`Status "${item.name}" diubah.`);
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Yakin ingin menghapus menu "${item.name}"?`)) return;
    const result = await deleteMenuItemAction(item.id);
    if (!result.success) {
      toast.error(result.error || "Gagal menghapus menu.");
      return;
    }
    setMenuItems((prev) => prev.filter((m) => m.id !== item.id));
    toast.success(`Menu "${item.name}" telah dihapus.`);
  };

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "semua" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, selectedCategory]);

  const availableCount = menuItems.filter((i) => i.isAvailable).length;
  const unavailableCount = menuItems.length - availableCount;

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
              <span className="text-xs text-[#665b56]">Katalog Menu Falya</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241b18]">
              Manajemen Menu & Harga
            </h1>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/admin/blog/new">
              <Button
                variant="outline"
                className="border-emerald-500/30 hover:bg-emerald-50 text-emerald-700 font-semibold rounded-full text-xs flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Tulis Artikel Blog
              </Button>
            </Link>

            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-[#a82868] hover:bg-[#861f53] text-white font-semibold rounded-full text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Tambah Menu Baru
            </Button>

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
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#a82868] text-white shadow-xs">
            <UtensilsCrossed className="w-4 h-4 text-white" />
            Katalog Menu ({menuItems.length})
          </div>

          <Link
            href="/admin/blog"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#665b56] hover:bg-[#faf0f4] transition"
          >
            <BookOpen className="w-4 h-4 text-[#968b85]" />
            Artikel Blog
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-[18px] p-5 shadow-[0_2px_12px_rgba(168,40,104,0.04)] border border-[#f3d5e3]/30">
            <span className="text-xs text-[#665b56]">Total Menu Terdaftar</span>
            <p className="text-2xl font-bold text-[#241b18] mt-1">
              {menuItems.length} Produk
            </p>
          </div>
          <div className="bg-white rounded-[18px] p-5 shadow-[0_2px_12px_rgba(168,40,104,0.04)] border border-[#f3d5e3]/30">
            <span className="text-xs text-[#3e7c59]">Tersedia (In Stock)</span>
            <p className="text-2xl font-bold text-[#3e7c59] mt-1">
              {availableCount} Produk
            </p>
          </div>
          <div className="bg-white rounded-[18px] p-5 shadow-[0_2px_12px_rgba(168,40,104,0.04)] border border-[#f3d5e3]/30">
            <span className="text-xs text-[#c74343]">Stok Habis (Out of Stock)</span>
            <p className="text-2xl font-bold text-[#c74343] mt-1">
              {unavailableCount} Produk
            </p>
          </div>
        </div>

        {/* Form Tambah Menu Baru (Collapsible) */}
        {showAddForm && (
          <div className="bg-white rounded-[24px] p-6 sm:p-8 mb-8 shadow-[0_8px_30px_rgba(168,40,104,0.08)] border border-[#f3d5e3]/50">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#241b18] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#a82868]" />
                Tambah Menu Baru
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-[#968b85] hover:text-[#241b18] p-1 cursor-pointer"
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
                    setNewItem({
                      ...newItem,
                      category: e.target.value as MenuItem["category"],
                    })
                  }
                  className="w-full bg-[#faf0f4] border-0 text-[#241b18] rounded-xl text-sm h-11 px-3"
                >
                  <optgroup label="Menu Reguler">
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
                <label className="text-xs font-semibold text-[#241b18] mb-1 block">
                  Harga (Rp) *
                </label>
                <Input
                  type="number"
                  required
                  min={500}
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
                    className="accent-[#a82868] w-4 h-4 rounded"
                  />
                  Tandai sebagai BEST SELLER
                </label>

                <Button
                  type="submit"
                  className="bg-[#a82868] hover:bg-[#861f53] text-white font-semibold rounded-full text-xs px-6 h-10"
                >
                  Simpan Menu Baru
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#968b85]" />
            <Input
              type="text"
              placeholder="Cari nama produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-[#f3d5e3] rounded-full text-xs h-10 w-full shadow-xs"
            />
          </div>

          <div className="text-xs text-[#665b56] self-end sm:self-center">
            Menampilkan <strong className="text-[#241b18]">{filteredItems.length}</strong> produk
          </div>
        </div>

        {/* Simplified Product List */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-[0_4px_24px_rgba(168,40,104,0.05)] border border-[#f3d5e3]/40">
          <div className="divide-y divide-[#f3d5e3]/20">
            {isLoading ? (
              <div className="p-12 text-center text-[#968b85] text-xs">
                Memuat data produk...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center text-[#968b85] text-xs">
                Tidak ada produk yang cocok dengan pencarian.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#faf0f4]/50 transition-colors"
                >
                  {/* Klik Nama Produk -> Menuju Halaman Edit */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/menu/${item.id}`}
                      className="inline-flex items-center gap-2 group-hover:text-[#a82868] transition"
                    >
                      <span className="font-bold text-sm sm:text-base text-[#241b18] group-hover:text-[#a82868] transition">
                        {item.name}
                      </span>
                      {item.isPopular && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                          <Sparkles className="w-2.5 h-2.5" /> Best Seller
                        </span>
                      )}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-[#a82868] bg-[#f3d5e3]/60 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className="text-xs font-bold text-[#665b56]">
                        Rp {item.price.toLocaleString("id-ID")}{" "}
                        <span className="font-normal text-[11px] text-[#968b85]">/{item.unit || "pcs"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle & Action Buttons */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Status Pill Button */}
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                        item.isAvailable
                          ? "bg-[#3e7c59]/10 border-[#3e7c59]/30 text-[#3e7c59] hover:bg-[#3e7c59]/20"
                          : "bg-[#c74343]/10 border-[#c74343]/30 text-[#c74343] hover:bg-[#c74343]/20"
                      }`}
                      title="Klik untuk ubah ketersediaan"
                    >
                      {item.isAvailable ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Tersedia</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Habis</span>
                        </>
                      )}
                    </button>

                    {/* Edit Button Link */}
                    <Link
                      href={`/admin/menu/${item.id}`}
                      className="p-2 rounded-xl bg-[#faf0f4] hover:bg-[#f3d5e3] text-[#a82868] transition flex items-center gap-1 text-xs font-semibold"
                      title="Edit detail produk"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 text-[#968b85] hover:text-[#c74343] hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Hapus Menu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

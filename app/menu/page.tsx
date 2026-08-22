'use client';

import React, { useState, useMemo } from 'react';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { MENU_CATEGORIES } from '@/lib/data/menuData';
import MenuCard from '@/components/menu/MenuCard';

export default function MenuPage() {
  const { menuItems, toggleCart, getTotalItems } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    if (!menuItems || !Array.isArray(menuItems)) return [];
    return menuItems.filter((item) => {
      const generalCategories = ['risol', 'snack', 'kuliner', 'coffee', 'juices-drinks'];
      
      const matchesCategory =
        selectedCategory === 'semua'
          ? (searchQuery ? true : generalCategories.includes(item.category))
          : item.category === selectedCategory;

      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const totalItems = getTotalItems();

  return (
    <div className="w-full bg-[#fdfbfc] text-[#241b18] min-h-screen pt-28 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Header Title */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#a82868]">
            KATALOG LENGKAP
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#241b18] tracking-tight">
            Daftar Menu & Harga
          </h1>
          <p className="text-[#665b56] text-sm">
            Pilih risol hangat, nasi liwet, atau snack box favorit Anda. Pesan mudah via WhatsApp.
          </p>
        </div>

        {/* Search & Filter Bar — shadow only, no border */}
        <div className="bg-[#ffffff] rounded-[24px] p-4 sm:p-6 shadow-[0_8px_30px_rgba(168,40,104,0.06)] mb-10 space-y-4">
          
          {/* Search Input — borderless inner, subtle bg */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#968b85]" />
            <input
              type="text"
              placeholder="Cari risol mayo, nasi liwet, snack box..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 h-12 bg-[#faf0f4] text-[#241b18] placeholder:text-[#968b85] rounded-full text-sm outline-none focus:bg-[#f5e5ee] transition-colors"
            />
          </div>

          {/* Category Filter Tabs — no border on inactive */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-1">
            {MENU_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#a82868] text-white shadow-sm'
                      : 'bg-[#faf0f4] text-[#665b56] hover:text-[#241b18] hover:bg-[#f3e2ec]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

        </div>

        {/* Results Counter & Cart Link */}
        <div className="flex items-center justify-between mb-6 text-xs text-[#665b56]">
          <span>Menampilkan <strong className="text-[#241b18]">{filteredItems.length}</strong> menu</span>
          {totalItems > 0 && (
            <button
              onClick={toggleCart}
              className="text-[#a82868] hover:text-[#861f53] flex items-center gap-1 font-bold cursor-pointer transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {totalItems} menu di keranjang
            </button>
          )}
        </div>

        {/* Product Grid */}
        {filteredItems.length === 0 ? (
          /* Empty State — shadow, no border */
          <div className="bg-white rounded-[20px] p-10 text-center max-w-sm mx-auto my-8 shadow-[0_4px_20px_rgba(36,27,24,0.07)]">
            <Filter className="w-8 h-8 text-[#968b85] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#241b18]">Menu tidak ditemukan</h3>
            <p className="text-xs text-[#665b56] mt-1">
              Coba cari dengan kata kunci lain atau reset kategori.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('semua');
              }}
              className="mt-4 text-xs font-semibold text-[#a82868] hover:text-[#861f53] flex items-center gap-1 mx-auto transition-colors"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

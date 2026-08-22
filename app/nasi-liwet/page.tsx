'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { MessageCircle, Info, UtensilsCrossed } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { Button } from '@/components/ui/button';
import { FALYA_CONTACT, LIWET_CATEGORIES } from '@/lib/data/menuData';
import MenuCard from '@/components/menu/MenuCard';

export default function NasiLiwetPage() {
  const { menuItems } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');

  const liwetCategories = ['liwet-ayam', 'liwet-nila', 'liwet-tampah'];
  
  const filteredLiwet = useMemo(() => {
    if (!menuItems || !Array.isArray(menuItems)) return [];
    return menuItems.filter((item) => {
      if (selectedCategory === 'semua') {
        return liwetCategories.includes(item.category);
      }
      return item.category === selectedCategory;
    });
  }, [menuItems, selectedCategory]);

  return (
    <div className="w-full bg-[#fdfbfc] text-[#241b18] min-h-screen pt-28 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#a82868]">
            KULINER KHAS FALYA
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#241b18] tracking-tight">
            Pilihan Paket Nasi Liwet
          </h1>
          <p className="text-[#665b56] text-sm sm:text-base leading-relaxed">
            Sajikan kehangatan dan kelezatan Nasi Liwet khas Falya untuk momen spesial Anda. Pilihan tepat untuk berbagai acara!
          </p>
        </div>

        {/* Category Tabs — no border on inactive */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {LIWET_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
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

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {filteredLiwet.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        {/* Notes & Extra Addons — shadow only, no border */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-[#faf0f4] rounded-[20px] p-6 space-y-2 shadow-[0_2px_12px_rgba(168,40,104,0.04)]">
            <h3 className="font-bold text-sm text-[#241b18] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#a82868]" />
              Catatan Paket Ayam & Nila:
            </h3>
            <ul className="text-xs text-[#665b56] space-y-1.5 list-disc list-inside">
              <li>Beli air mineral 330 ml: <strong className="text-[#241b18]">+ Rp 4.000</strong></li>
              <li>Ganti nasi putih: <strong className="text-[#241b18]">- Rp 5.000</strong></li>
              <li>Beli kol goreng: <strong className="text-[#241b18]">+ Rp 3.000</strong></li>
              <li>Beli ikan asin: <strong className="text-[#241b18]">+ Rp 8.000</strong></li>
            </ul>
          </div>

          <div className="bg-[#faf0f4] rounded-[20px] p-6 space-y-2 shadow-[0_2px_12px_rgba(168,40,104,0.04)]">
            <h3 className="font-bold text-sm text-[#241b18] flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-[#a82868]" />
              Ketentuan Nasi Liwet Tampah:
            </h3>
            <p className="text-xs text-[#665b56] leading-relaxed">
              Isi Paket Umum Tampah: Nasi liwet, Udang goreng, Ikan asin, Ayam goreng/bakar, Urap, Sambal & lalapan.
            </p>
            <p className="text-xs text-[#a82868] font-medium">
              * Disarankan melakukan reservasi / pemesanan minimal H-1 acara.
            </p>
          </div>
        </div>

        {/* Custom Order Box — shadow only, no border */}
        <div className="bg-[#ffffff] rounded-[24px] p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-[0_8px_30px_rgba(168,40,104,0.06)] space-y-3">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#241b18]">
            Butuh Paket Custom?
          </h3>
          <p className="text-[#665b56] text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
            Bisa dong.. kamu bisa mix lauknya sesuai dengan yang kamu mau untuk paket nasi liwet kotak atau tampah. Langsung chat mimin untuk info lebih lanjut ya.
          </p>
          <div className="pt-2">
            <Button
              asChild
              className="bg-[#a82868] hover:bg-[#861f53] text-white font-semibold rounded-full px-6 py-5 shadow-sm"
            >
              <a
                href={`https://wa.me/${FALYA_CONTACT.whatsappNumber}?text=Halo%20Falya%20Risol%20Mayo,%20saya%20mau%20tanya%20tentang%20custom%20order%20Nasi%20Liwet.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat Mimin via WhatsApp
              </a>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/button";
import { FALYA_CONTACT, SNACKBOX_CATEGORIES } from "@/lib/data/menuData";
import MenuCard from "@/components/menu/MenuCard";

export default function SnackboxPage() {
  const { menuItems } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("semua");

  const snackboxCategories = [
    "snackbox-mini",
    "snackbox-reguler",
    "snackbox-komplit",
    "kue-nampan",
  ];

  const filteredSnackbox = useMemo(() => {
    if (!menuItems || !Array.isArray(menuItems)) return [];
    return menuItems.filter((item) => {
      if (selectedCategory === "semua") {
        return snackboxCategories.includes(item.category);
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
            SNACK & CATERING
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#241b18] tracking-tight">
            Pilihan Paket Snack Box & Kue Nampan
          </h1>
          <p className="text-[#665b56] text-sm sm:text-base leading-relaxed">
            Sempurnakan acaramu dengan snack box dan kue nampan lezat dari Falya
            di Balikpapan — untuk rapat kantor, pengajian, hingga hajatan.
            Praktis dan menggugah selera!
          </p>
        </div>

        {/* Category Tabs — no border on inactive */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          {SNACKBOX_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#a82868] text-white shadow-sm"
                    : "bg-[#faf0f4] text-[#665b56] hover:text-[#241b18] hover:bg-[#f3e2ec]"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {filteredSnackbox.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        {/* Event Use-Case Section */}
        <div className="bg-[#fff8ef] rounded-[24px] p-6 sm:p-8 mb-16 shadow-[0_8px_30px_rgba(168,40,104,0.06)]">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#241b18] mb-1">
            Snack Box untuk Berbagai Acara
          </h2>
          <p className="text-[#665b56] text-xs sm:text-sm leading-relaxed max-w-2xl mb-5">
            Butuh konsumsi untuk rapat kantor, pengajian, atau hajatan? Snack
            box dan kue nampan Falya siap menemani acara kamu di Balikpapan —
            praktis, rapi, dan tinggal antar.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Rapat & Meeting Kantor", "Pengajian", "Hajatan", "Arisan"].map(
              (event) => (
                <span
                  key={event}
                  className="px-4 py-2 rounded-full bg-white text-[#a82868] text-xs sm:text-sm font-semibold shadow-sm"
                >
                  {event}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Custom Order Box — shadow only, no border */}
        <div className="bg-[#ffffff] rounded-[24px] p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-[0_8px_30px_rgba(168,40,104,0.06)] space-y-3">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#241b18]">
            Butuh Custom Order?
          </h3>
          <p className="text-[#665b56] text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
            Bisa dong.. kamu bisa mix snacknya sesuai dengan yang kamu mau.
            Jumlah kue per nampan sekitar 18 - 20 kue. Langsung chat mimin untuk
            info lebih lanjut ya.
          </p>
          <div className="pt-2">
            <Button
              asChild
              className="bg-[#a82868] hover:bg-[#861f53] text-white font-semibold rounded-full px-6 py-5 shadow-sm"
            >
              <a
                href={`https://wa.me/${FALYA_CONTACT.whatsappNumber}?text=Halo%20Falya%20Risol%20Mayo,%20saya%20mau%20tanya%20tentang%20custom%20order%20snackbox/kue%20nampan.`}
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

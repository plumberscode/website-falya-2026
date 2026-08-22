"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Utensils,
  Award,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  MoveRight,
  MessageCircle,
} from "lucide-react";
import CanvasSequenceScroller from "@/components/scrollytelling/CanvasSequenceScroller";
import MenuCard from "@/components/menu/MenuCard";
import { useCartStore } from "@/lib/store/cartStore";
import { Button } from "@/components/ui/button";
import { FALYA_CONTACT } from "@/lib/data/menuData";

export default function HomePage() {
  const { menuItems } = useCartStore();

  // 3 Best Sellers as specified in AGENTS.md / original website
  const bestSellerIds = ["risol001", "risol004", "kuliner003"];
  const bestSellers = menuItems.filter((item) =>
    bestSellerIds.includes(item.id),
  );

  return (
    <main className="w-full bg-[#fdfbfc] text-[#241b18] min-h-screen">
      {/* Preload frame pertama hero (LCP): diunduh paralel dengan JS */}
      <link
        rel="preload"
        as="image"
        href="/videos/frames-mobile/frame_0001.webp"
        type="image/webp"
        media="(max-width: 767px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/videos/frames-desktop/frame_0001.avif"
        type="image/avif"
        media="(min-width: 768px)"
        fetchPriority="high"
      />

      {/* 1. HERO ANIMATED SCROLL SECTION */}
      <CanvasSequenceScroller totalFrames={300} fps={15} totalDuration={20} />

      {/* 2. BEST SELLER SECTION */}
      <section className="py-20 sm:py-24 bg-[#ffffff]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div className="max-w-xl">
              <span className="text-xs font-bold uppercase tracking-widest text-[#a82868] block mb-2">
                BEST SELLER
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#241b18] tracking-tight">
                Yang Sering Bikin Balik Lagi.
              </h2>
              <p className="text-[#665b56] text-sm mt-1.5 leading-relaxed">
                Menu favorit pelanggan Falya yang susah ditolak. Renyah, gurih,
                dan paling nikmat disantap selagi hangat.
              </p>
            </div>

            {/* Ghost link — no border */}
            <Link
              href="/menu"
              className="self-start sm:self-auto group flex items-center gap-1.5 text-sm font-semibold text-[#a82868] hover:text-[#861f53] transition-colors"
            >
              Lihat Semua Menu
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {bestSellers.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* 3. SNACK BOX & CORPORATE ACARA */}
      <section className="py-20 sm:py-24 bg-[#faf0f4]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Shadow-only container — no border */}
          <div className="bg-[#ffffff] rounded-[24px] p-8 sm:p-12 shadow-[0_8px_30px_rgba(168,40,104,0.06)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#a82868]">
                  SNACK BOX & LUNCH BOX
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#241b18] tracking-tight leading-tight mt-1.5">
                  Siapkan Konsumsi Acara Tanpa Ribet
                </h2>
                <p className="text-[#665b56] text-sm sm:text-base leading-relaxed mt-2.5">
                  Butuh Snack Box, nasi kotak dan konsumsi untuk meeting,
                  seminar, arisan, pengajian, atau acara keluarga? Falya siap
                  membantu menyiapkan hidangan yang praktis, rapi, dan nikmat.
                  Pilihan menu dapat disesuaikan dengan kebutuhan dan anggaran
                  Anda.
                </p>
              </div>

              {/* Quick Navigation Pills */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link
                  href="/snackbox"
                  className="sm:flex-1 group flex items-center justify-between px-5 py-3.5 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200/80 hover:bg-neutral-100 hover:border-neutral-300 text-[#241b18] hover:text-neutral-900 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.07)]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📦</span>
                    <span className="font-semibold text-sm">
                      Paket Snack Box
                    </span>
                  </div>
                  <MoveRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1.5 transition-all duration-300 shrink-0 ml-2" />
                </Link>

                <Link
                  href="/nasi-liwet"
                  className="sm:flex-1 group flex items-center justify-between px-5 py-3.5 rounded-full bg-white/80 backdrop-blur-md border border-neutral-200/80 hover:bg-neutral-100 hover:border-neutral-300 text-[#241b18] hover:text-neutral-900 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.07)]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">🍱</span>
                    <span className="font-semibold text-sm">
                      Paket Nasi Liwet
                    </span>
                  </div>
                  <MoveRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-1.5 transition-all duration-300 shrink-0 ml-2" />
                </Link>
              </div>

              {/* Primary CTA */}
              <div className="pt-1">
                <Button
                  asChild
                  className="w-full sm:w-auto bg-[#a82868] hover:bg-[#861f53] text-white font-semibold rounded-full px-7 shadow-sm"
                >
                  <a
                    href={`https://wa.me/${FALYA_CONTACT.whatsappNumber}?text=Halo%20Falya,%20saya%20ingin%20konsultasi%20snackbox%20untuk%20acara.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Konsultasi via WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            {/* Image — shadow, no border */}
            <div className="lg:col-span-5 relative aspect-[4/3] rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(36,27,24,0.1)]">
              <Image
                src="/images/2026/snackbox01.webp"
                alt="Paket Snack Box Falya"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. CATEGORY CARDS */}
      <section className="py-20 sm:py-24 bg-[#fdfbfc]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a82868]">
              KATEGORI MENU
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#241b18]">
              Jelajahi Pilihan Kuliner
            </h2>
            <p className="text-[#665b56] text-xs sm:text-sm">
              Dari aneka risol gurih hingga paket nasi liwet otentik
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category 1: Risol Spesial — shadow, no border */}
            <Link
              href="/menu"
              className="group bg-white hover:bg-[#faf0f4] rounded-[20px] p-4 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_12px_rgba(36,27,24,0.07)] hover:shadow-[0_8px_28px_rgba(168,40,104,0.1)]"
            >
              <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden bg-[#faf0f4] mb-4">
                <Image
                  src="/images/2026/risol-mayo-2026.webp"
                  alt="Risol Mayo Falya"
                  fill
                  className="object-cover group-hover:scale-104 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="font-bold text-base text-[#241b18] group-hover:text-[#a82868] transition-colors">
                    Daftar Menu
                  </h3>
                  <p className="text-xs text-[#665b56]">
                    Menu lengkap Falya beserta harganya
                  </p>
                </div>
                <span className="text-xs font-bold text-[#a82868] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Lihat Menu <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Category 2: Paket Nasi Liwet */}
            <Link
              href="/nasi-liwet"
              className="group bg-white hover:bg-[#faf0f4] rounded-[20px] p-4 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_12px_rgba(36,27,24,0.07)] hover:shadow-[0_8px_28px_rgba(168,40,104,0.1)]"
            >
              <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden bg-[#faf0f4] mb-4">
                <Image
                  src="/images/item-ayam-serundeng.webp"
                  alt="Nasi Liwet Falya"
                  fill
                  className="object-cover group-hover:scale-104 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="font-bold text-base text-[#241b18] group-hover:text-[#a82868] transition-colors">
                    Paket Nasi Liwet
                  </h3>
                  <p className="text-xs text-[#665b56]">
                    Nasi Liwet Tampah dan Paket Lainnya
                  </p>
                </div>
                <span className="text-xs font-bold text-[#a82868] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Lihat Menu <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>

            {/* Category 3: Snack Box & Kue */}
            <Link
              href="/snackbox"
              className="group bg-white hover:bg-[#faf0f4] rounded-[20px] p-4 flex flex-col justify-between transition-all duration-300 shadow-[0_2px_12px_rgba(36,27,24,0.07)] hover:shadow-[0_8px_28px_rgba(168,40,104,0.1)]"
            >
              <div className="relative w-full aspect-[4/3] rounded-[16px] overflow-hidden bg-[#faf0f4] mb-4">
                <Image
                  src="/images/2026/snackbox.webp"
                  alt="Snack Box Falya"
                  fill
                  className="object-cover group-hover:scale-104 transition-transform duration-500"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="font-bold text-base text-[#241b18] group-hover:text-[#a82868] transition-colors">
                    Paket Snack Box
                  </h3>
                  <p className="text-xs text-[#665b56]">
                    Aneka Pilihan Snackbox dan Kue
                  </p>
                </div>
                <span className="text-xs font-bold text-[#a82868] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Lihat Menu <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. BRAND VALUES */}
      <section className="py-20 sm:py-24 bg-[#ffffff]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a82868]">
              STANDAR KUALITAS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#241b18]">
              Mengapa Memilih Falya?
            </h2>
          </div>

          {/* Value cards — shadow only, no border */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#faf0f4] p-6 rounded-[20px] flex flex-col items-start shadow-[0_2px_12px_rgba(168,40,104,0.04)]">
              <div className="w-10 h-10 rounded-full bg-[#a82868]/10 text-[#a82868] flex items-center justify-center mb-3">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#241b18] mb-1">
                Digoreng Hangat
              </h3>
              <p className="text-xs text-[#665b56] leading-relaxed">
                Risol digoreng seketika saat Anda memesan agar selalu renyah dan
                nikmat.
              </p>
            </div>

            <div className="bg-[#faf0f4] p-6 rounded-[20px] flex flex-col items-start shadow-[0_2px_12px_rgba(168,40,104,0.04)]">
              <div className="w-10 h-10 rounded-full bg-[#a82868]/10 text-[#a82868] flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#241b18] mb-1">
                100% Halal & Bersih
              </h3>
              <p className="text-xs text-[#665b56] leading-relaxed">
                Bahan baku segar berkualitas tinggi dengan proses pembuatan
                higienis.
              </p>
            </div>

            <div className="bg-[#faf0f4] p-6 rounded-[20px] flex flex-col items-start shadow-[0_2px_12px_rgba(168,40,104,0.04)]">
              <div className="w-10 h-10 rounded-full bg-[#a82868]/10 text-[#a82868] flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#241b18] mb-1">
                Kemasan Rapi
              </h3>
              <p className="text-xs text-[#665b56] leading-relaxed">
                Kemasan dus eksklusif yang rapi, pas untuk rapat, seminar, dan
                bingkisan.
              </p>
            </div>

            <div className="bg-[#faf0f4] p-6 rounded-[20px] flex flex-col items-start shadow-[0_2px_12px_rgba(168,40,104,0.04)]">
              <div className="w-10 h-10 rounded-full bg-[#a82868]/10 text-[#a82868] flex items-center justify-center mb-3">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#241b18] mb-1">
                Pesan Antar Cepat
              </h3>
              <p className="text-xs text-[#665b56] leading-relaxed">
                Layanan antar ke seluruh area Balikpapan tepat waktu sampai di
                tujuan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

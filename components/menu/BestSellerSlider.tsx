"use client";

import React, { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MenuItem } from "@/lib/data/menuData";
import MenuCard from "@/components/menu/MenuCard";

interface BestSellerSliderProps {
  items: MenuItem[];
}

// Slider untuk Best Seller — dibuat agar section ini bisa menampung
// lebih dari 3 produk (sebelumnya grid statis 3 kolom). Pola interaksi
// (scroll-snap + panah + dot pagination) mengikuti TestimonialSlider
// supaya perilaku slider konsisten di seluruh homepage.
export default function BestSellerSlider({ items }: BestSellerSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const getCardWidth = () => {
    if (!scrollRef.current) return 320;
    const width = scrollRef.current.clientWidth;
    if (width >= 1024) return 392; // 360px card + 32px gap (lg:gap-8)
    if (width >= 640) return 328; // 296px card + 32px gap (sm:gap-8)
    return 276; // 252px card + 24px gap (gap-6)
  };

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = getCardWidth();
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(0, index), items.length - 1));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const timer = setTimeout(checkScroll, 100);
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = getCardWidth();
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: index * getCardWidth(),
      behavior: "smooth",
    });
  };

  // Kalau produk best seller sedikit (muat semua tanpa scroll), tampilkan
  // sebagai grid biasa — panah/dot tidak relevan untuk konten yang tidak overflow.
  const showControls = items.length > 3;

  return (
    <div>
      {showControls ? (
        <>
          <div
            ref={scrollRef}
            className="flex gap-6 sm:gap-8 overflow-x-auto pb-2 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="snap-start shrink-0 w-[252px] sm:w-[296px] lg:w-[360px]"
              >
                <MenuCard item={item} />
              </div>
            ))}
          </div>

          {/* Navigation: panah (desktop) + dot pagination (mobile) */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-1.5 sm:hidden">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-6 bg-[#a82868]"
                      : "w-1.5 bg-neutral-300"
                  }`}
                  aria-label={`Ke produk ${idx + 1}`}
                />
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-3 ml-auto">
              <button
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Produk sebelumnya"
                className="w-10 h-10 rounded-full bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center text-[#241b18] hover:bg-[#faf0f4] hover:text-[#a82868] hover:border-[#a82868]/30 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Produk berikutnya"
                className="w-10 h-10 rounded-full bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center text-[#241b18] hover:bg-[#faf0f4] hover:text-[#a82868] hover:border-[#a82868]/30 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

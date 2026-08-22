"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  avatarType: "image" | "initial";
  avatarSrc?: string;
  avatarInitial?: string;
  avatarBg?: string;
  isLocalGuide?: boolean;
  userStats: string;
  timeAgo: string;
  rating: number;
  text: string;
  orderType?: string;
  pricePerPerson?: string;
  scores?: {
    food?: number;
    service?: number;
    atmosphere?: number;
  };
  attributes?: {
    noiseLevel?: string;
    waitTime?: string;
  };
}

const testimonials: Testimonial[] = [
  {
    id: "ajeng",
    name: "Ajeng Dwiyani",
    avatarType: "image",
    avatarSrc: "/images/reviews/avatar-ajeng.png",
    isLocalGuide: true,
    userStats: "Local Guide · 36 reviews · 23 photos",
    timeAgo: "1 tahun lalu",
    rating: 5,
    text: "Makanannya enak enak.. pilihan menunya terbatas tapi oke semua.. ga cuma risolnya yg recommended, lalapannya enak juga. Ada bagian belakang yang cozy, kalau bagian depan seperti resto simple biasanya",
    pricePerPerson: "Rp 25–50K",
    scores: {
      food: 5,
      service: 5,
      atmosphere: 4,
    },
    attributes: {
      noiseLevel: "Quiet, easy to talk",
      waitTime: "No wait",
    },
  },
  {
    id: "endang",
    name: "Endang Aviyanti",
    avatarType: "image",
    avatarSrc: "/images/reviews/avatar-endang.png",
    userStats: "1 review",
    timeAgo: "2 bulan lalu",
    rating: 5,
    text: "Risol langganan mantab\nUtk maksi juga enak...soto dagingnya oke..ayam kremesnya juga",
    orderType: "Delivery",
    scores: {
      food: 5,
      service: 5,
    },
  },
  {
    id: "kartika",
    name: "Kartika Puspasari",
    avatarType: "initial",
    avatarInitial: "K",
    avatarBg: "bg-[#5f6368]",
    userStats: "6 reviews",
    timeAgo: "2 bulan lalu",
    rating: 5,
    text: "Selalu puas dengan pelayanan Falya Risol,,admin Fast Respon dan makanan baik snack ataupun nasi liwet dan soto daging nya enak. Belum pernah makan di tempat selalu pesan antar next mau coba untuk makan di tempat.",
    orderType: "Delivery",
  },
  {
    id: "nayla",
    name: "Nayla Maharani",
    avatarType: "initial",
    avatarInitial: "N",
    avatarBg: "bg-[#673ab7]",
    userStats: "1 review",
    timeAgo: "1 bulan lalu",
    rating: 5,
    text: "Seneng bgt jajan di siniii!!! Sgt worth the priceee dari segi rasa, porsi dan tentunya kebersihan!!! Sukak jajannn falyaa kalo udah ngerasa mager masak wkwkwkwk pilihan praktis dan tepat kalau lagi mager 💕💕💕",
    orderType: "Take out",
    scores: {
      food: 5,
      service: 5,
      atmosphere: 5,
    },
  },
  {
    id: "novita",
    name: "Novita Triwahyuni",
    avatarType: "image",
    avatarSrc: "/images/reviews/avatar-novita.png",
    userStats: "6 reviews",
    timeAgo: "1 bulan lalu",
    rating: 5,
    text: "Nasi liwetnya juara umum se balikpapan. Ayam kremesnya favorit keluarga. Menu andalan kalau malas masak.",
    orderType: "Delivery",
    pricePerPerson: "Rp 25–50K",
    attributes: {
      noiseLevel: "Quiet, easy to talk",
    },
  },
];

// Google Multi-Color Icon SVG
function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

// Google Maps Local Guide Star Icon
function LocalGuideStar() {
  return (
    <span
      className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#f29900] text-white rounded-full flex items-center justify-center shadow-xs border border-white"
      title="Google Local Guide"
    >
      <Star className="w-2.5 h-2.5 fill-white text-white" />
    </span>
  );
}

export default function TestimonialSlider() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = 340 + 20;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(Math.max(0, index), testimonials.length - 1));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  // Auto-scroll slider with pause on hover/interaction
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const cardWidth = container.clientWidth > 640 ? 380 : 315;

      // If reached end, loop back smoothly to start
      if (scrollLeft + clientWidth >= scrollWidth - 25) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.clientWidth > 640 ? 380 : 315;
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.clientWidth > 640 ? 380 : 315;
    container.scrollTo({ left: index * cardWidth, behavior: "smooth" });
  };

  return (
    <section className="py-20 sm:py-24 bg-[#faf0f4]/50 border-y border-[#f2e2ea]/60 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#a82868]">
                Testimoni
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#5f6368] shadow-xs border border-neutral-200/60">
                <GoogleIcon className="w-3 h-3" /> Google Maps
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#241b18] tracking-tight">
              Kata Mereka yang Udah Coba
            </h2>
            <p className="text-[#665b56] text-sm sm:text-base leading-relaxed">
              Mulai dari kesan tentang menu sampai komunikasi sama admin, ini cerita mereka setelah nyobain Falya
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 self-start md:self-end">
            <button
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous review"
              className="w-10 h-10 rounded-full bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center text-[#241b18] hover:bg-[#faf0f4] hover:text-[#a82868] hover:border-[#a82868]/30 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              aria-label="Next review"
              className="w-10 h-10 rounded-full bg-white border border-neutral-200/80 shadow-xs flex items-center justify-center text-[#241b18] hover:bg-[#faf0f4] hover:text-[#a82868] hover:border-[#a82868]/30 disabled:opacity-40 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Slider */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-5 overflow-x-auto pb-6 pt-2 scroll-smooth snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {testimonials.map((review) => (
            <div
              key={review.id}
              className="snap-start shrink-0 w-[295px] sm:w-[360px] md:w-[370px] bg-white rounded-[20px] p-5 sm:p-6 shadow-[0_4px_20px_rgba(36,27,24,0.06)] border border-neutral-100 hover:shadow-[0_8px_30px_rgba(168,40,104,0.09)] hover:border-[#a82868]/20 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header: Avatar, Name, Stats & Google Icon */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {review.avatarType === "image" && review.avatarSrc ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden relative bg-neutral-100 ring-1 ring-neutral-200/60">
                          <Image
                            src={review.avatarSrc}
                            alt={review.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full ${review.avatarBg} text-white font-semibold flex items-center justify-center text-sm shadow-xs`}
                        >
                          {review.avatarInitial}
                        </div>
                      )}
                      {review.isLocalGuide && <LocalGuideStar />}
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm text-[#202124] leading-tight flex items-center gap-1.5">
                        {review.name}
                      </h3>
                      <p className="text-[11px] text-[#5f6368] leading-tight mt-0.5">
                        {review.userStats}
                      </p>
                    </div>
                  </div>

                  {/* Google Logo */}
                  <div className="shrink-0 opacity-80" title="Google Maps Review">
                    <GoogleIcon className="w-4 h-4" />
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-[#FBBC04] fill-[#FBBC04]"
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-[13px] text-[#3c4043] leading-relaxed whitespace-pre-line mb-4 font-normal">
                  {review.text}
                </p>
              </div>

              {/* Google Review Details (Order Type, Scores, Price, Noise, etc.) */}
              <div className="pt-3 border-t border-neutral-100 text-xs space-y-2 mt-auto">
                {review.orderType && (
                  <div className="flex items-center justify-between text-[#3c4043]">
                    <span className="font-medium text-[#202124]">Order type:</span>
                    <span className="text-[#5f6368] bg-neutral-100 px-2 py-0.5 rounded-md text-[11px]">
                      {review.orderType}
                    </span>
                  </div>
                )}

                {review.pricePerPerson && (
                  <div className="flex items-center justify-between text-[#3c4043]">
                    <span className="font-medium text-[#202124]">Price per person:</span>
                    <span className="text-[#5f6368] bg-neutral-100 px-2 py-0.5 rounded-md text-[11px]">
                      {review.pricePerPerson}
                    </span>
                  </div>
                )}

                {review.scores && (
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#5f6368]">
                    {review.scores.food && (
                      <span>
                        <strong className="text-[#202124]">Food:</strong> {review.scores.food}
                      </span>
                    )}
                    {review.scores.service && (
                      <span>
                        <strong className="text-[#202124]">Service:</strong> {review.scores.service}
                      </span>
                    )}
                    {review.scores.atmosphere && (
                      <span>
                        <strong className="text-[#202124]">Atmosphere:</strong> {review.scores.atmosphere}
                      </span>
                    )}
                  </div>
                )}

                {review.attributes && (
                  <div className="text-[11px] text-[#5f6368] flex flex-wrap gap-x-3 gap-y-1">
                    {review.attributes.noiseLevel && (
                      <span>
                        <strong className="text-[#202124]">Noise level:</strong> {review.attributes.noiseLevel}
                      </span>
                    )}
                    {review.attributes.waitTime && (
                      <span>
                        <strong className="text-[#202124]">Wait time:</strong> {review.attributes.waitTime}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4 sm:hidden">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollToIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? "w-6 bg-[#a82868]"
                  : "w-1.5 bg-neutral-300"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

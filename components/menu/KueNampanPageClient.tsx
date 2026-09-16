"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FALYA_CONTACT, MenuItem } from "@/lib/data/menuData";
import { KUE_NAMPAN_FAQ } from "@/lib/data/kueNampanFaq";
import { withImageVersion } from "@/lib/utils/cacheBustImage";
import MenuCard from "@/components/menu/MenuCard";

const WHY_POINTS = [
  {
    title: "Selalu Fresh",
    description:
      "Kue nampan dibuat dan diantar mendekati waktu acara, jadi kue nampan arisan atau tahlilan kamu tetap fresh saat disajikan.",
  },
  {
    title: "Minimal Order Ringan",
    description: "Bisa pesan mulai dari 1 nampan, cocok untuk acara kecil maupun besar.",
  },
  {
    title: "Bisa Custom Isi",
    description:
      "Kombinasi isi kue bisa disesuaikan dengan selera dan budget acara kamu — tinggal konsultasi dengan mimin.",
  },
  {
    title: "Area Pengiriman Balikpapan",
    description:
      "Siap antar ke seluruh area Balikpapan, jadi persiapan kue nampan tahlilan atau arisan kamu jadi lebih praktis.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(36,27,24,0.06)]">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
      >
        <span className="text-sm sm:text-base font-semibold text-[#241b18]">
          {question}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#a82868] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm text-[#665b56] leading-relaxed">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function KueNampanPageClient({ items }: { items: MenuItem[] }) {
  const heroImage = items[0]?.image ?? "/images/snackbox/kue-nampan-01.webp";

  return (
    <div className="w-full bg-[#fdfbfc] text-[#241b18] min-h-screen pt-28 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-16">
          <div className="space-y-4 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a82868]">
              KUE NAMPAN
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#241b18] tracking-tight">
              Kue Nampan Balikpapan
            </h1>
            <p className="text-[#665b56] text-sm sm:text-base leading-relaxed max-w-lg mx-auto md:mx-0">
              Kue nampan Balikpapan dari Falya, siap antar untuk arisan,
              tahlilan, dan berbagai acara kamu. Isi lengkap, rasa creamy dan
              gurih khas Falya, tinggal disajikan.
            </p>
          </div>
          <div className="relative w-full aspect-[4/3] rounded-[24px] overflow-hidden shadow-[0_16px_40px_rgba(36,27,24,0.12)]">
            <Image
              src={withImageVersion(heroImage)}
              alt="Kue Nampan Balikpapan Falya Risol Mayo"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-16 max-w-3xl mx-auto">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>

        {/* Kenapa Pilih Kue Nampan Falya */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#241b18] tracking-tight">
              Kenapa Pilih Kue Nampan Falya
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {WHY_POINTS.map((point) => (
              <div
                key={point.title}
                className="bg-[#fff8ef] rounded-[20px] p-5 sm:p-6 shadow-[0_2px_12px_rgba(36,27,24,0.04)]"
              >
                <h3 className="text-sm sm:text-base font-bold text-[#241b18] mb-1.5">
                  {point.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#665b56] leading-relaxed">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#241b18] tracking-tight text-center mb-8">
            Pertanyaan Seputar Kue Nampan
          </h2>
          <div className="space-y-3">
            {KUE_NAMPAN_FAQ.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        {/* CTA akhir */}
        <div className="bg-[#ffffff] rounded-[24px] p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-[0_8px_30px_rgba(168,40,104,0.06)] space-y-3">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#241b18]">
            Pesan Kue Nampan Sekarang
          </h3>
          <p className="text-[#665b56] text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
            Konsultasi jumlah nampan dan isi kue untuk acara kamu langsung via
            WhatsApp, mimin siap bantu.
          </p>
          <div className="pt-2">
            <Button
              asChild
              className="bg-[#a82868] hover:bg-[#861f53] text-white font-semibold rounded-full px-6 py-5 shadow-sm"
            >
              <a
                href={`https://wa.me/${FALYA_CONTACT.whatsappNumber}?text=Halo,%20saya%20mau%20pesan%20kue%20nampan...`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Pesan via WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FALYA_CONTACT } from "@/lib/data/menuData";

const FAQ_GROUPS = [
  {
    id: "risol",
    title: "Risol Mayo",
    items: [
      {
        q: "Risol mayo tahan berapa lama di suhu ruang?",
        a: "Risol Mayo Falya bisa tahan di suhu ruang maksimal 24 jam.",
      },
      {
        q: "Risol frozen tahan berapa lama?",
        a: "Risol mentah frozen yang disimpan di freezer bisa bertahan maksimal 1 minggu. Cukup goreng langsung dalam minyak panas dengan api sedang.",
      },
      {
        q: "Risol mayo berapa kalori?",
        a: "Satu risol mayo Falya (sekitar 50–60 gram) mengandung kira-kira 120–150 kkal, tergantung isiannya. Cocok untuk camilan atau teman minum teh.",
      },
    ],
  },
  {
    id: "nasi-liwet",
    title: "Nasi Liwet",
    items: [
      {
        q: "Nasi liwet tampah isi apa?",
        a: "Paket nasi liwet tampah umumnya berisi nasi liwet gurih, ayam goreng/bakar, udang goreng, ikan asin, urap, sambal, dan lalapan. Isian bisa disesuaikan dengan selera acara kamu.",
      },
      {
        q: "Nasi liwet tampah untuk berapa orang?",
        a: "Jumlah porsi nasi liwet tampah bisa disesuaikan dengan kebutuhan acara. Untuk informasi porsi dan harga yang pas, silakan konsultasi langsung via WhatsApp.",
      },
      {
        q: "Apakah pemesanan nasi liwet harus H-1?",
        a: "Kami menyarankan melakukan pemesanan minimal H-1 sebelum acara agar bahan dan persiapan bisa dilakukan dengan maksimal, terutama untuk paket tampah.",
      },
    ],
  },
  {
    id: "snack-box",
    title: "Snack Box & Kue Nampan",
    items: [
      {
        q: "Isi snack box apa saja?",
        a: "Isi snack box bervariasi sesuai paket: Snack Box Mini, Reguler, dan Komplit. Bisa dipilih jajanan, roti, atau kombinasi dengan minuman. Detail isi ada di halaman Snack Box.",
      },
      {
        q: "Berapa harga snack box untuk acara?",
        a: "Harga snack box bervariasi tergantung paket dan isi. Kamu bisa melihat daftar harga di halaman Snack Box, atau chat admin untuk penawaran kebutuhan acara.",
      },
      {
        q: "Apakah ada minimal order snack box?",
        a: "Kebutuhan minimal order tergantung jenis paket dan ketersediaan. Silakan konsultasi via WhatsApp agar kami bisa menyesuaikan dengan jumlah dan jadwal acara kamu.",
      },
    ],
  },
  {
    id: "pemesanan",
    title: "Pemesanan & Pengiriman",
    items: [
      {
        q: "Bagaimana cara pesan di Falya?",
        a: "Pilih menu favoritmu, tambahkan ke keranjang, lalu lanjutkan ke checkout. Pesanan akan otomatis terkirim ke WhatsApp admin untuk dikonfirmasi.",
      },
      {
        q: "Kapan jam operasional Falya?",
        a: "Falya buka setiap hari Senin–Minggu pukul 08.00–18.00 WITA, berlokasi di Jl. Syarifuddin Yoes no.4 RT 41, Seberang Pelangi B-Point, belakang bengkel BBS, Balikpapan Selatan.",
      },
      {
        q: "Apakah bisa untuk kebutuhan acara atau kantor?",
        a: "Bisa! Snack box, nasi liwet, dan kue nampan Falya siap untuk kebutuhan rapat kantor, pengajian, hajatan, dan arisan. Konsultasikan kebutuhanmu via WhatsApp.",
      },
    ],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  ),
};

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(36,27,24,0.06)]">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
      >
        <span className="text-sm sm:text-base font-semibold text-[#241b18]">
          {q}
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
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="w-full bg-[#fdfbfc] text-[#241b18] min-h-screen pt-28 pb-20">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#a82868]">
            PUSAT BANTUAN
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#241b18] tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="text-[#665b56] text-sm sm:text-base leading-relaxed">
            Temukan jawaban seputar risol mayo, nasi liwet, snack box, dan cara
            pemesanan di Falya. Belum ketemu? Langsung chat admin ya!
          </p>
        </div>

        {/* FAQ Groups */}
        <div className="space-y-10">
          {FAQ_GROUPS.map((group) => (
            <section key={group.id}>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#241b18] mb-4">
                {group.title}
              </h2>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div className="bg-[#fff8ef] rounded-[24px] p-8 sm:p-10 text-center mt-14 shadow-[0_8px_30px_rgba(168,40,104,0.06)] space-y-3">
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#241b18]">
            Masih Ada Pertanyaan?
          </h3>
          <p className="text-[#665b56] text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
            Admin Falya siap membantu seputar menu, harga, atau kebutuhan acara
            kamu. Chat kami langsung via WhatsApp, yuk!
          </p>
          <div className="pt-2">
            <Button
              asChild
              className="bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-full px-6 py-5 shadow-sm"
            >
              <a
                href={`https://wa.me/${FALYA_CONTACT.whatsappNumber}?text=Halo%20Admin%20Falya,%20saya%20ingin%20bertanya.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Chat Admin via WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

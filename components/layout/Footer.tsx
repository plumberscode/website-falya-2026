import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import { FALYA_CONTACT } from "@/lib/data/menuData";

export default function Footer() {
  return (
    <footer
      id="locations"
      className="bg-gradient-to-br from-[#9c215e] via-[#861f53] to-[#6b1440] text-white relative overflow-hidden"
    >
      {/* Subtle ambient glow decoration */}
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-black/10 blur-3xl pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-14 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="flex flex-col gap-3.5">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logo-risol-mayo.webp"
                alt="Logo Falya Risol Mayo"
                width={130}
                height={64}
                className="object-contain w-auto h-9 sm:h-11"
              />
            </Link>

            <p className="text-xs text-white/80 leading-relaxed">
              Dibuat dengan cinta dan resep istimewa. Menghadirkan risol hangat
              dengan kulit renyah, saus mayo lumer, serta paket nasi liwet
              otentik di Balikpapan.
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={`https://wa.me/${FALYA_CONTACT.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                title="WhatsApp Falya"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <a
                href={`https://instagram.com/${FALYA_CONTACT.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all shadow-sm"
                title="Instagram Falya"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              <a
                href={`tel:${FALYA_CONTACT.phone}`}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all shadow-sm"
                title="Telepon Falya"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Menu Links */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold text-white text-sm tracking-wide">
              Menu & Layanan
            </h4>
            <ul className="flex flex-col gap-2 text-xs">
              <li>
                <Link
                  href="/menu"
                  className="text-white/80 hover:text-white hover:translate-x-0.5 inline-block transition-all"
                >
                  Daftar Menu Lengkap
                </Link>
              </li>
              <li>
                <Link
                  href="/snackbox"
                  className="text-white/80 hover:text-white hover:translate-x-0.5 inline-block transition-all"
                >
                  Paket Snack Box
                </Link>
              </li>
              <li>
                <Link
                  href="/nasi-liwet"
                  className="text-white/80 hover:text-white hover:translate-x-0.5 inline-block transition-all"
                >
                  Paket Nasi Liwet
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-white/80 hover:text-white hover:translate-x-0.5 inline-block transition-all"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Location & Hours */}
          <div className="flex flex-col gap-2.5 lg:col-span-2">
            <h4 className="font-bold text-white text-sm tracking-wide">
              Outlet Balikpapan
            </h4>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#ffd166] shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">
                    {FALYA_CONTACT.address}
                  </p>
                  <a
                    href="https://maps.google.com/?q=Falya+Risol+Mayo+Balikpapan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#ffd166] hover:underline mt-1 font-semibold"
                  >
                    Buka Google Maps <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Clock className="w-4 h-4 text-[#ffd166] shrink-0" />
                <p className="text-white/80">
                  <strong className="text-white">Buka:</strong>{" "}
                  {FALYA_CONTACT.hours}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-3">
          <p>
            © {new Date().getFullYear()} Falya Risol Mayo. Hak cipta dilindungi.
          </p>
          <p>Balikpapan, Kalimantan Timur</p>
        </div>
      </div>
    </footer>
  );
}

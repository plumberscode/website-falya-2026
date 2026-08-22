"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShoppingCart,
  Menu,
  X,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { FALYA_CONTACT } from "@/lib/data/menuData";

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { getTotalItems, toggleCart } = useCartStore();
  const totalItems = getTotalItems();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (pathname === "/") {
        setIsVisible(scrollY > window.innerHeight * 3.8);
      } else {
        setIsVisible(true);
      }

      setIsScrolled(scrollY > 30);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "Snack Box", href: "/snackbox" },
    { label: "Nasi Liwet", href: "/nasi-liwet" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        } ${
          isScrolled || mobileMenuOpen
            ? "bg-white/90 backdrop-blur-md shadow-[0_1px_20px_rgba(36,27,24,0.07)] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative group-hover:opacity-80 transition-opacity">
              <Image
                src="/images/logo-risol-mayo.webp"
                alt="Logo Falya Risol Mayo"
                width={120}
                height={59}
                className="object-contain w-auto h-9 sm:h-11"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation Links — Ghost / Minimal Style */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative group flex flex-col items-center gap-1"
                >
                  <span
                    className={`text-sm font-medium tracking-wide transition-colors duration-200 ${
                      isActive
                        ? "text-[#a82868] font-semibold"
                        : isScrolled || mobileMenuOpen || pathname !== "/"
                          ? "text-[#665b56] hover:text-[#241b18]"
                          : "text-white/90 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </span>
                  {/* Indicator dot for active state */}
                  <span
                    className={`block h-[3px] rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-4 bg-[#a82868]"
                        : "w-0 bg-[#a82868] group-hover:w-3 group-hover:bg-[#a82868]/40"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Cart — Ghost Style */}
            <button
              onClick={toggleCart}
              className={`relative flex items-center gap-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                isScrolled || mobileMenuOpen || pathname !== "/"
                  ? "text-[#665b56] hover:text-[#a82868]"
                  : "text-white/90 hover:text-white"
              }`}
              aria-label="Keranjang Belanja"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              <span className="hidden sm:inline text-sm font-medium">
                Keranjang
              </span>
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 sm:static sm:ml-0.5 bg-[#a82868] text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger — Ghost */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-1 transition-colors ${
                isScrolled || mobileMenuOpen || pathname !== "/"
                  ? "text-[#241b18] hover:text-[#a82868]"
                  : "text-white hover:text-white/70"
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Full-Screen Menu — covers 100vh, smooth overlay */}
      {mobileMenuOpen && (
        <div
          key="mobile-menu"
          className="fixed inset-0 z-40 md:hidden h-dvh bg-white/95 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300 ease-out"
        >
            <div className="min-h-full flex flex-col px-5 pt-24 pb-8">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, i) => {
                  const isActive = pathname === link.href;
                  return (
                    <div
                      key={link.href}
                      className="animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out [animation-fill-mode:both]"
                      style={{ animationDelay: `${0.05 + i * 0.05}s` }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group flex items-center justify-between rounded-2xl px-5 py-4 text-base transition-all duration-200 ${
                          isActive
                            ? "bg-[#fdf2f7] text-[#a82868] font-semibold"
                            : "text-[#665b56] font-medium hover:bg-[#fdf2f7] hover:text-[#241b18]"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                              isActive ? "bg-[#a82868]" : "bg-transparent"
                            }`}
                          />
                          <span>{link.label}</span>
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 transition-all duration-200 ${
                            isActive
                              ? "text-[#a82868] opacity-90"
                              : "opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 text-[#665b56]"
                          }`}
                        />
                      </Link>
                    </div>
                  );
                })}
              </nav>

              <div className="mt-6">
                <a
                  href={`https://wa.me/${FALYA_CONTACT.whatsappNumber}?text=Halo%20Falya,%20saya%20ingin%20memesan.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#a82868] hover:bg-[#861f53] text-white py-4 rounded-full font-semibold text-sm shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Pesan via WhatsApp
                </a>
              </div>
            </div>
        </div>
      )}
    </>
  );
}

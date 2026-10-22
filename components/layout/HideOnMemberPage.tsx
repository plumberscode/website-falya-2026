"use client";

import { usePathname } from "next/navigation";

/**
 * Dashboard member (/m/{token}) punya header & footer sendiri (desain
 * dashboard-poin-member.html), jadi Navbar, Footer, keranjang, dan tombol
 * WhatsApp situs disembunyikan di sana.
 */
export default function HideOnMemberPage({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/m/")) return null;
  return <>{children}</>;
}

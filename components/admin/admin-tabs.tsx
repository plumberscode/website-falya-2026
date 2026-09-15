"use client";

import Link from "next/link";
import { UtensilsCrossed, BookOpen, SearchCheck, Bot, LucideIcon } from "lucide-react";

/**
 * Tab switcher bersama untuk semua halaman /admin/*. Sebelumnya blok JSX ini
 * di-copy-paste identik di app/admin/page.tsx, app/admin/blog/page.tsx, dan
 * app/admin/seo/page.tsx (3x duplikasi, tanpa shared component) -- di-extract
 * di sini supaya menambah destinasi baru (mis. /admin/agents) tidak berarti
 * mengedit blok yang sama di banyak file sekaligus.
 */

export type AdminTabKey = "menu" | "blog" | "seo" | "agents";

interface Tab {
  key: AdminTabKey;
  href: string;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { key: "menu", href: "/admin", label: "Katalog Menu", icon: UtensilsCrossed },
  { key: "blog", href: "/admin/blog", label: "Artikel Blog", icon: BookOpen },
  { key: "seo", href: "/admin/seo", label: "Audit SEO", icon: SearchCheck },
  { key: "agents", href: "/admin/agents", label: "Agent Dashboard", icon: Bot },
];

interface AdminTabsProps {
  active: AdminTabKey;
  /** Angka opsional per tab, mis. { blog: posts.length } -- ditampilkan
   * sebagai "Label (n)". Tab tanpa entry di sini tampil tanpa angka. */
  counts?: Partial<Record<AdminTabKey, number>>;
}

export function AdminTabs({ active, counts }: AdminTabsProps) {
  return (
    <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-[#f3d5e3]/40 w-fit shadow-xs flex-wrap">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const count = counts?.[tab.key];
        const label = count !== undefined ? `${tab.label} (${count})` : tab.label;

        if (tab.key === active) {
          return (
            <div
              key={tab.key}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#a82868] text-white shadow-xs"
            >
              <Icon className="w-4 h-4 text-white" />
              {label}
            </div>
          );
        }

        return (
          <Link
            key={tab.key}
            href={tab.href}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#665b56] hover:bg-[#faf0f4] transition"
          >
            <Icon className="w-4 h-4 text-[#968b85]" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

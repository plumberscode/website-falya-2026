import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rejectUnlessAgent } from "@/lib/agent-auth";

const BASE_URL = "https://www.falyarisol.com";

// Halaman statis yang bisa jadi target internal link / FAQ tambahan --
// sama dengan daftar statis di app/sitemap.ts.
const LANDING_PATHS = ["/", "/menu", "/snackbox", "/nasi-liwet", "/kue-nampan-balikpapan", "/faq", "/blog"];

/**
 * Endpoint machine-to-machine (READ-ONLY) untuk Agent 5 (Keyword
 * Strategist, Karyawan AI): semua konten yang SUDAH ada di situs, supaya
 * agent tidak mengusulkan topik yang sudah ditulis (kanibalisasi) dan tahu
 * halaman mana yang bisa di-link. Termasuk draft -- draft yang belum tayang
 * tetap dihitung "sudah ada" supaya tidak ditulis dua kali.
 */
export async function GET(request: NextRequest) {
  const rejection = rejectUnlessAgent(request);
  if (rejection) return rejection;

  const [posts, menuItems, planItems, pendingPlanJobs] = await Promise.all([
    prisma.post.findMany({
      select: { slug: true, title: true, category: true, isPublished: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.menuItem.findMany({
      where: { isAvailable: true },
      select: { name: true, category: true, price: true, isBestseller: true },
    }),
    prisma.contentPlanItem.findMany({
      select: { clusterKey: true, status: true, action: true },
    }),
    prisma.contentJobRequest.count({ where: { status: "pending", planItemId: { not: null } } }),
  ]);

  return NextResponse.json({
    posts: posts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      slug: p.slug,
      title: p.title,
      category: p.category,
      is_published: p.isPublished,
      published_at: p.publishedAt.toISOString(),
    })),
    landing_pages: LANDING_PATHS.map((path) => `${BASE_URL}${path}`),
    menu_items: menuItems.map((m) => ({
      name: m.name,
      category: m.category,
      price: m.price,
      is_bestseller: m.isBestseller,
    })),
    plan_items: planItems.map((p) => ({
      cluster_key: p.clusterKey,
      status: p.status,
      action: p.action,
    })),
    pending_plan_jobs: pendingPlanJobs,
  });
}

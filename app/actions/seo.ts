"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";

/**
 * Baca riwayat laporan audit SEO untuk /admin/seo. Tanpa session gate --
 * sama seperti getAllMenuItems/getAllPosts, ini cuma READ, dan satu-satunya
 * PENULIS tabel ini adalah endpoint agent (app/api/admin/seo/audit-report,
 * otentikasi x-agent-secret) -- lihat agents.md bagian 7 (audit-only,
 * belum ada aksi approve/edit dari admin panel).
 */
export async function getSeoAuditReports(limit = 20) {
  try {
    const reports = await prisma.seoAuditReport.findMany({
      orderBy: { generatedAt: "desc" },
      take: limit,
    });
    return reports;
  } catch (error) {
    console.error("Error fetching SEO audit reports:", error);
    return [];
  }
}

export async function getSeoAuditReportById(id: string) {
  try {
    return await prisma.seoAuditReport.findUnique({ where: { id } });
  } catch (error) {
    console.error("Error fetching SEO audit report:", error);
    return null;
  }
}

/**
 * Usulan fix pending (saat ini cuma field metaDescription pada Post, lihat
 * app/api/admin/seo/audit-report/route.ts) -- di-join manual ke Post di
 * sini (bukan @relation Prisma, konsisten dengan schema.prisma) supaya UI
 * bisa langsung tampilkan judul/slug artikel tanpa query terpisah.
 * Tanpa session gate -- READ-ONLY, sama seperti getSeoAuditReports.
 */
export async function getPendingSeoFixes() {
  try {
    const fixes = await prisma.seoProposedFix.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
    });
    if (fixes.length === 0) return [];

    const posts = await prisma.post.findMany({
      where: { id: { in: fixes.map((f) => f.postId) } },
      select: { id: true, title: true, slug: true },
    });
    const postById = new Map(posts.map((p) => [p.id, p]));

    return fixes.map((fix) => ({
      ...fix,
      post: postById.get(fix.postId) ?? null,
    }));
  } catch (error) {
    console.error("Error fetching pending SEO fixes:", error);
    return [];
  }
}

/**
 * Terapkan usulan fix ke Post -- MUTASI, wajib session admin (pola sama
 * persis updatePost/deletePost di app/actions/blog.ts). HANYA menulis
 * field yang ditarget fix (metaDescription), sengaja TIDAK ikut mengubah
 * `excerpt` (tujuan beda, lihat komentar model Post di schema.prisma).
 */
export async function approveSeoFix(id: string) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    const fix = await prisma.seoProposedFix.findUnique({ where: { id } });
    if (!fix || fix.status !== "pending") {
      return { success: false, error: "Usulan fix tidak ditemukan atau sudah diputuskan." };
    }
    if (fix.field !== "metaDescription") {
      // Guard untuk masa depan -- v1 cuma pernah generate field ini.
      return { success: false, error: `Field "${fix.field}" belum didukung untuk diterapkan otomatis.` };
    }

    const post = await prisma.$transaction(async (tx) => {
      const updatedPost = await tx.post.update({
        where: { id: fix.postId },
        data: { metaDescription: fix.proposedValue },
      });
      await tx.seoProposedFix.update({
        where: { id: fix.id },
        data: { status: "applied", decidedAt: new Date() },
      });
      return updatedPost;
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/admin/seo");

    return { success: true };
  } catch (error) {
    console.error("Error approving SEO fix:", error);
    return { success: false, error: "Gagal menerapkan fix." };
  }
}

export async function rejectSeoFix(id: string) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    const fix = await prisma.seoProposedFix.findUnique({ where: { id } });
    if (!fix || fix.status !== "pending") {
      return { success: false, error: "Usulan fix tidak ditemukan atau sudah diputuskan." };
    }

    await prisma.seoProposedFix.update({
      where: { id },
      data: { status: "rejected", decidedAt: new Date() },
    });

    revalidatePath("/admin/seo");
    return { success: true };
  } catch (error) {
    console.error("Error rejecting SEO fix:", error);
    return { success: false, error: "Gagal menolak fix." };
  }
}

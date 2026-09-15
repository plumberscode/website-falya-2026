"use server";

import { prisma } from "@/lib/prisma";

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

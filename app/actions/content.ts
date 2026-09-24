"use server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { triggerAgentWorkflow } from "@/lib/github-dispatch";

/**
 * Ajukan permintaan artikel AI baru (Agent 4 -- Content Writer). MUTASI,
 * wajib session admin. Dedupe: kalau masih ada permintaan "pending",
 * TIDAK bikin baris baru -- hindari numpuk kalau tombol diklik berkali-kali
 * sebelum sempat diproses. `instruction` opsional -- kosongkan supaya agent
 * pilih topik sendiri dari data produk laris + keyword gap, atau isi untuk
 * mengarahkan tema tertentu (mis. "tulis soal snack box untuk kantor").
 */
export async function requestContentJob(instruction?: string) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    // Hanya permintaan manual yang di-dedupe -- job otomatis dari rencana
    // konten (planItemId terisi) tidak boleh memblokir permintaan admin.
    const existingPending = await prisma.contentJobRequest.findFirst({
      where: { status: "pending", planItemId: null },
    });
    if (existingPending) {
      return { success: false, error: "Masih ada permintaan artikel yang menunggu diproses." };
    }

    await prisma.contentJobRequest.create({
      data: { status: "pending", instruction: instruction?.trim() || null },
    });
    await triggerAgentWorkflow("content_writer_dispatch");
    return { success: true };
  } catch (error) {
    console.error("Error requesting content job:", error);
    return { success: false, error: "Gagal mengajukan permintaan artikel." };
  }
}

/**
 * Baca status permintaan MANUAL pending terbaru untuk ditampilkan di
 * /admin/blog & /admin/agents (job otomatis dari rencana konten tampil di
 * section "Rencana Konten" /admin/seo). Read-only, tanpa session gate
 * (sama seperti getSeoAuditReports).
 */
export async function getPendingContentJob() {
  try {
    return await prisma.contentJobRequest.findFirst({
      where: { status: "pending", planItemId: null },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error fetching pending content job:", error);
    return null;
  }
}

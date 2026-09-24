"use server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { triggerAgentWorkflow } from "@/lib/github-dispatch";
import { MAX_PENDING_PLAN_JOBS, queuePlanItem } from "@/lib/content-plan";

/**
 * Server actions section "Rencana Konten" di /admin/seo. Satu-satunya
 * penulis ContentPlanItem selain ini adalah endpoint agent
 * app/api/admin/content/plan (Agent 5, x-agent-secret). Baca tanpa session
 * gate (READ-ONLY, pola sama getSeoAuditReports); mutasi wajib session admin.
 */

export async function getContentPlanItems() {
  try {
    const items = await prisma.contentPlanItem.findMany({
      where: { status: { in: ["proposed", "queued", "drafted"] } },
      orderBy: { score: "desc" },
    });
    const postIds = items.map((i) => i.postId).filter((id): id is string => !!id);
    const posts = postIds.length
      ? await prisma.post.findMany({
          where: { id: { in: postIds } },
          select: { id: true, title: true, slug: true, isPublished: true },
        })
      : [];
    const postById = new Map(posts.map((p) => [p.id, p]));
    return items.map((item) => ({
      ...item,
      secondaryKeywords: Array.isArray(item.secondaryKeywords) ? (item.secondaryKeywords as string[]) : [],
      post: item.postId ? postById.get(item.postId) ?? null : null,
    }));
  } catch (error) {
    console.error("Error fetching content plan items:", error);
    return [];
  }
}

/** Tombol "Tulis Sekarang" -- antrikan satu item ke Content Writer sekarang juga. */
export async function queueContentPlanItem(id: string) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    const item = await prisma.contentPlanItem.findUnique({ where: { id } });
    if (!item || item.action !== "NEW_ARTICLE" || item.status !== "proposed") {
      return { success: false, error: "Item rencana tidak ditemukan atau sudah diproses." };
    }
    if (!(await queuePlanItem(item))) {
      return {
        success: false,
        error: `Antrian penuh -- maksimal ${MAX_PENDING_PLAN_JOBS} artikel dari rencana ditulis bersamaan.`,
      };
    }

    await triggerAgentWorkflow("content_writer_dispatch");
    return { success: true };
  } catch (error) {
    console.error("Error queueing content plan item:", error);
    return { success: false, error: "Gagal mengantrikan artikel." };
  }
}

/** Tombol "Lewati" -- item tidak diusulkan lagi di run strategist berikutnya. */
export async function skipContentPlanItem(id: string) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    const { count } = await prisma.contentPlanItem.updateMany({
      where: { id, status: "proposed" },
      data: { status: "skipped" },
    });
    if (count === 0) {
      return { success: false, error: "Item rencana tidak ditemukan atau sudah diproses." };
    }
    return { success: true };
  } catch (error) {
    console.error("Error skipping content plan item:", error);
    return { success: false, error: "Gagal melewati item." };
  }
}

/** Tombol "Perbarui Rencana" -- jalankan Agent 5 sekarang (GitHub Actions). */
export async function requestKeywordStrategistRun() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }
    await triggerAgentWorkflow("keyword_strategist_dispatch");
    return { success: true };
  } catch (error) {
    console.error("Error dispatching keyword strategist:", error);
    return { success: false, error: "Gagal menjalankan Keyword Strategist." };
  }
}

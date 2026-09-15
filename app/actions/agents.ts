"use server";

import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

/**
 * Server actions untuk dashboard /admin/agents. Semua baca di sini LANGSUNG
 * lewat Prisma (bukan fetch endpoint x-agent-secret milik sendiri) -- pola
 * sama persis getSeoAuditReports/getAllPosts: endpoint app/api/admin/agents/*
 * eksklusif untuk agent Python, UI admin manusia tidak pernah menyentuhnya.
 */

const AGENT_NAMES = ["sales_sync", "seo_audit", "content_writer"] as const;
export type AgentName = (typeof AGENT_NAMES)[number];

// AgentTaskRequest cuma untuk sales_sync & seo_audit -- content_writer
// tetap pakai ContentJobRequest (requestContentJob/getPendingContentJob di
// app/actions/content.ts), tidak digabung. Lihat komentar AgentTaskRequest
// di schema.prisma.
const TASKABLE_AGENT_NAMES = ["sales_sync", "seo_audit"] as const;
export type TaskableAgentName = (typeof TASKABLE_AGENT_NAMES)[number];

/**
 * Run terakhir (apapun statusnya -- running/success/error) per agent, untuk
 * Section 2 (Progress). Tanpa session gate -- READ-ONLY, satu-satunya
 * PENULIS AgentRunLog adalah endpoint agent (x-agent-secret), sama seperti
 * getSeoAuditReports.
 */
export async function getLatestRunPerAgent() {
  try {
    const results = await Promise.all(
      AGENT_NAMES.map((agentName) =>
        prisma.agentRunLog.findFirst({
          where: { agentName },
          orderBy: { startedAt: "desc" },
        })
      )
    );
    return Object.fromEntries(AGENT_NAMES.map((name, i) => [name, results[i]])) as Record<
      AgentName,
      Awaited<ReturnType<typeof prisma.agentRunLog.findFirst>>
    >;
  } catch (error) {
    console.error("Error fetching latest agent runs:", error);
    return Object.fromEntries(AGENT_NAMES.map((name) => [name, null])) as Record<AgentName, null>;
  }
}

/** Riwayat run satu agent (dipakai saat baris Progress di-expand). */
export async function getAgentRunLogs(agentName: string, limit = 20) {
  try {
    return await prisma.agentRunLog.findMany({
      where: { agentName },
      orderBy: { startedAt: "desc" },
      take: limit,
    });
  } catch (error) {
    console.error("Error fetching agent run logs:", error);
    return [];
  }
}

/**
 * 5 produk bestseller saat ini (Section 1 Overview) -- flag isBestseller
 * di-set Agent "Website Sync" (Karyawan AI), bukan kurasi manual, lihat
 * MenuItem di schema.prisma.
 */
export async function getBestsellers() {
  try {
    return await prisma.menuItem.findMany({
      where: { isBestseller: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching bestsellers:", error);
    return [];
  }
}

/**
 * Hitungan ringkas untuk Section 4 (Approval queue) -- CUMA ringkasan +
 * link ke /admin/seo & /admin/blog, TIDAK ada approve/reject UI baru di
 * sini (sudah ada di masing-masing halaman itu, lihat approveSeoFix/
 * rejectSeoFix di app/actions/seo.ts). Tanpa session gate -- READ-ONLY.
 */
export async function getApprovalQueueCounts() {
  try {
    const [pendingSeoFixes, draftPosts] = await Promise.all([
      prisma.seoProposedFix.count({ where: { status: "pending" } }),
      prisma.post.count({ where: { isPublished: false } }),
    ]);
    return { pendingSeoFixes, draftPosts };
  } catch (error) {
    console.error("Error fetching approval queue counts:", error);
    return { pendingSeoFixes: 0, draftPosts: 0 };
  }
}

/**
 * Laporan audit SEO terakhir untuk Section 5 -- pakai kolom denormalisasi
 * (totalBrokenLinks, totalMetaIssues, avgPerformanceScore) yang SUDAH
 * mewakili "issue per kategori" (broken link, meta tag), bukan parse ulang
 * reportJson mentah -- lihat komentar SeoAuditReport di schema.prisma.
 */
export async function getSeoSummary() {
  try {
    return await prisma.seoAuditReport.findFirst({ orderBy: { generatedAt: "desc" } });
  } catch (error) {
    console.error("Error fetching SEO summary:", error);
    return null;
  }
}

/**
 * Artikel published bulan berjalan (pakai publishedAt, bukan createdAt --
 * field ini juga dipakai untuk "Terjadwal" kalau di masa depan, jadi
 * dibatasi <= now supaya post terjadwal belum ikut terhitung) vs draft
 * pending (isPublished=false).
 */
export async function getContentSummary() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [publishedThisMonth, drafts] = await Promise.all([
      prisma.post.count({
        where: { isPublished: true, publishedAt: { gte: startOfMonth, lte: now } },
      }),
      prisma.post.count({ where: { isPublished: false } }),
    ]);
    return { publishedThisMonth, drafts };
  } catch (error) {
    console.error("Error fetching content summary:", error);
    return { publishedThisMonth: 0, drafts: 0 };
  }
}

/**
 * Baris mentah untuk Section 7 (Cost & usage) -- grouping per agent+bulan
 * dilakukan CLIENT-SIDE (lihat groupCostByAgentMonth di page.tsx), bukan
 * Prisma groupBy, karena cadence run manual/jarang (dataset kecil, tidak
 * perlu agregasi di database).
 */
export async function getCostSummary() {
  try {
    return await prisma.agentRunLog.findMany({
      where: { estimatedCostUsd: { not: null } },
      select: {
        agentName: true,
        estimatedCostUsd: true,
        inputTokens: true,
        outputTokens: true,
        startedAt: true,
      },
      orderBy: { startedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching cost summary:", error);
    return [];
  }
}

/**
 * Ajukan instruksi ad-hoc untuk Sales Sync / SEO Auditor (pengganti "chat" --
 * lihat bagian 0 prd-dashboard.md). MUTASI, wajib session admin, pola sama
 * persis requestContentJob (app/actions/content.ts). Dedupe: kalau masih
 * ada permintaan pending untuk agent yang sama, tidak bikin baris baru.
 */
export async function createAgentTaskRequest(agentName: TaskableAgentName, instruction?: string) {
  try {
    if (!TASKABLE_AGENT_NAMES.includes(agentName)) {
      // Guard runtime -- TypeScript sudah membatasi lewat TaskableAgentName,
      // ini jaring pengaman kalau ada caller yang bypass tipe (mis. dari JS
      // biasa/DevTools).
      return { success: false, error: `Agent "${agentName}" tidak mendukung instruksi ad-hoc.` };
    }

    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    const existingPending = await prisma.agentTaskRequest.findFirst({
      where: { agentName, status: "pending" },
    });
    if (existingPending) {
      return { success: false, error: "Masih ada permintaan yang menunggu diproses untuk agent ini." };
    }

    await prisma.agentTaskRequest.create({
      data: { agentName, instruction: instruction?.trim() || null },
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating agent task request:", error);
    return { success: false, error: "Gagal mengajukan permintaan." };
  }
}

/**
 * Baca status permintaan pending terbaru per agent, untuk Section 3.
 * Read-only, tanpa session gate (sama seperti getPendingContentJob).
 */
export async function getPendingAgentTask(agentName: TaskableAgentName) {
  try {
    return await prisma.agentTaskRequest.findFirst({
      where: { agentName, status: "pending" },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error fetching pending agent task:", error);
    return null;
  }
}

/**
 * Section 6: checklist roadmap manual -- catatan admin sendiri, bukan data
 * otomatis dari agent. Read-only, tanpa session gate (sama seperti
 * getSeoAuditReports); mutasi (create/toggle/delete) wajib session admin,
 * pola sama persis deletePost (app/actions/blog.ts).
 */
export async function getRoadmapNotes() {
  try {
    return await prisma.agentRoadmapNote.findMany({ orderBy: { createdAt: "asc" } });
  } catch (error) {
    console.error("Error fetching roadmap notes:", error);
    return [];
  }
}

export async function createRoadmapNote(text: string) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }
    const trimmed = text.trim();
    if (!trimmed) {
      return { success: false, error: "Catatan tidak boleh kosong." };
    }
    await prisma.agentRoadmapNote.create({ data: { text: trimmed } });
    return { success: true };
  } catch (error) {
    console.error("Error creating roadmap note:", error);
    return { success: false, error: "Gagal menambahkan catatan." };
  }
}

export async function toggleRoadmapNote(id: string, done: boolean) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }
    await prisma.agentRoadmapNote.update({ where: { id }, data: { done } });
    return { success: true };
  } catch (error) {
    console.error("Error toggling roadmap note:", error);
    return { success: false, error: "Gagal mengubah status catatan." };
  }
}

export async function deleteRoadmapNote(id: string) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }
    await prisma.agentRoadmapNote.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Error deleting roadmap note:", error);
    return { success: false, error: "Gagal menghapus catatan." };
  }
}

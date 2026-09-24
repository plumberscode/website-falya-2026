import type { ContentPlanItem } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Logika bersama antrian rencana konten (ContentPlanItem -> ContentJobRequest)
 * -- dipakai endpoint agent app/api/admin/content/plan (auto-queue mingguan
 * Agent 5) dan server action queueContentPlanItem (tombol "Tulis Sekarang"
 * di /admin/seo), supaya instruksi ke Content Writer selalu sama bentuknya.
 */

const BASE_URL = "https://www.falyarisol.com";

// Batas job artikel dari rencana yang boleh menunggu sekaligus -- menahan
// beban review admin & biaya LLM kalau strategist di-run berkali-kali.
export const MAX_PENDING_PLAN_JOBS = 2;

export const PLAN_ACTIONS = ["NEW_ARTICLE", "REFRESH", "ADD_FAQ_TO_LANDING"] as const;
export const PLAN_INTENTS = ["informational", "commercial", "transactional"] as const;

const INTENT_LABELS: Record<string, string> = {
  informational: "informasional (orang sedang cari tahu/membandingkan sebelum memutuskan)",
  commercial: "komersial (orang sedang menimbang pilihan/rekomendasi)",
  transactional: "transaksional (orang siap pesan -- harga, cara pesan, lokasi)",
};

const PRODUCT_PAGES = ["/snackbox", "/nasi-liwet", "/kue-nampan-balikpapan", "/menu"];

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

export async function buildPlanInstruction(item: ContentPlanItem): Promise<string> {
  const [existingPosts, menuItems] = await Promise.all([
    prisma.post.findMany({
      select: { title: true, slug: true },
      orderBy: { publishedAt: "desc" },
      take: 30,
    }),
    prisma.menuItem.findMany({
      where: { isAvailable: true },
      select: { name: true, price: true, unit: true },
      orderBy: [{ category: "asc" }, { price: "asc" }],
    }),
  ]);
  const secondary = asStringArray(item.secondaryKeywords).slice(0, 8);

  const lines = [
    `Keyword utama: "${item.primaryKeyword}".`,
    secondary.length ? `Variasi yang juga dicari orang: ${secondary.map((k) => `"${k}"`).join(", ")}.` : null,
    `Search intent: ${INTENT_LABELS[item.intent] ?? item.intent}.`,
    "Tulis artikel yang benar-benar menjawab pencarian ini untuk calon pelanggan di Balikpapan supaya layak " +
      "masuk halaman 1 Google: keyword utama wajib muncul natural di title, paragraf pertama, dan minimal satu <h2>; " +
      "variasi dipakai sebagai sub-pertanyaan/heading, bukan ditumpuk.",
    existingPosts.length
      ? "Artikel yang SUDAH ada di blog (JANGAN ulang topik/sudut yang sama; tautkan dengan <a href> kalau relevan):\n" +
        existingPosts.map((p) => `- ${p.title} (${BASE_URL}/blog/${p.slug})`).join("\n")
      : null,
    `Halaman produk yang bisa ditautkan kalau relevan: ${PRODUCT_PAGES.map((p) => BASE_URL + p).join(", ")}.`,
    // Sumber fakta produk -- AGENTS.md: jangan pernah mengarang produk.
    menuItems.length
      ? "Produk yang BENAR-BENAR dijual Falya saat ini (nama & harga ini satu-satunya sumber fakta produk; " +
        "JANGAN menyebut/menjanjikan produk, varian, atau harga di luar daftar ini -- kalau keyword menyebut " +
        "produk yang tidak ada di daftar, arahkan ke alternatif yang ada):\n" +
        menuItems
          .map((m) => `- ${m.name}: Rp${m.price.toLocaleString("id-ID")}${m.unit ? `/${m.unit}` : ""}`)
          .join("\n")
      : null,
  ];
  return lines.filter(Boolean).join("\n");
}

/**
 * Buat ContentJobRequest untuk satu item rencana (NEW_ARTICLE berstatus
 * proposed) lalu tandai item "queued". Return false (tanpa efek) kalau item
 * tidak memenuhi syarat atau batas antrian sudah penuh. TIDAK memicu
 * workflow -- pemanggil yang dispatch sekali setelah semua item diproses.
 */
export async function queuePlanItem(item: ContentPlanItem): Promise<boolean> {
  if (item.action !== "NEW_ARTICLE" || item.status !== "proposed") return false;

  const pending = await prisma.contentJobRequest.count({
    where: { status: "pending", planItemId: { not: null } },
  });
  if (pending >= MAX_PENDING_PLAN_JOBS) return false;

  const instruction = await buildPlanInstruction(item);
  await prisma.$transaction([
    prisma.contentJobRequest.create({
      data: { status: "pending", instruction, planItemId: item.id },
    }),
    prisma.contentPlanItem.update({ where: { id: item.id }, data: { status: "queued" } }),
  ]);
  return true;
}

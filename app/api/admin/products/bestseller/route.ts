import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidateMenuPages } from "@/app/actions/menu";

/**
 * Endpoint machine-to-machine untuk Agent "Website Sync" (crew Python di
 * folder Karyawan AI, lihat agents.md bagian 4). Otentikasi lewat header
 * secret (AGENT_API_SECRET) — TERPISAH dari getAdminSession() yang dipakai
 * Server Actions di app/actions/menu.ts (itu untuk cookie login manusia di
 * /admin, bukan untuk dipanggil proses luar).
 *
 * Body: { productKeys: string[] } — product_key sudah dinormalisasi
 * (trim + lowercase) dari nama produk yang tersimpan di items_json Supabase
 * (app kasir Falya Hub). TIDAK ADA kolom id yang menghubungkan katalog
 * produk Android dengan MenuItem di sini, jadi pencocokan dilakukan lewat
 * nama, dinormalisasi dengan cara yang sama di kedua sisi. Lihat plan
 * "Step 0" di Karyawan AI/agents.md untuk detail & known limitation-nya
 * (produk yang namanya meleset antara app kasir & admin website tidak akan
 * ter-mark bestseller — makanya unmatchedProductKeys dikembalikan di response
 * supaya mismatch ketahuan cepat).
 *
 * Idempotent: full-sync tiap kali dipanggil — set isBestseller=true untuk
 * yang match, false untuk MenuItem lain yang sebelumnya true.
 */
export async function POST(request: NextRequest) {
  const expectedSecret = process.env.AGENT_API_SECRET;
  if (!expectedSecret) {
    console.error("AGENT_API_SECRET belum di-set di environment.");
    return NextResponse.json(
      { error: "Server belum dikonfigurasi (AGENT_API_SECRET kosong)." },
      { status: 500 }
    );
  }

  const providedSecret = request.headers.get("x-agent-secret");
  if (providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid." }, { status: 400 });
  }

  const productKeys = (body as { productKeys?: unknown } | null)?.productKeys;
  if (!Array.isArray(productKeys) || !productKeys.every((k) => typeof k === "string")) {
    return NextResponse.json(
      { error: "Body harus berisi productKeys: string[]." },
      { status: 400 }
    );
  }

  const normalizedKeys = new Set(
    productKeys.map((key) => key.trim().toLowerCase())
  );

  const allItems = await prisma.menuItem.findMany({
    select: { id: true, name: true, isBestseller: true },
  });

  const matchedIds: string[] = [];
  const matchedNames: string[] = [];
  const matchedKeys = new Set<string>();

  for (const item of allItems) {
    const normalizedName = item.name.trim().toLowerCase();
    if (normalizedKeys.has(normalizedName)) {
      matchedIds.push(item.id);
      matchedNames.push(item.name);
      matchedKeys.add(normalizedName);
    }
  }

  const unmatchedProductKeys = [...normalizedKeys].filter(
    (key) => !matchedKeys.has(key)
  );

  const toUnset = allItems.filter(
    (item) => !matchedIds.includes(item.id) && item.isBestseller
  );
  const unsetIds = toUnset.map((item) => item.id);
  const unsetNames = toUnset.map((item) => item.name);

  await prisma.$transaction([
    ...(matchedIds.length
      ? [
          prisma.menuItem.updateMany({
            // Hanya baris yang benar-benar berubah -- supaya updatedAt
            // (dipakai lastModified di app/sitemap.ts) tidak ter-bump tiap
            // hari untuk produk yang sudah bestseller dari kemarin.
            where: { id: { in: matchedIds }, isBestseller: false },
            data: { isBestseller: true },
          }),
        ]
      : []),
    ...(unsetIds.length
      ? [
          prisma.menuItem.updateMany({
            where: { id: { in: unsetIds } },
            data: { isBestseller: false },
          }),
        ]
      : []),
  ]);

  await revalidateMenuPages();

  if (unmatchedProductKeys.length > 0) {
    console.warn(
      `[bestseller-sync] productKeys tidak match ke MenuItem manapun: ${unmatchedProductKeys.join(", ")}`
    );
  }

  const taskId = (body as { taskId?: unknown } | null)?.taskId;
  if (typeof taskId === "string" && taskId) {
    // Best-effort -- sync SUDAH selesai di titik ini, kegagalan menandai
    // AgentTaskRequest (mis. task_id sudah tidak ada) TIDAK BOLEH membuat
    // response ini error, pola sama persis content/draft/route.ts.
    try {
      await prisma.agentTaskRequest.update({
        where: { id: taskId },
        data: { status: "processed", processedAt: new Date() },
      });
    } catch (error) {
      console.error(`Gagal menandai AgentTaskRequest ${taskId} selesai:`, error);
    }
  }

  return NextResponse.json({
    success: true,
    setBestseller: matchedNames,
    unsetBestseller: unsetNames,
    unmatchedProductKeys,
    timestamp: new Date().toISOString(),
  });
}

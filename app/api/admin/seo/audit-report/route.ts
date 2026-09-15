import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cleanExcerpt } from "@/lib/utils";

/**
 * Endpoint machine-to-machine untuk Agent "SEO Auditor" (crew Python di
 * folder Karyawan AI, `python -m falya_crew.seo_audit`, lihat agents.md
 * bagian 7). Otentikasi lewat header secret (AGENT_API_SECRET) -- pola
 * identik app/api/admin/products/bestseller/route.ts, secret di-REUSE
 * (bukan secret terpisah): trust boundary-nya sama (proses Python yang
 * sama di laptop yang sama), dan endpoint ini cuma INSERT append-only
 * (bukan mutasi data produk).
 *
 * Body: payload SeoAuditReport (Pydantic model di
 * Karyawan AI/src/falya_crew/models.py) dikirim SNAKE_CASE APA ADANYA --
 * beda dari endpoint bestseller yang camelCase. Ini serialisasi langsung
 * objek Python (`report.model_dump(mode="json")`), tidak ada counterpart
 * JS yang perlu diselaraskan, jadi re-key ke camelCase cuma nambah lapisan
 * translasi tanpa manfaat -- reportJson disimpan apa adanya.
 *
 * Append-only (BUKAN idempotent full-sync seperti bestseller) -- setiap
 * run mingguan = 1 baris baru, sesuai semantik "riwayat audit".
 */

interface MetaIssue {
  page_url: string;
  issue_type: string;
  detail: string;
}

interface SeoAuditReportBody {
  generated_at: string;
  website_base_url: string;
  crawl: {
    broken_links: unknown[];
    meta_issues: MetaIssue[];
    sitemap_diff: unknown;
  };
  pagespeed: {
    scores: { performance_score: number | null }[];
  };
  search_console: {
    total_clicks: number;
    total_impressions: number;
  } | null;
}

function isValidBody(body: unknown): body is SeoAuditReportBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;

  if (typeof b.generated_at !== "string" || typeof b.website_base_url !== "string") {
    return false;
  }

  const crawl = b.crawl as Record<string, unknown> | undefined;
  if (
    !crawl ||
    !Array.isArray(crawl.broken_links) ||
    !Array.isArray(crawl.meta_issues) ||
    typeof crawl.sitemap_diff !== "object"
  ) {
    return false;
  }
  const metaIssuesValid = crawl.meta_issues.every(
    (issue) =>
      issue &&
      typeof issue === "object" &&
      typeof (issue as Record<string, unknown>).page_url === "string" &&
      typeof (issue as Record<string, unknown>).issue_type === "string"
  );
  if (!metaIssuesValid) return false;

  const pagespeed = b.pagespeed as Record<string, unknown> | undefined;
  if (!pagespeed || !Array.isArray(pagespeed.scores)) {
    return false;
  }

  if (b.search_console !== null && typeof b.search_console !== "object") {
    return false;
  }

  return true;
}

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

  if (!isValidBody(body)) {
    return NextResponse.json(
      { error: "Body harus berupa payload SeoAuditReport yang valid (lihat Karyawan AI/src/falya_crew/models.py)." },
      { status: 400 }
    );
  }

  const totalBrokenLinks = body.crawl.broken_links.length;
  const totalMetaIssues = body.crawl.meta_issues.length;

  const perfScores = body.pagespeed.scores
    .map((s) => s.performance_score)
    .filter((s): s is number => typeof s === "number");
  const avgPerformanceScore =
    perfScores.length > 0
      ? perfScores.reduce((sum, s) => sum + s, 0) / perfScores.length
      : null;

  const totalClicks28d = body.search_console?.total_clicks ?? null;
  const totalImpressions28d = body.search_console?.total_impressions ?? null;

  const report = await prisma.seoAuditReport.create({
    data: {
      generatedAt: new Date(body.generated_at),
      websiteBaseUrl: body.website_base_url,
      totalBrokenLinks,
      totalMetaIssues,
      avgPerformanceScore,
      totalClicks28d,
      totalImpressions28d,
      reportJson: body as unknown as Prisma.InputJsonValue,
    },
  });

  // Best-effort: usulkan fix untuk missing_meta_description pada halaman
  // blog (satu-satunya isu yang punya target tulis aman & nilai fallback
  // resmi -- lihat komentar model SeoProposedFix di schema.prisma dan plan
  // "Auto-Fix Agent 3"). Gagal di sini TIDAK BOLEH menggagalkan penyimpanan
  // laporan audit itu sendiri, jadi dibungkus try/catch terpisah.
  try {
    await generateProposedFixesForMissingMetaDescription(report.id, body.crawl.meta_issues);
  } catch (error) {
    console.error("[seo-audit-report] Gagal generate usulan fix:", error);
  }

  return NextResponse.json({
    success: true,
    id: report.id,
    generatedAt: report.generatedAt.toISOString(),
    totalBrokenLinks,
    totalMetaIssues,
    avgPerformanceScore,
    timestamp: new Date().toISOString(),
  });
}

// Slug halaman blog ada di path setelah /blog/, lihat app/blog/[slug]/page.tsx.
const BLOG_SLUG_PATTERN = /\/blog\/([^/?#]+)\/?(?:[?#].*)?$/;

async function generateProposedFixesForMissingMetaDescription(auditReportId: string, metaIssues: MetaIssue[]) {
  const missingDescriptionIssues = metaIssues.filter((issue) => issue.issue_type === "missing_meta_description");

  for (const issue of missingDescriptionIssues) {
    const slugMatch = issue.page_url.match(BLOG_SLUG_PATTERN);
    if (!slugMatch) {
      // Bukan halaman blog (mis. homepage/kategori statis) -- tidak ada
      // kolom database untuk ditulis, jadi tetap sebagai temuan audit biasa
      // tanpa usulan fix (lihat plan "Di luar scope").
      continue;
    }

    const post = await prisma.post.findUnique({ where: { slug: slugMatch[1] } });
    if (!post) continue;

    const existingPending = await prisma.seoProposedFix.findFirst({
      where: { postId: post.id, field: "metaDescription", status: "pending" },
    });
    if (existingPending) continue; // sudah ada usulan menunggu keputusan admin

    await prisma.seoProposedFix.create({
      data: {
        auditReportId,
        postId: post.id,
        field: "metaDescription",
        issueType: issue.issue_type,
        currentValue: post.metaDescription,
        proposedValue: cleanExcerpt(post.content),
        status: "pending",
      },
    });
  }
}

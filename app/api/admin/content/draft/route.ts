import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cleanExcerpt } from "@/lib/utils";

/**
 * Endpoint machine-to-machine untuk Agent "Content Writer" (crew Python di
 * folder Karyawan AI, `python -m falya_crew.content_writer`). Otentikasi
 * x-agent-secret (reuse AGENT_API_SECRET, pola sama endpoint lain) --
 * endpoint ini cuma bisa bikin Post BARU dengan isPublished=false (draft),
 * TIDAK PERNAH publish/edit/hapus apapun, jadi trust boundary-nya rendah
 * meski secret-nya dibagi dengan endpoint lain.
 *
 * Body snake_case apa adanya (serialisasi ArticleDraft Pydantic langsung,
 * Karyawan AI/src/falya_crew/models.py) -- pola sama endpoint audit SEO.
 *
 * Slug diturunkan dari title di sini (BUKAN dikirim dari Python) --
 * regex-nya SENGAJA disalin persis dari createPost (app/actions/blog.ts)
 * supaya hasilnya konsisten dengan artikel yang dibuat manual lewat admin.
 */

const MAX_SLUG_RETRIES = 5;

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ArticleDraftBody {
  title: string;
  headline: string;
  content: string;
  meta_description?: string;
  excerpt?: string;
  category?: string;
  job_id?: string;
}

function isValidBody(body: unknown): body is ArticleDraftBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return typeof b.title === "string" && b.title.trim().length > 0 && typeof b.content === "string" && b.content.trim().length > 0;
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
      { error: "Body harus berisi minimal title dan content (lihat ArticleDraft di Karyawan AI/src/falya_crew/models.py)." },
      { status: 400 }
    );
  }

  if (body.job_id) {
    // Idempoten per job: LLM kadang memanggil tool submit dua kali untuk job
    // yang sama -- jangan bikin draft kembar, kembalikan draft yang sudah ada.
    const job = await prisma.contentJobRequest.findUnique({ where: { id: body.job_id } });
    if (!job) {
      // job_id karangan LLM (mis. "placeholder-job-id") -- tolak, jangan
      // bikin draft yatim yang nanti dobel dengan submit yang benar.
      return NextResponse.json({ error: `job_id "${body.job_id}" tidak dikenal.` }, { status: 400 });
    }
    if (job.status === "done" && job.resultPostId) {
      const existing = await prisma.post.findUnique({ where: { id: job.resultPostId } });
      if (existing) {
        return NextResponse.json({
          success: true,
          duplicate: true,
          id: existing.id,
          slug: existing.slug,
          title: existing.title,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  const baseSlug = slugify(body.title);
  if (!baseSlug) {
    return NextResponse.json({ error: "Title tidak menghasilkan slug yang valid." }, { status: 400 });
  }

  const finalMetaDescription = body.meta_description?.trim() ? body.meta_description.trim() : cleanExcerpt(body.content);
  const finalHeadline = body.headline?.trim() || body.title.trim();
  const finalExcerpt = body.excerpt?.trim() || finalMetaDescription;

  let post = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    try {
      post = await prisma.post.create({
        data: {
          title: body.title.trim(),
          headline: finalHeadline,
          slug,
          content: body.content,
          metaDescription: finalMetaDescription,
          excerpt: finalExcerpt,
          category: body.category?.trim() || null,
          imageUrl: null, // fitur gambar otomatis di luar scope v1 -- admin upload manual saat review
          isPublished: false, // DRAFT -- ini yang bikin agent ini "aman", tidak pernah langsung tayang
        },
      });
      break;
    } catch (error: unknown) {
      lastError = error;
      const code = (error as { code?: string } | null)?.code;
      if (code !== "P2002") {
        console.error("Failed to create content draft:", error);
        return NextResponse.json({ error: "Gagal menyimpan draft artikel." }, { status: 500 });
      }
      // Slug bentrok -- coba lagi dengan suffix di iterasi berikutnya.
    }
  }

  if (!post) {
    console.error("Gagal generate slug unik setelah beberapa percobaan:", lastError);
    return NextResponse.json({ error: "Gagal menemukan slug unik untuk artikel ini." }, { status: 500 });
  }

  if (body.job_id) {
    // Best-effort -- post SUDAH tersimpan di titik ini, jadi kegagalan
    // menandai job (mis. job_id sudah tidak ada) TIDAK BOLEH membuat
    // response ini error (agent bisa salah kira submit gagal & retry,
    // berpotensi bikin post duplikat).
    try {
      const job = await prisma.contentJobRequest.update({
        where: { id: body.job_id },
        data: { status: "done", completedAt: new Date(), resultPostId: post.id },
      });
      if (job.planItemId) {
        // Job dari rencana Agent 5 -- tandai item rencananya sudah jadi draft.
        await prisma.contentPlanItem.update({
          where: { id: job.planItemId },
          data: { status: "drafted", postId: post.id },
        });
      }
    } catch (error) {
      console.error(`Gagal menandai ContentJobRequest ${body.job_id} selesai:`, error);
    }
  }

  return NextResponse.json({
    success: true,
    id: post.id,
    slug: post.slug,
    title: post.title,
    timestamp: new Date().toISOString(),
  });
}

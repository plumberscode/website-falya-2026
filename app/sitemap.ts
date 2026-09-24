
import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { LIWET_CATEGORIES, SNACKBOX_ITEM_CATEGORIES } from "@/lib/data/menuData";

const LIWET_ITEM_CATEGORIES = LIWET_CATEGORIES.map((c) => c.id).filter((id) => id !== "semua");

function latest(...dates: (Date | null | undefined)[]): Date | undefined {
  const valid = dates.filter((d): d is Date => d instanceof Date);
  if (valid.length === 0) return undefined;
  return new Date(Math.max(...valid.map((d) => d.getTime())));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.falyarisol.com";

  // lastModified = kapan konten halaman itu BENAR-BENAR berubah (updatedAt
  // menu per kategori / artikel terbaru), bukan `new Date()` -- tanggal
  // "hari ini" di setiap request memberi sinyal palsu ke Google bahwa semua
  // halaman berubah terus, sehingga sinyal lastModified diabaikan.
  let categoryUpdatedAt = new Map<string, Date>();
  let posts: { slug: string; updatedAt: Date; publishedAt: Date }[] = [];

  try {
    const nowWithBuffer = new Date(Date.now() + 60 * 1000);
    const [categoryRows, postRows] = await Promise.all([
      prisma.menuItem.groupBy({ by: ["category"], _max: { updatedAt: true } }),
      prisma.post.findMany({
        where: {
          isPublished: true,
          publishedAt: { lte: nowWithBuffer },
        },
        select: {
          slug: true,
          updatedAt: true,
          publishedAt: true,
        },
      }),
    ]);
    categoryUpdatedAt = new Map(
      categoryRows
        .filter((row) => row._max.updatedAt)
        .map((row) => [row.category, row._max.updatedAt as Date])
    );
    posts = postRows;
  } catch (error) {
    console.error("Failed to load sitemap data:", error);
  }

  const menuUpdatedAt = (categories?: readonly string[]) =>
    latest(
      ...[...categoryUpdatedAt.entries()]
        .filter(([category]) => !categories || categories.includes(category))
        .map(([, date]) => date)
    );
  // Artikel terjadwal baru "berubah" saat publishedAt-nya tiba, bukan saat
  // row-nya terakhir di-edit.
  const blogUpdatedAt = latest(...posts.map((p) => latest(p.updatedAt, p.publishedAt)));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: latest(menuUpdatedAt(), blogUpdatedAt),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: menuUpdatedAt(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/snackbox`,
      lastModified: menuUpdatedAt(SNACKBOX_ITEM_CATEGORIES),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nasi-liwet`,
      lastModified: menuUpdatedAt(LIWET_ITEM_CATEGORIES),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kue-nampan-balikpapan`,
      lastModified: menuUpdatedAt(["kue-nampan"]),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      // Konten FAQ ada di kode (bukan database) -- tidak ada tanggal
      // perubahan yang bisa dipercaya, jadi lastModified sengaja dikosongkan.
      url: `${baseUrl}/faq`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: blogUpdatedAt,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: latest(post.updatedAt, post.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages];
}

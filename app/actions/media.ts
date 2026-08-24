"use server";

import { prisma } from "@/lib/prisma";

export async function saveMedia(url: string, name?: string) {
  try {
    if (!url || !url.trim()) return { success: false, error: "URL tidak valid" };

    const cleanUrl = url.trim();
    const media = await prisma.media.upsert({
      where: { url: cleanUrl },
      update: {
        ...(name ? { name } : {}),
      },
      create: {
        url: cleanUrl,
        name: name || "Gambar Cloudinary",
      },
    });

    return { success: true, media };
  } catch (error) {
    console.error("Failed to save media:", error);
    return { success: false, error: "Gagal menyimpan media ke database." };
  }
}

export async function getAllMedia() {
  try {
    // 1. Ambil semua media yang ada di tabel Media
    const mediaList = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 2. Kumpulkan juga URL gambar yang pernah ada di tabel Post
    const posts = await prisma.post.findMany({
      select: { imageUrl: true, content: true, title: true },
    });

    const existingUrls = new Set(mediaList.map((m) => m.url));
    const newMediaToInsert: { url: string; name: string }[] = [];

    for (const post of posts) {
      if (post.imageUrl && !existingUrls.has(post.imageUrl)) {
        existingUrls.add(post.imageUrl);
        newMediaToInsert.push({
          url: post.imageUrl,
          name: post.title ? `Thumbnail: ${post.title.slice(0, 30)}` : "Thumbnail Artikel",
        });
      }

      // Cari semua tag <img> di dalam content post
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      let match;
      while ((match = imgRegex.exec(post.content)) !== null) {
        const src = match[1];
        if (src && !existingUrls.has(src)) {
          existingUrls.add(src);
          newMediaToInsert.push({
            url: src,
            name: post.title ? `Konten: ${post.title.slice(0, 30)}` : "Gambar Konten",
          });
        }
      }
    }

    // Jika ada gambar dari Post lama yang belum tersimpan di tabel Media, masukkan otomatis
    if (newMediaToInsert.length > 0) {
      for (const item of newMediaToInsert) {
        try {
          await prisma.media.create({
            data: {
              url: item.url,
              name: item.name,
            },
          });
        } catch (e) {
          // ignore unique constraint race condition
        }
      }

      // Re-fetch
      return await prisma.media.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return mediaList;
  } catch (error) {
    console.error("Failed to get all media:", error);
    return [];
  }
}

export async function deleteMedia(id: string) {
  try {
    await prisma.media.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete media:", error);
    return { success: false, error: "Gagal menghapus media." };
  }
}

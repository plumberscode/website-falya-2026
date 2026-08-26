"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";

export async function createPost(formData: {
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  category?: string;
  imageUrl?: string;
  publishedAt?: string | Date;
  isPublished?: boolean;
}) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    // Standardize slug for SEO (lowercase, hyphens only)
    const cleanSlug = formData.slug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const scheduleDate = formData.publishedAt
      ? new Date(formData.publishedAt)
      : new Date();

    const post = await prisma.post.create({
      data: {
        title: formData.title,
        slug: cleanSlug,
        content: formData.content,
        metaDescription: formData.metaDescription || null,
        category: formData.category || null,
        imageUrl: formData.imageUrl || null,
        publishedAt: scheduleDate,
        isPublished: formData.isPublished !== undefined ? formData.isPublished : true,
      },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/admin/blog");
    revalidatePath("/sitemap.xml");

    return { success: true, post };
  } catch (error: any) {
    console.error("Failed to create blog post:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Slug/URL ini sudah pernah digunakan. Harap gunakan slug yang unik." };
    }
    return { success: false, error: "Gagal menyimpan artikel ke database." };
  }
}

export async function updatePost(
  id: string,
  formData: {
    title: string;
    slug: string;
    content: string;
    metaDescription?: string;
    category?: string;
    imageUrl?: string;
    publishedAt?: string | Date;
    isPublished?: boolean;
  }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    const cleanSlug = formData.slug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const scheduleDate = formData.publishedAt
      ? new Date(formData.publishedAt)
      : undefined;

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: formData.title,
        slug: cleanSlug,
        content: formData.content,
        metaDescription: formData.metaDescription || null,
        category: formData.category || null,
        imageUrl: formData.imageUrl || null,
        ...(scheduleDate && { publishedAt: scheduleDate }),
        ...(formData.isPublished !== undefined && { isPublished: formData.isPublished }),
      },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/admin/blog");
    revalidatePath("/sitemap.xml");

    return { success: true, post };
  } catch (error: any) {
    console.error("Failed to update blog post:", error);
    if (error.code === "P2002") {
      return { success: false, error: "Slug/URL ini sudah pernah digunakan." };
    }
    return { success: false, error: "Gagal memperbarui artikel." };
  }
}

export async function deletePost(id: string) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    await prisma.post.delete({
      where: { id },
    });

    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    revalidatePath("/sitemap.xml");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Gagal menghapus artikel." };
  }
}

// Untuk halaman publik: includeScheduled = false (hanya yang sudah tiba waktunya)
// Untuk halaman admin: includeScheduled = true (menampilkan semua artikel termasuk jadwal mendatang)
export async function getAllPosts(includeScheduled: boolean = false, category?: string) {
  try {
    const now = new Date();
    
    // Build where clause
    const whereClause: any = includeScheduled 
      ? {} 
      : {
          isPublished: true,
          publishedAt: { lte: now },
        };
        
    if (category) {
      whereClause.category = category;
    }

    return await prisma.post.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      orderBy: { publishedAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string, allowScheduled: boolean = false) {
  try {
    const now = new Date();
    return await prisma.post.findFirst({
      where: {
        slug,
        ...(allowScheduled
          ? {}
          : {
              isPublished: true,
              publishedAt: { lte: now },
            }),
      },
    });
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
}

export async function getPostById(id: string) {
  try {
    return await prisma.post.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error("Error fetching post by id:", error);
    return null;
  }
}

export async function getAllCategories() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        category: { not: null },
      },
      select: {
        category: true,
      },
      distinct: ['category'],
    });
    
    return posts
      .map(p => p.category)
      .filter((c): c is string => c !== null && c !== "")
      .sort();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import type { MenuItem } from "@/lib/data/menuData";

// Halaman yang menampilkan daftar menu (dan perlu di-refresh setiap ada
// perubahan menu apapun: tambah, edit, hapus, ubah ketersediaan).
function revalidateMenuPages() {
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/snackbox");
  revalidatePath("/nasi-liwet");
  revalidatePath("/admin");
}

/**
 * Sumber data menu untuk SELURUH halaman publik (homepage, /menu,
 * /snackbox, /nasi-liwet) dan admin — dibaca langsung dari database,
 * bukan dari array statis di kode. Ini yang membuat perubahan dari
 * admin panel langsung terlihat oleh semua pengunjung, di device
 * manapun, tanpa perlu deploy ulang.
 */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { createdAt: "asc" },
    });
    return items as MenuItem[];
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return [];
  }
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  try {
    const item = await prisma.menuItem.findUnique({ where: { id } });
    return item as MenuItem | null;
  } catch (error) {
    console.error("Error fetching menu item by id:", error);
    return null;
  }
}

export async function createMenuItem(data: Omit<MenuItem, "id">) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    const item = await prisma.menuItem.create({
      data: {
        id: `custom-${Date.now()}`,
        name: data.name.trim(),
        category: data.category,
        price: Number(data.price),
        description: data.description?.trim() || "",
        image: data.image,
        unit: data.unit?.trim() || "pcs",
        isPopular: data.isPopular ?? false,
        isAvailable: data.isAvailable ?? true,
      },
    });

    revalidateMenuPages();
    return { success: true, item };
  } catch (error) {
    console.error("Failed to create menu item:", error);
    return { success: false, error: "Gagal menyimpan menu baru ke database." };
  }
}

export async function updateMenuItem(id: string, data: Partial<Omit<MenuItem, "id">>) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.price !== undefined && { price: Number(data.price) }),
        ...(data.description !== undefined && { description: data.description.trim() }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.unit !== undefined && { unit: data.unit?.trim() || "pcs" }),
        ...(data.isPopular !== undefined && { isPopular: data.isPopular }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      },
    });

    revalidateMenuPages();
    return { success: true, item };
  } catch (error) {
    console.error("Failed to update menu item:", error);
    return { success: false, error: "Gagal memperbarui menu." };
  }
}

export async function toggleMenuItemAvailability(id: string) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    const current = await prisma.menuItem.findUnique({ where: { id } });
    if (!current) {
      return { success: false, error: "Menu tidak ditemukan." };
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !current.isAvailable },
    });

    revalidateMenuPages();
    return { success: true, item };
  } catch (error) {
    console.error("Failed to toggle menu availability:", error);
    return { success: false, error: "Gagal mengubah status ketersediaan." };
  }
}

export async function deleteMenuItem(id: string) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return { success: false, error: "Akses ditolak. Sesi admin diperlukan." };
    }

    await prisma.menuItem.delete({ where: { id } });

    revalidateMenuPages();
    return { success: true };
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    return { success: false, error: "Gagal menghapus menu." };
  }
}

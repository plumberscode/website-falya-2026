import { getAllMenuItems } from "@/app/actions/menu";
import MenuPageClient from "@/components/menu/MenuPageClient";

// Data menu dibaca dari database (bukan array statis di kode) supaya
// perubahan dari admin panel langsung terlihat oleh semua pengunjung
// tanpa perlu deploy ulang. revalidatePath() di app/actions/menu.ts
// sudah menghapus cache instan saat ada perubahan, jadi halaman ini
// statis per-deployment (revalidate: false) — tanpa time-based ISR
// yang membuat edge node Vercel meregenerasi halaman secara independen
// tiap 60 detik dan sempat tidak konsisten satu sama lain setelah deploy.
export const revalidate = false;

export default async function MenuPage() {
  const items = await getAllMenuItems();
  return <MenuPageClient items={items} />;
}

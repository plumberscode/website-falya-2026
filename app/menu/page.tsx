import { getAllMenuItems } from "@/app/actions/menu";
import MenuPageClient from "@/components/menu/MenuPageClient";

// Data menu dibaca dari database (bukan array statis di kode) supaya
// perubahan dari admin panel langsung terlihat oleh semua pengunjung
// tanpa perlu deploy ulang. revalidatePath() di app/actions/menu.ts
// menghapus cache instan saat ada perubahan; 60s di sini cuma jaring
// pengaman (sama seperti pola di app/blog/page.tsx).
export const revalidate = 60;

export default async function MenuPage() {
  const items = await getAllMenuItems();
  return <MenuPageClient items={items} />;
}

import { getAllMenuItems } from "@/app/actions/menu";
import NasiLiwetPageClient from "@/components/menu/NasiLiwetPageClient";

// Statis per-deployment (revalidate: false) — lihat catatan lengkap
// di app/menu/page.tsx. revalidatePath("/nasi-liwet") di
// app/actions/menu.ts sudah menangani freshness saat admin edit menu.
export const revalidate = false;

export default async function NasiLiwetPage() {
  const items = await getAllMenuItems();
  return <NasiLiwetPageClient items={items} />;
}

import { getAllMenuItems } from "@/app/actions/menu";
import NasiLiwetPageClient from "@/components/menu/NasiLiwetPageClient";

// Lihat catatan yang sama di app/menu/page.tsx.
export const revalidate = 60;

export default async function NasiLiwetPage() {
  const items = await getAllMenuItems();
  return <NasiLiwetPageClient items={items} />;
}

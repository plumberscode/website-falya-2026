import { getAllMenuItems } from "@/app/actions/menu";
import SnackboxPageClient from "@/components/menu/SnackboxPageClient";

// Statis per-deployment (revalidate: false) — lihat catatan lengkap
// di app/menu/page.tsx. revalidatePath("/snackbox") di
// app/actions/menu.ts sudah menangani freshness saat admin edit menu.
export const revalidate = false;

export default async function SnackboxPage() {
  const items = await getAllMenuItems();
  return <SnackboxPageClient items={items} />;
}

import { getAllMenuItems } from "@/app/actions/menu";
import SnackboxPageClient from "@/components/menu/SnackboxPageClient";

// Lihat catatan yang sama di app/menu/page.tsx.
export const revalidate = 60;

export default async function SnackboxPage() {
  const items = await getAllMenuItems();
  return <SnackboxPageClient items={items} />;
}

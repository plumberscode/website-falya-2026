import { headers } from "next/headers";
import { clientIp, fetchMemberDashboard } from "@/lib/member/dashboard";
import { CARD_SIZE, renderMemberCard } from "@/lib/member/cardImage";

// Pratinjau link kartu di WhatsApp: gambar kartu (nama, nomor, QR) per token.
// Setelah token di-reset, gambar lama mungkin masih terlihat di chat, tetapi link-nya sudah tidak berlaku.
export const alt = "Kartu member Falya Risol Mayo";
export const size = CARD_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await fetchMemberDashboard(token, clientIp(await headers()));
  return renderMemberCard(result.ok ? { name: result.data.name, memberNumber: result.data.memberNumber, token } : null);
}

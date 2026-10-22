import { CardNotFound } from "./MemberDashboard";

// Token tidak dikenal, sudah di-reset, atau milik member nonaktif: pesan yang sama tanpa membedakan alasannya
export default function MemberCardNotFound() {
  return <CardNotFound />;
}

import imageManifest from "@/lib/data/imageManifest.json";

const manifest: Record<string, string> = imageManifest;

/**
 * Tambahkan query-string cache-buster (?v=hash) ke path gambar lokal
 * (/images/...) berdasarkan hash konten file saat build (lihat
 * scripts/generate-image-manifest.mjs). Ini memaksa browser & CDN
 * mengambil ulang gambar begitu isinya diganti — walau nama file tetap
 * sama persis — tanpa perlu rename file atau tunggu cache lama habis.
 *
 * Path eksternal (Cloudinary, Unsplash, dll.) atau path yang tidak ada
 * di manifest dikembalikan apa adanya.
 */
export function withImageVersion(src: string): string {
  const hash = manifest[src];
  return hash ? `${src}?v=${hash}` : src;
}

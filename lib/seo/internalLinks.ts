// <a ...>...</a> di konten TipTap -- href boleh kutip ganda atau tunggal
// (Content Writer menulis <a href='...'>).
const ANCHOR_PATTERN = /<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
const BLOG_PATH_PATTERN = /^(?:https?:\/\/(?:www\.)?falyarisol\.com)?\/blog\/([^/?#]+)\/?(?:[?#].*)?$/i;

/**
 * Lepas tag <a> yang menuju artikel blog yang belum tayang (draft/terjadwal/
 * terhapus) -- teks jangkarnya tetap, cuma tidak jadi link. Dipakai saat
 * render artikel (app/blog/[slug]/page.tsx), jadi urutan publish tidak
 * pernah menghasilkan link 404: begitu artikel target tayang, link-nya
 * otomatis aktif lagi (halaman di-revalidate berkala). Link lain (landing
 * page, WhatsApp, eksternal) tidak disentuh.
 */
export function unlinkUnpublishedPosts(html: string, publishedSlugs: ReadonlySet<string>): string {
  return html.replace(ANCHOR_PATTERN, (anchor, _quote: string, href: string, text: string) => {
    const match = href.trim().match(BLOG_PATH_PATTERN);
    if (!match) return anchor;
    return publishedSlugs.has(decodeURIComponent(match[1])) ? anchor : text;
  });
}

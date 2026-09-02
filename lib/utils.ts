import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanExcerpt(content?: string | null): string {
  if (!content) return "Pilihan menu lezat, snack box, nasi liwet, dan aneka kuliner berkualitas dari Falya Risol Balikpapan.";
  const clean = content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length === 0) {
    return "Pilihan menu lezat, snack box, nasi liwet, dan aneka kuliner berkualitas dari Falya Risol Balikpapan.";
  }
  if (clean.length <= 155) return clean;
  return clean.slice(0, 155).trim() + "...";
}

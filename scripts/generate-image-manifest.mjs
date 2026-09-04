#!/usr/bin/env node
// scripts/generate-image-manifest.mjs
//
// Menghasilkan lib/data/imageManifest.json: peta { "/images/xxx.webp": "<hash>" }
// dari ISI (bukan nama) tiap file di public/images. Hash berubah otomatis
// begitu konten file berubah walau nama file tetap sama persis — dipakai
// sebagai query-string cache-buster (?v=hash, lihat lib/utils/cacheBustImage.ts)
// supaya browser & CDN wajib mengambil ulang gambar begitu foto menu diganti,
// tanpa perlu rename file atau ubah kode manual tiap kali update foto.
//
// Dijalankan otomatis lewat "predev"/"prebuild" (lihat package.json), jadi
// manifest selalu sinkron dengan isi public/images terbaru.

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const IMAGES_DIR = join(ROOT, "public", "images");
const OUTPUT_FILE = join(ROOT, "lib", "data", "imageManifest.json");
const IMAGE_EXTS = new Set([
  ".webp",
  ".jpg",
  ".jpeg",
  ".png",
  ".avif",
  ".gif",
  ".svg",
]);

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, files);
    } else if (IMAGE_EXTS.has(extname(entry).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

function toPublicPath(filePath) {
  return "/" + relative(join(ROOT, "public"), filePath).split("\\").join("/");
}

function main() {
  const files = walk(IMAGES_DIR);
  const manifest = {};

  for (const filePath of files) {
    const content = readFileSync(filePath);
    const hash = createHash("sha1").update(content).digest("hex").slice(0, 8);
    manifest[toPublicPath(filePath)] = hash;
  }

  // Urutkan key supaya diff git rapi (tidak berantakan cuma karena urutan
  // pembacaan direktori berbeda antar OS/mesin).
  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
  );

  writeFileSync(OUTPUT_FILE, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`✓ Image manifest generated: ${files.length} file -> ${OUTPUT_FILE}`);
}

main();

// Convert hero frames (WebP) to AVIF for a smaller payload & faster LCP.
// Resumable: skips files that already have a .avif sibling, so it can be
// re-run safely. Keeps the original .webp files as fallback.
//
// Usage: node scripts/convert_frames_avif.js
const fs = require("fs");
const path = require("path");
const os = require("os");
const sharp = require("sharp");

const JOBS = [
  {
    label: "desktop",
    dir: path.resolve("public/videos/frames-desktop"),
    quality: 55,
    effort: 4,
  },
  {
    label: "mobile",
    dir: path.resolve("public/videos/frames-mobile"),
    quality: 55,
    effort: 4,
  },
];

const CONCURRENCY = Math.max(2, Math.min(4, os.cpus().length - 1));

function collectWork() {
  const work = [];
  for (const job of JOBS) {
    if (!fs.existsSync(job.dir)) {
      console.warn(`[${job.label}] Folder tidak ditemukan, dilewati: ${job.dir}`);
      continue;
    }
    const files = fs
      .readdirSync(job.dir)
      .filter((f) => /^frame_\d{4}\.webp$/.test(f));
    for (const file of files) {
      const avif = file.replace(/\.webp$/, ".avif");
      if (fs.existsSync(path.join(job.dir, avif))) continue; // already done
      work.push({ ...job, src: path.join(job.dir, file), dest: path.join(job.dir, avif) });
    }
  }
  return work;
}

let done = 0;
let total = 0;
const startedAt = Date.now();

function logProgress() {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
  console.log(
    `  [${done}/${total}] ${pct}% selesai (${elapsed}s) — avg ${(elapsed / Math.max(1, done)).toFixed(2)}s/frame`,
  );
}

async function worker(pool) {
  while (pool.length > 0) {
    const job = pool.pop();
    try {
      await sharp(job.src).avif({ quality: job.quality, effort: job.effort }).toFile(job.dest);
    } catch (err) {
      console.error(`  GAGAL: ${job.src} — ${err.message}`);
    } finally {
      done++;
      if (done % 25 === 0 || done === total) logProgress();
    }
  }
}

async function main() {
  const work = collectWork();
  total = work.length;
  if (total === 0) {
    console.log("Tidak ada frame yang perlu dikonversi (semua sudah .avif).");
    return;
  }
  console.log(
    `Memulai konversi ${total} frame → AVIF (kualitas ${JOBS[0].quality}, effort ${JOBS[0].effort}, ${CONCURRENCY} worker)...`,
  );

  const pool = [...work];
  const workers = Array.from({ length: CONCURRENCY }, () => worker(pool));
  await Promise.all(workers);

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
  console.log(`--- SELESAI: ${done}/${total} frame dikonversi dalam ${elapsed}s ---`);
}

main().catch((err) => {
  console.error("Konversi gagal:", err);
  process.exit(1);
});

const ffmpegPath = require("ffmpeg-static");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Mobile hero uses the dedicated portrait 720p video (video-for-mobile.mp4),
// NOT the master landscape video. This keeps the mobile scrub exactly in sync
// with the mobile-optimized source and full-bleeds correctly on portrait phones.
const videoPath = path.resolve("public/videos/video-for-mobile.mp4");
const tempDir = path.resolve("public/videos/temp_mobile_raw");
const mobileDir = path.resolve("public/videos/frames-mobile");

// Must match the values passed to CanvasSequenceScroller in app/page.tsx.
const FPS = 15;
const TOTAL_FRAMES = 300; // 20s @ 15fps
const WIDTH = 720;
const HEIGHT = 1280; // 9:16 portrait source
const WEBP_QUALITY = 75;

async function main() {
  console.log(
    "--- Generating Mobile 720p Frames from video-for-mobile.mp4 ---",
  );

  if (!fs.existsSync(videoPath)) {
    console.error(`Source video not found: ${videoPath}`);
    process.exit(1);
  }

  // Wipe old frames first so stale landscape frames never linger.
  if (fs.existsSync(mobileDir)) {
    console.log("Clearing existing frames-mobile...");
    fs.rmSync(mobileDir, { recursive: true, force: true });
  }
  fs.mkdirSync(mobileDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });

  // 1. Extract N raw PNG frames at 15 fps from the portrait 720p source.
  console.log("Step 1: Extracting 720p portrait frames via FFmpeg...");
  const cmd = `"${ffmpegPath}" -y -i "${videoPath}" -vf "fps=${FPS},scale=${WIDTH}:${HEIGHT}:flags=lanczos" -vframes ${TOTAL_FRAMES} -q:v 2 "${tempDir}/frame_%04d.png"`;
  execSync(cmd, { stdio: "inherit" });

  const rawFiles = fs.readdirSync(tempDir).filter((f) => f.endsWith(".png"));
  console.log(`Step 1 complete! Extracted ${rawFiles.length} raw 720p frames.`);

  // 2. Encode WebP frames (q=75, effort=4) tuned for fast mobile loading.
  console.log("Step 2: Encoding mobile WebP frames...");
  let processed = 0;

  for (const file of rawFiles) {
    const src = path.join(tempDir, file);
    const dest = path.join(mobileDir, file.replace(".png", ".webp"));
    await sharp(src)
      .resize(WIDTH, HEIGHT, { fit: "cover", kernel: sharp.kernel.lanczos3 })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toFile(dest);

    fs.unlinkSync(src);
    processed++;
    if (processed % 50 === 0) {
      console.log(`Processed ${processed}/${rawFiles.length} frames...`);
    }
  }

  fs.rmSync(tempDir, { recursive: true, force: true });

  const files = fs.readdirSync(mobileDir);
  console.log(
    `--- SUCCESS: ${files.length} mobile frames generated (${WIDTH}x${HEIGHT}, WebP q${WEBP_QUALITY}) ---`,
  );
}

main().catch((err) => {
  console.error("Extraction Error:", err);
  process.exit(1);
});

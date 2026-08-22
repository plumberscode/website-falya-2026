const ffmpegPath = require("ffmpeg-static");
const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const videoPath = path.resolve("../../Docs/video-for-website.mp4");
const tempDir = path.resolve("public/videos/temp_raw_frames");
const desktopDir = path.resolve("public/videos/frames-desktop");

// NOTE: Mobile frames are generated separately by generate_mobile_frames.js
// from the dedicated portrait 720p source (public/videos/video-for-mobile.mp4).
// This script only produces the desktop 1080p frames from the master video.

async function main() {
  console.log("--- Starting High-Quality Desktop 1080p Frame Extraction ---");

  [tempDir, desktopDir].forEach((d) => {
    if (!fs.existsSync(d)) {
      fs.mkdirSync(d, { recursive: true });
    }
  });

  // 1. Extract 301 raw PNG/JPG frames from master 1080p video at 15 fps (duration ~20s)
  console.log("Step 1: Extracting 1080p frames via FFmpeg...");
  const cmd = `"${ffmpegPath}" -y -i "${videoPath}" -vf "fps=15,scale=1920:1080:flags=lanczos" -vframes 301 -q:v 2 "${tempDir}/frame_%04d.png"`;
  execSync(cmd, { stdio: "inherit" });

  const rawFiles = fs.readdirSync(tempDir).filter((f) => f.endsWith(".png"));
  console.log(
    `Step 1 complete! Extracted ${rawFiles.length} raw 1080p frames.`,
  );

  // 2. Convert to 1080p Desktop WebP (q=80, effort=4)
  console.log("Step 2: Encoding desktop WebP frames...");
  let processed = 0;

  for (const file of rawFiles) {
    const src = path.join(tempDir, file);
    const baseName = file.replace(".png", ".webp");

    // Desktop 1080p
    const destDesktop = path.join(desktopDir, baseName);
    await sharp(src).webp({ quality: 80, effort: 4 }).toFile(destDesktop);

    // Delete raw temp file to save disk space
    fs.unlinkSync(src);

    processed++;
    if (processed % 50 === 0) {
      console.log(`Processed ${processed}/${rawFiles.length} frames...`);
    }
  }

  // Remove temp directory
  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log("--- SUCCESS: Desktop 1080p Frames Generated! ---");

  // Also copy desktop to default 'frames' for backwards compatibility
  const legacyDir = path.resolve("public/videos/frames");
  if (fs.existsSync(legacyDir)) {
    console.log("Updating legacy frames directory...");
    const desktopFiles = fs.readdirSync(desktopDir);
    desktopFiles.forEach((f) => {
      fs.copyFileSync(path.join(desktopDir, f), path.join(legacyDir, f));
    });
  }

  console.log("All frame processing completed successfully.");
}

main().catch((err) => {
  console.error("Extraction Error:", err);
  process.exit(1);
});

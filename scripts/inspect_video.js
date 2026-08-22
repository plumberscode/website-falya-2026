const ffmpegPath = require('ffmpeg-static');
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

console.log('FFmpeg Path:', ffmpegPath);

const videoPath = path.resolve('../../Docs/video-for-website.mp4');
console.log('Target video:', videoPath, 'Exists:', fs.existsSync(videoPath));

try {
  const result = execSync(`"${ffmpegPath}" -i "${videoPath}"`, { stdio: 'pipe' });
  console.log(result.toString());
} catch (e) {
  console.log('Video Metadata:\n', e.stderr.toString());
}

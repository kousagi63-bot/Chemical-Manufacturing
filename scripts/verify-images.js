import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const MAX_BYTES = 70 * 1024; // 70 KB = 71680 bytes

let errors = 0;
let totalImages = 0;

function checkDir(dirPath) {
  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    if (item.startsWith('.') || item === 'node_modules' || item === 'npm-cache' || item === 'scripts') continue;
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      checkDir(fullPath);
    } else {
      const ext = path.extname(item).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.avif', '.svg'].includes(ext)) {
        totalImages++;
        const relPath = path.relative(projectRoot, fullPath);
        if (ext !== '.webp') {
          console.error(`ERROR: Non-webp image found: ${relPath}`);
          errors++;
        }
        if (stat.size > MAX_BYTES) {
          console.error(`ERROR: Image ${relPath} exceeds 70 KB! Size: ${stat.size} bytes (${(stat.size / 1024).toFixed(1)} KB)`);
          errors++;
        } else {
          console.log(`OK: ${relPath} - ${ext} - ${(stat.size / 1024).toFixed(1)} KB`);
        }
      }
    }
  }
}

console.log('=== Checking All Image Files in Project ===');
checkDir(projectRoot);

console.log(`\nTotal images checked: ${totalImages}`);
if (errors === 0) {
  console.log('SUCCESS! All images are in WebP format and under 70 KB.');
} else {
  console.error(`FAILED: Found ${errors} error(s).`);
  process.exit(1);
}

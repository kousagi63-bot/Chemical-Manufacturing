import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const MAX_BYTES = 70 * 1024; // 71,680 bytes (70 KB)

async function compressBufferToWebp(inputBuffer, targetMaxBytes = MAX_BYTES) {
  let quality = 80;
  let metadata;
  try {
    metadata = await sharp(inputBuffer).metadata();
  } catch (e) {
    console.error('Metadata error:', e);
    return null;
  }

  let width = metadata.width || 1200;
  let height = metadata.height || 800;

  // Max initial dimension to keep size reasonable for web
  if (width > 1200 || height > 1200) {
    if (width > height) {
      height = Math.round((height / width) * 1200);
      width = 1200;
    } else {
      width = Math.round((width / height) * 1200);
      height = 1200;
    }
  }

  let outputBuffer = await sharp(inputBuffer)
    .resize(width, height, { fit: 'inside' })
    .webp({ quality })
    .toBuffer();

  while (outputBuffer.length > targetMaxBytes && quality > 10) {
    quality -= 10;
    if (quality < 30 && (width > 400 || height > 400)) {
      width = Math.round(width * 0.85);
      height = Math.round(height * 0.85);
      quality = 70;
    }
    outputBuffer = await sharp(inputBuffer)
      .resize(width, height, { fit: 'inside' })
      .webp({ quality })
      .toBuffer();
  }

  if (outputBuffer.length > targetMaxBytes) {
    // Aggressive fallback resize
    while (outputBuffer.length > targetMaxBytes && width > 200) {
      width = Math.round(width * 0.75);
      height = Math.round(height * 0.75);
      outputBuffer = await sharp(inputBuffer)
        .resize(width, height, { fit: 'inside' })
        .webp({ quality: 50 })
        .toBuffer();
    }
  }

  return outputBuffer;
}

async function fetchUrlBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrlBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url}, status: ${res.statusCode}`));
      }
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

async function processRootJpgs() {
  const rootJpgs = ['about.jpg', 'blog.jpg', 'portfolio.jpg', 'shop.jpg'];
  for (const jpg of rootJpgs) {
    const fullPath = path.join(projectRoot, jpg);
    if (fs.existsSync(fullPath)) {
      console.log(`Processing root image: ${jpg}...`);
      const buffer = fs.readFileSync(fullPath);
      const webpBuffer = await compressBufferToWebp(buffer);
      const webpName = jpg.replace('.jpg', '.webp');
      const outPath = path.join(projectRoot, webpName);
      fs.writeFileSync(outPath, webpBuffer);
      console.log(`Saved ${webpName} (${webpBuffer.length} bytes / ${(webpBuffer.length / 1024).toFixed(1)} KB)`);
      fs.unlinkSync(fullPath);
      console.log(`Deleted original ${jpg}`);
    }
  }
}

async function processImagesDir() {
  const imagesDir = path.join(projectRoot, 'images');
  const files = fs.readdirSync(imagesDir);
  for (const file of files) {
    if (file.endsWith('.webp')) {
      const fullPath = path.join(imagesDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.size > MAX_BYTES) {
        console.log(`Re-compressing ${file} (current size: ${(stat.size / 1024).toFixed(1)} KB)...`);
        const buffer = fs.readFileSync(fullPath);
        const webpBuffer = await compressBufferToWebp(buffer);
        fs.writeFileSync(fullPath, webpBuffer);
        console.log(`Updated ${file} (${webpBuffer.length} bytes / ${(webpBuffer.length / 1024).toFixed(1)} KB)`);
      } else {
        console.log(`OK: ${file} is already under 70 KB (${(stat.size / 1024).toFixed(1)} KB)`);
      }
    }
  }
}

async function processUnsplashImages() {
  const codeFiles = [
    '404.html', 'about.html', 'admin-dashboard.html', 'blog.html',
    'contact.html', 'index.html', 'login.html', 'portfolio.html',
    'projects.html', 'services.html', 'shop.html', 'user-dashboard.html',
    'js/main.js', 'css/style.css'
  ];

  const urlMap = new Map();
  let counter = 1;

  const unsplashRegex = /https:\/\/images\.unsplash\.com\/[^\s'"`\)]+/g;

  for (const relFile of codeFiles) {
    const filePath = path.join(projectRoot, relFile);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(unsplashRegex);
    if (matches) {
      for (const url of matches) {
        if (!urlMap.has(url)) {
          urlMap.set(url, `images/unsplash_${counter++}.webp`);
        }
      }
    }
  }

  console.log(`Found ${urlMap.size} unique Unsplash URLs.`);

  for (const [url, localPath] of urlMap.entries()) {
    console.log(`Downloading & converting ${url} -> ${localPath}...`);
    try {
      const buf = await fetchUrlBuffer(url);
      const webpBuf = await compressBufferToWebp(buf);
      const fullOutPath = path.join(projectRoot, localPath);
      fs.writeFileSync(fullOutPath, webpBuf);
      console.log(`Saved ${localPath} (${webpBuf.length} bytes / ${(webpBuf.length / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`Error processing ${url}:`, e.message);
    }
  }

  // Update code references
  for (const relFile of codeFiles) {
    const filePath = path.join(projectRoot, relFile);
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace root jpg references to webp
    content = content.replace(/about\.jpg/g, 'about.webp');
    content = content.replace(/blog\.jpg/g, 'blog.webp');
    content = content.replace(/portfolio\.jpg/g, 'portfolio.webp');
    content = content.replace(/shop\.jpg/g, 'shop.webp');

    for (const [url, localPath] of urlMap.entries()) {
      if (content.includes(url)) {
        content = content.replaceAll(url, localPath);
      }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated references in ${relFile}`);
  }
}

async function main() {
  console.log('--- Step 1: Processing Root JPGs ---');
  await processRootJpgs();

  console.log('\n--- Step 2: Processing images/ directory ---');
  await processImagesDir();

  console.log('\n--- Step 3: Processing Unsplash URLs ---');
  await processUnsplashImages();

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

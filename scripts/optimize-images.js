#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(__dirname, '..', 'public', 'images');
const OUTPUT_DIR = INPUT_DIR; // overwrite

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) return;
  const fullPath = path.join(INPUT_DIR, filePath);
  const tmpPath = fullPath + '.tmp';
  try {
    const image = sharp(fullPath);
    const metadata = await image.metadata();
    let pipeline = image;
    if (metadata.format === 'jpeg') {
      pipeline = pipeline.jpeg({quality: 75, mozjpeg: true});
    } else if (metadata.format === 'png') {
      pipeline = pipeline.png({compressionLevel: 9});
    } else if (metadata.format === 'webp') {
      pipeline = pipeline.webp({quality: 80});
    }
    await pipeline.toFile(tmpPath);
    const origStat = fs.statSync(fullPath).size;
    const newStat = fs.statSync(tmpPath).size;
    if (newStat < origStat) {
      fs.renameSync(tmpPath, fullPath);
      console.log(`Optimized: ${filePath}  ${Math.round((1 - newStat / origStat) * 100)}% smaller`);
    } else {
      fs.unlinkSync(tmpPath);
      console.log(`Skipped (no gain): ${filePath}`);
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const ent of entries) {
    const rel = path.relative(INPUT_DIR, path.join(dir, ent.name));
    if (ent.isDirectory()) walk(path.join(dir, ent.name), cb);
    else cb(rel);
  }
}

(async function main(){
  if (!fs.existsSync(INPUT_DIR)) {
    console.error('Input dir not found:', INPUT_DIR);
    process.exit(1);
  }
  const files = [];
  walk(INPUT_DIR, f => files.push(f));
  for (const f of files) await processFile(f);
})();



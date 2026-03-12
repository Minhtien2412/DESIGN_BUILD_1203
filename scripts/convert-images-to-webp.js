#!/usr/bin/env node

/**
 * Image WebP Converter
 * Converts PNG/JPG images to WebP format for smaller bundle size
 * 
 * Prerequisites:
 *   npm install --save-dev sharp
 * 
 * Run:
 *   node scripts/convert-images-to-webp.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🖼️  IMAGE WEBP CONVERTER');
console.log('═══════════════════════════════════════════════════════════\n');

// Check if sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.log('❌ Sharp is not installed');
  console.log('\n📦 Install with: npm install --save-dev sharp\n');
  process.exit(1);
}

const sharp = require('sharp');

// Configuration
const ASSETS_DIR = path.join(__dirname, '../assets/images');
const BACKUP_DIR = path.join(__dirname, '../assets/images-backup');
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg'];
const WEBP_QUALITY = 85; // 85% quality is good balance

// Find all images
function findImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findImages(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (SUPPORTED_FORMATS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Convert image to WebP
async function convertToWebP(imagePath) {
  const ext = path.extname(imagePath);
  const webpPath = imagePath.replace(ext, '.webp');

  // Skip if WebP already exists and is newer
  if (fs.existsSync(webpPath)) {
    const originalStat = fs.statSync(imagePath);
    const webpStat = fs.statSync(webpPath);
    
    if (webpStat.mtimeMs > originalStat.mtimeMs) {
      console.log(`   ⏭️  Skipped (already converted): ${path.basename(imagePath)}`);
      return null;
    }
  }

  try {
    const originalSize = fs.statSync(imagePath).size;

    await sharp(imagePath)
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);

    const webpSize = fs.statSync(webpPath).size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

    console.log(`   ✅ ${path.basename(imagePath)} → ${path.basename(webpPath)}`);
    console.log(`      ${(originalSize / 1024).toFixed(1)}KB → ${(webpSize / 1024).toFixed(1)}KB (${savings}% smaller)`);

    return { originalSize, webpSize };
  } catch (error) {
    console.error(`   ❌ Failed: ${path.basename(imagePath)}`, error.message);
    return null;
  }
}

// Main
async function main() {
  // Create backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`📁 Created backup directory: ${BACKUP_DIR}\n`);
  }

  // Find all images
  console.log('🔍 Scanning for images...\n');
  const images = findImages(ASSETS_DIR);
  console.log(`Found ${images.length} images\n`);

  if (images.length === 0) {
    console.log('No images found. Exiting.\n');
    return;
  }

  console.log('🔄 Converting to WebP...\n');

  let totalOriginalSize = 0;
  let totalWebPSize = 0;
  let converted = 0;

  for (const imagePath of images) {
    const result = await convertToWebP(imagePath);
    if (result) {
      totalOriginalSize += result.originalSize;
      totalWebPSize += result.webpSize;
      converted++;
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ CONVERSION COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`📊 Results:`);
  console.log(`   Total images: ${images.length}`);
  console.log(`   Converted: ${converted}`);
  console.log(`   Skipped: ${images.length - converted}`);
  console.log(`   Original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   WebP size: ${(totalWebPSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   💰 Saved: ${((totalOriginalSize - totalWebPSize) / 1024 / 1024).toFixed(2)}MB\n`);

  console.log('📋 Next Steps:');
  console.log('   1. Update image imports in your code:');
  console.log('      - Change: require("./image.png")');
  console.log('      - To: require("./image.webp")');
  console.log('   2. Test app to ensure images load correctly');
  console.log('   3. Delete original PNG/JPG files if WebP works');
  console.log('   4. Or keep both for fallback support\n');

  console.log('💡 Tip: Use expo-image for automatic format selection:');
  console.log('   import { Image } from "expo-image";');
  console.log('   <Image source={require("./image.webp")} />\n');
}

main().catch(console.error);

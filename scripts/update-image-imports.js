#!/usr/bin/env node

/**
 * Update Image Imports
 * Replace .png/.jpg/.jpeg with .webp in all TypeScript/TSX files
 * 
 * Run: node scripts/update-image-imports.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('🔄 UPDATE IMAGE IMPORTS TO WEBP');
console.log('═══════════════════════════════════════════════════════════\n');

// Directories to search
const searchDirs = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components'),
  path.join(__dirname, '../data'),
  path.join(__dirname, '../utils'),
];

// Extensions to search
const extensions = ['.ts', '.tsx'];

// Find all TypeScript files
function findFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules
      if (file !== 'node_modules') {
        findFiles(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Update imports in a file
function updateFileImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Replace patterns:
  // require('@/assets/images/...png') -> require('@/assets/images/...webp')
  // require('../assets/images/...jpg') -> require('../assets/images/...webp')
  content = content.replace(/require\(['"]([^'"]+)\.(png|jpg|jpeg)['"]\)/g, "require('$1.webp')");

  // Also handle import statements
  content = content.replace(/from\s+['"]([^'"]+)\.(png|jpg|jpeg)['"]/g, "from '$1.webp'");

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

// Main
let totalFiles = 0;
let updatedFiles = 0;

console.log('🔍 Scanning for TypeScript files...\n');

searchDirs.forEach(dir => {
  const files = findFiles(dir);
  
  files.forEach(file => {
    totalFiles++;
    if (updateFileImports(file)) {
      updatedFiles++;
      const relativePath = path.relative(process.cwd(), file);
      console.log(`   ✅ ${relativePath}`);
    }
  });
});

console.log('\n═══════════════════════════════════════════════════════════');
console.log('✅ IMPORT UPDATE COMPLETE');
console.log('═══════════════════════════════════════════════════════════\n');
console.log(`📊 Results:`);
console.log(`   Total files scanned: ${totalFiles}`);
console.log(`   Files updated: ${updatedFiles}`);
console.log(`   Files unchanged: ${totalFiles - updatedFiles}\n`);

if (updatedFiles > 0) {
  console.log('📋 Next Steps:');
  console.log('   1. Test app to ensure images load correctly');
  console.log('   2. Clear Metro cache: npx expo start --clear');
  console.log('   3. Verify all screens display images properly');
  console.log('   4. Delete original .png/.jpg files if all works\n');
} else {
  console.log('ℹ️  No files needed updating (already using WebP or no images found)\n');
}

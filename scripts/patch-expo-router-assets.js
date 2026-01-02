/**
 * Patch script to fix asset registry bug in expo-router AND react-native
 * This DELETES PNG files AND patches JS files that reference them
 */

const fs = require('fs');
const path = require('path');

console.log('[Patch] Fixing asset registry bugs...');

// Step 1: Delete PNG files from multiple locations
const pngDirectories = [
  'node_modules/expo-router/assets',
  'node_modules/react-native/Libraries/LogBox/UI/LogBoxImages',
  'node_modules/@react-navigation/elements/lib/module/assets',
  'node_modules/@react-navigation/elements/lib/commonjs/assets'
];

pngDirectories.forEach(dirPath => {
  const fullPath = path.join(__dirname, '..', dirPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`[Patch] ⊘ Directory not found: ${dirPath}`);
    return;
  }
  
  console.log(`[Patch] Scanning: ${dirPath}`);
  const files = fs.readdirSync(fullPath);
  const pngFiles = files.filter(f => f.endsWith('.png'));
  const pngJsFiles = files.filter(f => f.endsWith('.png.js'));
  
  pngFiles.forEach(file => {
    const filePath = path.join(fullPath, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`[Patch] ✓ Deleted ${dirPath}/${file}`);
    } catch (err) {
      console.error(`[Patch] ✗ Failed to delete ${file}:`, err.message);
    }
  });
  
  // Also delete .png.js wrapper files
  pngJsFiles.forEach(file => {
    const filePath = path.join(fullPath, file);
    try {
      fs.unlinkSync(filePath);
      console.log(`[Patch] ✓ Deleted ${dirPath}/${file}`);
    } catch (err) {
      console.error(`[Patch] ✗ Failed to delete ${file}:`, err.message);
    }
  });
});

// Step 2: Patch JS files that import PNG
console.log('[Patch] Patching JS files that reference PNG assets...');

// Auto-discover all JS files in LogBox UI directory
const logBoxUIDir = path.join(__dirname, '..', 'node_modules/react-native/Libraries/LogBox/UI');
const logBoxFiles = [];

if (fs.existsSync(logBoxUIDir)) {
  fs.readdirSync(logBoxUIDir).forEach(file => {
    if (file.endsWith('.js')) {
      logBoxFiles.push(`node_modules/react-native/Libraries/LogBox/UI/${file}`);
    }
  });
}

// Auto-discover react-navigation elements files
const reactNavDirs = [
  'node_modules/@react-navigation/elements/lib/module',
  'node_modules/@react-navigation/elements/lib/commonjs'
];

const reactNavFiles = [];
reactNavDirs.forEach(dirPath => {
  const fullPath = path.join(__dirname, '..', dirPath);
  if (fs.existsSync(fullPath)) {
    // Recursively find all .js files
    const walkSync = (dir, filelist = []) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
          filelist = walkSync(filepath, filelist);
        } else if (file.endsWith('.js')) {
          // Convert to relative path from project root
          const relativePath = filepath.replace(path.join(__dirname, '..') + path.sep, '').replace(/\\/g, '/');
          filelist.push(relativePath);
        }
      });
      return filelist;
    };
    reactNavFiles.push(...walkSync(fullPath));
  }
});

const filesToPatch = [
  'node_modules/expo-router/build/onboard/Tutorial.js',
  'node_modules/expo-router/build/views/ErrorBoundary.js',
  'node_modules/expo-router/build/views/Sitemap.js',
  'node_modules/expo-router/build/views/Unmatched.js',
  'node_modules/expo-router/build/views/Toast.js',
  ...logBoxFiles,
  ...reactNavFiles
];

filesToPatch.forEach(relativePath => {
  const filePath = path.join(__dirname, '..', relativePath);
  
  if (!fs.existsSync(filePath)) {
    console.log(`[Patch] ⊘ Skipped ${relativePath} (not found)`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all require('*/assets/*.png') and import ... from '*/assets/*.png' with null
    const patterns = [
      // require() patterns
      /require\(['"]expo-router\/assets\/[^'"]+\.png['"]\)/g,
      /require\(["']\.\.\/\.\.\/assets\/[^"']+\.png["']\)/g,
      /require\(["']\.\/LogBoxImages\/[^"']+\.png["']\)/g,
      /require\(['"]react-native\/Libraries\/LogBox\/UI\/LogBoxImages\/[^'"]+\.png['"]\)/g,
      /require\(["']\.\/assets\/[^"']+\.png["']\)/g,
      /require\(['"]@react-navigation\/elements\/lib\/module\/assets\/[^'"]+\.png['"]\)/g,
      /require\(['"]@react-navigation\/elements\/lib\/commonjs\/assets\/[^'"]+\.png['"]\)/g,
      // ES6 import patterns - replace entire import statement
      /import\s+\w+\s+from\s+['"]\.\.\/assets\/[^'"]+\.png['"];?/g,
      /import\s+\w+\s+from\s+['"]\.\/assets\/[^'"]+\.png['"];?/g
    ];
    
    let modified = false;
    
    // Handle require() patterns - replace with null
    patterns.slice(0, 7).forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, 'null');
        modified = true;
      }
    });
    
    // Handle import patterns - replace with const ... = null;
    const importPatterns = patterns.slice(7);
    importPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Extract variable name from import statement
          const varMatch = match.match(/import\s+(\w+)\s+from/);
          if (varMatch) {
            const varName = varMatch[1];
            content = content.replace(match, `const ${varName} = null;`);
            modified = true;
          }
        });
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[Patch] ✓ Patched ${relativePath}`);
    } else {
      console.log(`[Patch] ○ No changes needed for ${relativePath}`);
    }
  } catch (err) {
    console.error(`[Patch] ✗ Failed to patch ${relativePath}:`, err.message);
  }
});

console.log('[Patch] Done!');

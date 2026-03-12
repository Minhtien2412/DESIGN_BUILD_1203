#!/usr/bin/env node
/**
 * fix-encoding.js — Fix double-encoded UTF-8 Vietnamese text
 *
 * Problem: UTF-8 bytes were interpreted as Windows-1252 then re-encoded to UTF-8.
 * Solution: Build a garbled→correct mapping for all Vietnamese chars, then find-replace.
 *
 * Windows-1252 byte→codepoint table for 0x80-0x9F (differs from Latin-1):
 *   0x80→€  0x82→‚  0x83→ƒ  0x84→„  0x85→…  0x86→†  0x87→‡
 *   0x88→ˆ  0x89→‰  0x8A→Š  0x8B→‹  0x8C→Œ  0x8E→Ž  0x91→'
 *   0x92→'  0x93→"  0x94→"  0x95→•  0x96→–  0x97→—  0x98→˜
 *   0x99→™  0x9A→š  0x9B→›  0x9C→œ  0x9E→ž  0x9F→Ÿ
 */

const fs = require("fs");
const path = require("path");

// Windows-1252 byte-to-codepoint mapping for 0x80-0x9F
const WIN1252 = {
  0x80: 0x20ac, // €
  0x82: 0x201a, // ‚
  0x83: 0x0192, // ƒ
  0x84: 0x201e, // „
  0x85: 0x2026, // …
  0x86: 0x2020, // †
  0x87: 0x2021, // ‡
  0x88: 0x02c6, // ˆ
  0x89: 0x2030, // ‰
  0x8a: 0x0160, // Š
  0x8b: 0x2039, // ‹
  0x8c: 0x0152, // Œ
  0x8e: 0x017d, // Ž
  0x91: 0x2018, // '
  0x92: 0x2019, // '
  0x93: 0x201c, // "
  0x94: 0x201d, // "
  0x95: 0x2022, // •
  0x96: 0x2013, // –
  0x97: 0x2014, // —
  0x98: 0x02dc, // ˜
  0x99: 0x2122, // ™
  0x9a: 0x0161, // š
  0x9b: 0x203a, // ›
  0x9c: 0x0153, // œ
  0x9e: 0x017e, // ž
  0x9f: 0x0178, // Ÿ
};

// Reverse map: codepoint → original byte value
const WIN1252_REVERSE = {};
for (const [byte, cp] of Object.entries(WIN1252)) {
  WIN1252_REVERSE[cp] = Number(byte);
}

/**
 * Convert a byte (0x00-0xFF) to the character it would produce when
 * interpreted as Windows-1252 and then stored as a JS string (UTF-16/Unicode).
 */
function byteToWin1252Char(b) {
  if (b >= 0x80 && b <= 0x9f) {
    const cp = WIN1252[b];
    if (cp !== undefined) {
      return String.fromCodePoint(cp);
    }
    // Bytes 0x81, 0x8D, 0x8F, 0x90, 0x9D are undefined in Win-1252
    // Fall back to the raw codepoint (Latin-1 style)
    return String.fromCharCode(b);
  }
  // 0x00-0x7F and 0xA0-0xFF: same as Latin-1 / Unicode
  return String.fromCharCode(b);
}

/**
 * Given a correct Unicode Vietnamese character, produce the garbled string
 * that results from double-encoding (UTF-8 bytes → Win-1252 interpretation → UTF-8 again).
 */
function toGarbled(ch) {
  // Get UTF-8 bytes of the character
  const buf = Buffer.from(ch, "utf8");
  let garbled = "";
  for (const b of buf) {
    garbled += byteToWin1252Char(b);
  }
  return garbled;
}

/**
 * Generate all Vietnamese characters from known Unicode ranges.
 */
function getAllVietnameseChars() {
  const chars = new Set();

  // Basic Latin accented (used in Vietnamese): À-ÿ
  for (let cp = 0x00c0; cp <= 0x00ff; cp++) {
    chars.add(String.fromCodePoint(cp));
  }

  // Latin Extended-A: Đ, đ, etc.
  for (let cp = 0x0100; cp <= 0x017f; cp++) {
    chars.add(String.fromCodePoint(cp));
  }

  // Latin Extended-B: Ơ, ơ, Ư, ư
  for (let cp = 0x01a0; cp <= 0x01b4; cp++) {
    chars.add(String.fromCodePoint(cp));
  }

  // Latin Extended Additional (Vietnamese block): Ạ-ỹ
  for (let cp = 0x1ea0; cp <= 0x1ef9; cp++) {
    chars.add(String.fromCodePoint(cp));
  }

  // Combining diacritics used in Vietnamese
  const combiningMarks = [
    "\u0300",
    "\u0301",
    "\u0302",
    "\u0303",
    "\u0309",
    "\u0323",
  ];
  combiningMarks.forEach((c) => chars.add(c));

  // Additional non-Vietnamese symbols commonly found in these files that also
  // got double-encoded (currency, math, punctuation, box-drawing, etc.)
  const extraChars = [
    "²", // U+00B2 superscript 2
    "³", // U+00B3 superscript 3
    "·", // U+00B7 middle dot
    "°", // U+00B0 degree
    "±", // U+00B1 plus-minus
    "×", // U+00D7 multiplication
    "÷", // U+00F7 division
    "₫", // U+20AB dong sign
    "–", // U+2013 en dash
    "—", // U+2014 em dash
    "…", // U+2026 ellipsis
    "™", // U+2122 trademark
    "©", // U+00A9 copyright
    "®", // U+00AE registered
    "«", // U+00AB left guillemet
    "»", // U+00BB right guillemet
    "─", // U+2500 box-drawing horizontal
    "│", // U+2502 box-drawing vertical
    "┌", // U+250C box-drawing down-right
    "┐", // U+2510 box-drawing down-left
    "└", // U+2514 box-drawing up-right
    "┘", // U+2518 box-drawing up-left
    "├", // U+251C box-drawing vertical-right
    "┤", // U+2524 box-drawing vertical-left
    "┬", // U+252C box-drawing horizontal-down
    "┴", // U+2534 box-drawing horizontal-up
    "┼", // U+253C box-drawing cross
    "\u00A0", // non-breaking space
  ];
  extraChars.forEach((c) => chars.add(c));

  return [...chars];
}

/**
 * Build the garbled→correct replacement pairs.
 * Only include pairs where garbled !== correct (i.e., multi-byte chars).
 */
function buildReplacementPairs() {
  const viChars = getAllVietnameseChars();
  const pairs = [];

  for (const ch of viChars) {
    const garbled = toGarbled(ch);
    if (garbled !== ch && garbled.length > 1) {
      pairs.push({ garbled, correct: ch });
    }
  }

  // Sort by garbled length descending to replace longest matches first
  pairs.sort((a, b) => b.garbled.length - a.garbled.length);

  return pairs;
}

/**
 * Fix a single file: read, apply all replacements, write back.
 */
function fixFile(filePath, pairs) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;
  let totalReplacements = 0;

  for (const { garbled, correct } of pairs) {
    let count = 0;
    while (content.includes(garbled)) {
      content = content.split(garbled).join(correct);
      count++;
    }
    if (count > 0) {
      totalReplacements += count;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`  FIXED: ${totalReplacements} replacements`);
  } else {
    console.log("  No changes needed");
  }

  // Verification: check for remaining garbled patterns
  // Look for common garbled sequences (multi-byte Win-1252 artifacts)
  const garbledIndicators = [
    "Ã¡",
    "Ã ",
    "Ã£",
    "Ã¢",
    "Ãª",
    "Ã©",
    "Ã¨",
    "Ã­",
    "Ã¬",
    "Ã³",
    "Ã²",
    "Ãµ",
    "Ã´",
    "Ãº",
    "Ã¹",
    "Æ°",
    "Æ¡",
    "á»",
    "áº",
    "Ä",
    'â€"',
    "â€™",
    "â€œ",
    "â€˜",
    "â€¢", // Win-1252 artifacts in multi-byte sequences
  ];
  let remaining = 0;
  for (const ind of garbledIndicators) {
    const matches = content.split(ind).length - 1;
    if (matches > 0) {
      remaining += matches;
    }
  }

  // Check for replacement chars (U+FFFD)
  const repChars = (content.match(/\uFFFD/g) || []).length;

  console.log(
    `  Verification: garbled_indicators_remaining=${remaining}, replacement_chars=${repChars}`,
  );
  return { totalReplacements, remaining, repChars };
}

// Main
const ROOT = path.resolve(__dirname, "..");
const filesToFix = [
  path.join(ROOT, "app", "services", "company-detail.tsx"),
  path.join(ROOT, "app", "services", "interior-design.tsx"),
  path.join(ROOT, "app", "calculators", "index.tsx"),
];

console.log("Building replacement pairs...");
const pairs = buildReplacementPairs();
console.log(`Generated ${pairs.length} garbled→correct pairs`);

// Show a sample of pairs for debugging
console.log("\nSample pairs:");
const sampleChars = ["ớ", "ở", "ờ", "ợ", "ổ", "ệ", "ị", "ọ", "ụ", "ứ"];
for (const ch of sampleChars) {
  const g = toGarbled(ch);
  const cps = [...g].map(
    (c) => "U+" + c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"),
  );
  console.log(`  '${ch}' → garbled: '${g}' (codepoints: ${cps.join(" ")})`);
}

console.log("\nProcessing files...");
let allOk = true;
for (const f of filesToFix) {
  console.log(`\n${path.basename(f)}:`);
  if (!fs.existsSync(f)) {
    console.log("  FILE NOT FOUND - skipping");
    continue;
  }
  const result = fixFile(f, pairs);
  if (result.remaining > 0 || result.repChars > 0) {
    allOk = false;
  }
}

console.log(
  `\n${allOk ? "ALL FILES CLEAN" : "SOME ISSUES REMAIN - check output above"}`,
);

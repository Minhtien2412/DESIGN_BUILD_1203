// Custom Metro config to exclude extremely large local videos from bundling
// This prevents Metro from attempting to inline/transform huge MP4 files and crashing with
// "Cannot create a string longer than 0x1fffffe8 characters".
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Blocklist specific oversized files and an optional raw folder for uncompressed media
const patterns = [
  // Exclude all video files from assets/videos directory to prevent memory issues
  /assets[/\\]videos[/\\].*\.(mp4|mov|avi|mkv|webm)$/i,
  // Place any raw/uncompressed videos here to avoid bundling
  /assets[/\\]videos[/\\]raw[/\\].*/i,
  // Exclude _archive folders from bundling (used for archiving old route variants)
  /app[/\\].*[/\\]_archive[/\\].*/i,
  /app[/\\]_archive[/\\].*/i,
  // Exclude backups folder
  /backups[/\\].*/i,
];

config.resolver = config.resolver || {};
// Provide a single RegExp for blockList to avoid relying on metro-config exports
// Join all pattern sources with a non-capturing OR
const combined = new RegExp(patterns.map((r) => r.source).join('|'), 'i');
config.resolver.blockList = combined;

// Suppress "event-target-shim/index not listed in exports" warning
// by allowing Metro to resolve it file-based (the package works correctly)
config.resolver.disableHierarchicalLookup = false;

// NOTE: Custom resolveRequest removed for EAS compatibility
// Web platform mocks (fontfaceobserver, react-native-maps) are handled via package.json browser field

module.exports = config;

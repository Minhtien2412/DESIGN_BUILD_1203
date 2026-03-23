// Patch Node fs to handle EMFILE (too many open files) gracefully on Windows
const realFs = require("fs");
const gracefulFs = require("graceful-fs");
gracefulFs.gracefulify(realFs);

const { getSentryExpoConfig } = require("@sentry/react-native/metro");

/** @type {import('metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname);

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
  // Exclude backend, build outputs, deployment, and docker folders
  /BE-baotienweb\.cloud[/\\].*/i,
  /backend[/\\].*/i,
  /deployment[/\\].*/i,
  /docker[/\\].*/i,
  /android[/\\]build[/\\].*/i,
  /docs[/\\].*/i,
];

config.resolver = config.resolver || {};
// Provide a single RegExp for blockList to avoid relying on metro-config exports
// Join all pattern sources with a non-capturing OR
const combined = new RegExp(patterns.map((r) => r.source).join("|"), "i");
config.resolver.blockList = combined;

// Resolve legacy subpath imports used by LiveKit packages to the package root,
// which is properly exported by event-target-shim.
const eventTargetShimEntry = require.resolve("event-target-shim");
const previousResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "event-target-shim/index") {
    return {
      type: "sourceFile",
      filePath: eventTargetShimEntry,
    };
  }

  if (typeof previousResolveRequest === "function") {
    return previousResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

// NOTE: Custom resolveRequest removed for EAS compatibility
// Web platform mocks (fontfaceobserver, react-native-maps) are handled via package.json browser field

module.exports = config;

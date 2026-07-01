#!/usr/bin/env node
/**
 * post-build-cleanup.js
 * Runs AFTER `next build` to delete build artifacts that are
 * too large or unnecessary for the deployed artifact.
 */
const fs = require("fs");
const path = require("path");

const NEXT_CACHE = path.join(__dirname, "..", ".next", "cache");
const WEBPACK_CACHE = path.join(__dirname, "..", ".webpack-cache");

function rmrf(dir) {
  if (fs.existsSync(dir)) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✓ Removed: ${path.relative(__dirname + "/..", dir)}`);
    } catch (err) {
      console.warn(`⚠ Could not remove ${dir}: ${err.message}`);
    }
  }
}

rmrf(NEXT_CACHE);
rmrf(WEBPACK_CACHE);
console.log("✓ Build cleanup complete");

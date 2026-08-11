const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin this folder as the project root. Without this, Next.js walks up
  // looking for a workspace root and finds the old Express app's
  // node_modules/package.json in the parent "savoy" folder, which produces
  // harmless but noisy "isn't a directory or doesn't contain a package.json"
  // warnings for @next/swc-* platform binaries that were never installed there.
  outputFileTracingRoot: path.join(__dirname)
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export for GitHub Pages hosting.
  output: "export",
  // Preserve existing trailing-slash URLs (matches old react-snap routes & canonicals).
  trailingSlash: true,
  // GitHub Pages has no Image Optimization server.
  images: {
    unoptimized: true,
  },
  // Legacy CRA codebase has many lint findings; don't block the build on them.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // StrictMode double-invokes effects in dev; the imperative render() engine
  // manages its own roots, so keep it off to match the previous CRA behaviour.
  reactStrictMode: false,
};

module.exports = nextConfig;

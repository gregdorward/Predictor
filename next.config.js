/** @type {import('next').NextConfig} */
const nextConfig = {
  // Preserve existing trailing-slash URLs (matches old react-snap routes & canonicals).
  // On Vercel this issues 308 redirects from the non-slash variant, keeping SEO consistent.
  trailingSlash: true,
  // Legacy CRA codebase has many lint findings; don't block the build on them.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // StrictMode double-invokes effects in dev; the imperative render() engine
  // manages its own roots, so keep it off to match the previous CRA behaviour.
  reactStrictMode: false,
};

module.exports = nextConfig;

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
  async rewrites() {
    return [
      {
        // 200 on this domain — some ad crawlers do not follow a 308 to Journey.
        source: "/ads.txt",
        destination:
          "https://adstxt.journeymv.com/sites/71e44a5d-dc3a-499d-8677-800918c94d8a/ads.txt",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/seasonpreviews",
        destination: "/premier-league-2026-27/",
        permanent: true,
      },
      {
        source: "/seasonpreviews/",
        destination: "/premier-league-2026-27/",
        permanent: true,
      },
      {
        source: "/worldcup2026",
        destination: "/articles/world-cup-2026-awards/",
        permanent: true,
      },
      {
        source: "/worldcup2026/",
        destination: "/articles/world-cup-2026-awards/",
        permanent: true,
      },
      {
        source: "/teamshigh",
        destination: "/o25/",
        permanent: true,
      },
      {
        source: "/competition/world-cup-europe-qualifiers",
        destination: "/competitions/",
        permanent: true,
      },
      {
        source: "/competition/world-cup-europe-qualifiers/",
        destination: "/competitions/",
        permanent: true,
      },
      {
        source: "/competition/world-cup-south-america-qualifiers",
        destination: "/competitions/",
        permanent: true,
      },
      {
        source: "/competition/world-cup-south-america-qualifiers/",
        destination: "/competitions/",
        permanent: true,
      },
      {
        source: "/competition/world-cup-2026",
        destination: "/competitions/",
        permanent: true,
      },
      {
        source: "/competition/world-cup-2026/",
        destination: "/competitions/",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;

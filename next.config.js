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
  async redirects() {
    const slashPairs = (source, destination) => [
      { source, destination, permanent: true },
      { source: `${source}/`, destination, permanent: true },
    ];

    return [
      ...slashPairs("/seasonpreviews", "/premier-league-2026-27/"),
      ...slashPairs("/worldcup2026", "/articles/world-cup-2026-awards/"),
      ...slashPairs("/teamshigh", "/fixtureshigh/"),
      ...slashPairs("/o25", "/fixtureshigh/"),
      ...slashPairs("/u25", "/highest-scoring-leagues/"),
      ...slashPairs("/bttsteams", "/bttsfixtures/"),
      ...slashPairs("/btts-no-teams", "/bttsfixtures/"),
      ...slashPairs(
        "/competition/world-cup-europe-qualifiers",
        "/competitions/"
      ),
      ...slashPairs(
        "/competition/world-cup-south-america-qualifiers",
        "/competitions/"
      ),
      ...slashPairs("/competition/world-cup-2026", "/competitions/"),
    ];
  },
};

module.exports = nextConfig;

// Edge-cached read-through proxy to the Express data origin.
//
// The client calls /api/ss/<origin-path> instead of hitting the origin
// directly, so Vercel's CDN can serve repeat/global traffic without waking the
// (slow) origin on every page load. Only GET requests to globally-cacheable
// endpoints are allowed; anything user-specific must keep calling the origin.

const ORIGIN =
  process.env.EXPRESS_SERVER || process.env.NEXT_PUBLIC_EXPRESS_SERVER;

// Per-endpoint freshness, keyed by the first path segment.
//   sMaxAge: how long the CDN serves a fresh copy before revalidating.
//   swr: how long a stale copy may be served instantly while it refreshes.
// Keep these keys in sync with PROXIED_ENDPOINTS in src/utils/apiUrl.js.
const CACHE_RULES = {
  matches: { sMaxAge: 120, swr: 86400 },
  results: { sMaxAge: 300, swr: 86400 },
  tables: { sMaxAge: 600, swr: 86400 },
  leagues: { sMaxAge: 300, swr: 86400 },
  form: { sMaxAge: 300, swr: 86400 },
  formTeam: { sMaxAge: 300, swr: 86400 },
  leagueFixtures: { sMaxAge: 300, swr: 86400 },
  scheduledEvents: { sMaxAge: 300, swr: 86400 },
  "league-averages": { sMaxAge: 600, swr: 86400 },
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!ORIGIN) {
    return res.status(500).json({ error: "Origin not configured" });
  }

  const segments = Array.isArray(req.query.path)
    ? req.query.path
    : [req.query.path];
  const head = segments[0];
  const rule = CACHE_RULES[head];

  // Only allowlisted, non-personalised endpoints may be proxied + cached.
  if (!rule) {
    return res
      .status(404)
      .json({ error: `Endpoint '${head}' is not proxyable` });
  }

  // Preserve any original query string (e.g. ?page=2).
  const qs = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const target = `${ORIGIN}${segments.join("/")}${qs}`;

  try {
    const upstream = await fetch(target, {
      headers: {
        ...(process.env.NEXT_PUBLIC_API_KEY
          ? { "x-api-key": process.env.NEXT_PUBLIC_API_KEY }
          : {}),
        accept: "application/json",
      },
    });

    const body = await upstream.text();

    if (!upstream.ok) {
      // Don't cache origin errors, so a transient blip isn't pinned for minutes.
      res.setHeader("Cache-Control", "no-store");
      return res.status(upstream.status).send(body);
    }

    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${rule.sMaxAge}, stale-while-revalidate=${rule.swr}`
    );
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/json"
    );
    return res.status(200).send(body);
  } catch (err) {
    res.setHeader("Cache-Control", "no-store");
    return res
      .status(502)
      .json({ error: "Upstream fetch failed", detail: String(err) });
  }
}

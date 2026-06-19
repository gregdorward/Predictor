// Endpoints whose GET responses are global (identical for every visitor) and so
// can be served through the edge-cached proxy at /api/ss/*. Keep this in sync
// with CACHE_RULES in pages/api/ss/[...path].js. User-specific endpoints
// (e.g. predictedScores2, tipsNEW) are intentionally absent so they keep
// hitting the origin directly and are never cached.
const PROXIED_ENDPOINTS = new Set([
  "matches",
  "results",
  "tables",
  "leagues",
  "form",
  "formTeam",
  "leagueFixtures",
  "scheduledEvents",
  "league-averages",
  "match-snapshot",
]);

const ORIGIN = process.env.NEXT_PUBLIC_EXPRESS_SERVER;

// Build a URL for a read (GET) request to the data API. Allowlisted, globally
// cacheable endpoints are routed through the same-origin Vercel proxy (so the
// CDN can cache them); everything else — and any server-side call, where the
// relative proxy path wouldn't resolve — falls back to the origin.
export function apiGetUrl(path) {
  const head = String(path).split(/[/?&]/)[0];
  if (typeof window !== "undefined" && PROXIED_ENDPOINTS.has(head)) {
    // next.config has trailingSlash:true, which 308-redirects un-slashed URLs.
    // Emit the canonical trailing-slash URL (slash placed before any query
    // string) so the client hits the cached endpoint directly with no hop.
    const [p, query] = String(path).split("?");
    const slashed = p.endsWith("/") ? p : `${p}/`;
    return `/api/ss/${slashed}${query ? `?${query}` : ""}`;
  }
  return `${ORIGIN}${path}`;
}

// Edge-cached read-through proxy to the Express data origin.
//
// Runs on the Edge runtime and streams the upstream body straight through, so
// large payloads (e.g. /results) aren't buffered and aren't subject to the 4MB
// Node serverless response limit. The client calls /api/ss/<origin-path>
// instead of the origin directly, letting Vercel's CDN cache global traffic.
// Only GET requests to allowlisted, non-personalised endpoints are proxied.
//
// scheduledEvents responses are tagged for targeted CDN invalidation. Purge
// edge + origin (S3) cache for a date with:
//   curl "https://www.soccerstatshub.com/api/ss/scheduledEvents/YYYY-MM-DD/?refresh=true" \
//     -H "x-api-key: $CACHE_REFRESH_KEY"

import { dangerouslyDeleteByTag } from "@vercel/functions";

export const config = { runtime: "edge" };

const SCHEDULED_EVENTS_TAG = "scheduled-events";
const CACHE_REFRESH_KEY =
  process.env.CACHE_REFRESH_KEY || process.env.API_KEY || "";

const ORIGIN =
  process.env.EXPRESS_SERVER || process.env.NEXT_PUBLIC_EXPRESS_SERVER;

// Per-endpoint freshness, keyed by the first path segment.
//   sMaxAge: how long the CDN serves a fresh copy before revalidating.
//   swr: how long a stale copy may be served instantly while it refreshes.
// Keep these keys in sync with PROXIED_ENDPOINTS in src/utils/apiUrl.js.
const CACHE_RULES = {
  matches: { sMaxAge: 600, swr: 86400 },
  results: { sMaxAge: 1200, swr: 86400 },
  tables: { sMaxAge: 1200, swr: 86400 },
  leagues: { sMaxAge: 1200, swr: 86400 },
  form: { sMaxAge: 600, swr: 86400 },
  formTeam: { sMaxAge: 2400, swr: 86400 },
  leagueFixtures: { sMaxAge: 600, swr: 86400 },
  scheduledEvents: { sMaxAge: 300, swr: 3600 },
  "league-averages": { sMaxAge: 100, swr: 86400 },
  "match-snapshot": { sMaxAge: 21600, swr: 86400 },
  referee: { sMaxAge: 86400, swr: 604800 },
  teamStats: { sMaxAge: 3600, swr: 86400 },
  cuptrees: { sMaxAge: 86400, swr: 86400 },
  competition: { sMaxAge: 600, swr: 86400 },
};

function jsonError(body, status, extraHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

function scheduledEventsCacheTags(date) {
  return date
    ? [`${SCHEDULED_EVENTS_TAG}-${date}`, SCHEDULED_EVENTS_TAG]
    : [SCHEDULED_EVENTS_TAG];
}

function isAuthorizedCacheRefresh(req) {
  if (!CACHE_REFRESH_KEY) return false;
  return req.headers.get("x-api-key") === CACHE_REFRESH_KEY;
}

export default async function handler(req) {
  if (req.method !== "GET") {
    return jsonError({ error: "Method not allowed" }, 405, { Allow: "GET" });
  }
  if (!ORIGIN) {
    return jsonError({ error: "Origin not configured" }, 500);
  }

  const url = new URL(req.url);
  const rest = url.pathname.replace(/^\/api\/ss\//, "").replace(/\/+$/, "");
  const segments = rest.split("/");
  const head = segments[0];
  const rule = CACHE_RULES[head];

  // Only allowlisted, non-personalised endpoints may be proxied + cached.
  if (!rule) {
    return jsonError({ error: `Endpoint '${head}' is not proxyable` }, 404);
  }

  const targetPath =
    head === "match-snapshot"
      ? ["match", "snapshot", ...segments.slice(1)].join("/")
      : segments.join("/");
  const origin = ORIGIN.endsWith("/") ? ORIGIN : `${ORIGIN}/`;
  const refresh = url.searchParams.get("refresh") === "true";
  const scheduledEventsDate =
    head === "scheduledEvents" ? segments[1] || "" : "";

  if (head === "scheduledEvents" && refresh) {
    if (!isAuthorizedCacheRefresh(req)) {
      return jsonError({ error: "Unauthorized" }, 401);
    }
    await dangerouslyDeleteByTag(scheduledEventsCacheTags(scheduledEventsDate), {
      revalidationDeadlineSeconds: 0,
    });
  }

  const target = `${origin}${targetPath}${url.search}`;

  try {
    const upstream = await fetch(target, {
      headers: {
        ...(process.env.NEXT_PUBLIC_API_KEY
          ? { "x-api-key": process.env.NEXT_PUBLIC_API_KEY }
          : {}),
        accept: "application/json",
      },
    });

    const contentType =
      upstream.headers.get("content-type") || "application/json";

    if (!upstream.ok) {
      // Don't cache origin errors, so a transient blip isn't pinned for minutes.
      return new Response(upstream.body, {
        status: upstream.status,
        headers: { "Cache-Control": "no-store", "Content-Type": contentType },
      });
    }

    const responseHeaders = {
      "Content-Type": contentType,
    };

    if (head === "scheduledEvents" && refresh) {
      responseHeaders["Cache-Control"] = "no-store";
    } else {
      responseHeaders["Cache-Control"] =
        `public, s-maxage=${rule.sMaxAge}, stale-while-revalidate=${rule.swr}`;
      if (head === "scheduledEvents") {
        responseHeaders["Vercel-Cache-Tag"] = scheduledEventsCacheTags(
          scheduledEventsDate
        ).join(",");
      }
    }

    // Stream the body through with CDN cache headers; nothing is buffered.
    return new Response(upstream.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err) {
    return jsonError(
      { error: "Upstream fetch failed", detail: String(err) },
      502
    );
  }
}

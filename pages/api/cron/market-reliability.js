/**
 * Daily build of the Market Reliability Index behind /market-reliability/.
 *
 * Reads the already-warmed /results cache (odds + scores), so this adds no
 * RapidAPI calls. Persists a compact overview blob for SSR.
 */

import { getIndexableCompetitions } from "../../../src/seo/competitionCatalog";
import { buildMarketReliabilityOverview } from "../../../src/seo/marketReliabilityData";

const ORIGIN =
  process.env.EXPRESS_SERVER ||
  process.env.NEXT_PUBLIC_EXPRESS_SERVER ||
  "https://api.soccerstatshub.com/";

export const config = { maxDuration: 120 };

function isAuthorized(req) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return { ok: false, reason: "missing_secret" };

  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  const querySecret =
    typeof req.query.secret === "string" ? req.query.secret.trim() : null;

  if (bearer === secret || querySecret === secret) {
    return { ok: true };
  }

  return { ok: false, reason: "invalid_secret" };
}

function originUrl(path) {
  const base = ORIGIN.endsWith("/") ? ORIGIN : `${ORIGIN}/`;
  return `${base}${String(path).replace(/^\//, "")}`;
}

async function fetchResults() {
  const response = await fetch(originUrl("results"), {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Failed to load /results (${response.status})`);
  }
  return response.json();
}

async function persistOverview(payload) {
  const response = await fetch(originUrl("market-reliability-overview"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CRON_SECRET,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Origin rejected the MRI overview (${response.status}): ${detail.slice(0, 200)}`
    );
  }

  return response.json().catch(() => ({}));
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const auth = isAuthorized(req);
  if (!auth.ok) {
    return res.status(401).json({ error: "Unauthorized", reason: auth.reason });
  }

  try {
    const results = await fetchResults();
    const overview = buildMarketReliabilityOverview(
      results,
      getIndexableCompetitions()
    );

    if (!overview.leagues.length) {
      return res.status(503).json({
        error: "No leagues qualified for the Market Reliability Index",
        leagues: 0,
      });
    }

    const persist = await persistOverview(overview);
    return res.status(200).json({
      ok: true,
      leagues: overview.leagues.length,
      mostReliableTeams: overview.mostReliableTeams.length,
      leastReliableTeams: overview.leastReliableTeams.length,
      generatedAt: overview.generatedAt,
      persist,
    });
  } catch (error) {
    console.error("market-reliability cron failed:", error);
    return res.status(500).json({
      error: "Failed to build Market Reliability Index",
      details: error.message,
    });
  }
}

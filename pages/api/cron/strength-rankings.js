/**
 * Daily build of strength rankings behind /strength-rankings/.
 *
 * Reads the already-warmed /results cache, so this adds no RapidAPI calls.
 * Competition bases stay pinned in code. Persists a compact overview for SSR.
 */

import { buildStrengthOverview } from "../../../src/logic/strengthRankings";

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
  const response = await fetch(originUrl("strength-rankings-overview"), {
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
      `Origin rejected the strength rankings (${response.status}): ${detail.slice(0, 200)}`
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
    const overview = buildStrengthOverview(results);

    if (!overview.leagues.length || !overview.global.length) {
      return res.status(503).json({
        error: "No clubs qualified for strength rankings",
        leagues: overview.leagues.length,
        teams: overview.global.length,
      });
    }

    const persist = await persistOverview(overview);
    return res.status(200).json({
      ok: true,
      leagues: overview.leagues.length,
      teams: overview.global.length,
      generatedAt: overview.generatedAt,
      persist,
    });
  } catch (error) {
    console.error("strength-rankings cron failed:", error);
    return res.status(500).json({
      error: "Failed to build strength rankings",
      details: error.message,
    });
  }
}

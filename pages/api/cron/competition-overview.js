/**
 * Daily build of the cross-league comparison dataset behind /competitions/compare/.
 *
 * Runs before the IndexNow ping (see vercel.json) so the page is fresh by the
 * time crawlers are told about it. Reads the same `competition/{id}` endpoint the
 * competition pages use, which serves today's S3 object, so this adds no
 * upstream stat-provider calls beyond the daily warm that already happens.
 */

import { getIndexableCompetitions } from "../../../src/seo/competitionCatalog";
import {
  buildCompetitionOverview,
  buildEligibleRow,
} from "../../../src/seo/competitionOverviewData";
import { fetchCompetitionData, mapWithConcurrency } from "../../../src/seo/serverFetch";

const ORIGIN =
  process.env.EXPRESS_SERVER ||
  process.env.NEXT_PUBLIC_EXPRESS_SERVER ||
  "https://api.soccerstatshub.com/";

const FETCH_CONCURRENCY = 4;

/**
 * Generous, because the first run of the day may cold-fill the origin's cache
 * from the stat provider. A league that times out is a league missing from the
 * comparison, which is worse than the run taking longer.
 */
const FETCH_TIMEOUT_MS = 20000;
const RETRY_TIMEOUT_MS = 30000;

/** Above this share of unreachable leagues, keep yesterday's dataset instead. */
const MAX_FAILURE_RATIO = 0.2;

/** Origin reads are S3 hits, but leave room for a cold-fill morning run. */
export const config = { maxDuration: 300 };

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

async function persistOverview(payload) {
  const response = await fetch(originUrl("competition-overview"), {
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
      `Origin rejected the overview (${response.status}): ${detail.slice(0, 200)}`
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
    if (auth.reason === "missing_secret") {
      return res
        .status(503)
        .json({ error: "CRON_SECRET is not configured on this deployment" });
    }
    return res.status(401).json({ error: "Unauthorized" });
  }

  const competitions = getIndexableCompetitions();

  async function resolve(competition, timeoutMs) {
    const data = await fetchCompetitionData(competition.id, { timeoutMs });
    if (!data) return { competition, row: null, failed: true };
    return {
      competition,
      row: buildEligibleRow(data, competition),
      failed: false,
    };
  }

  try {
    const firstPass = await mapWithConcurrency(
      competitions,
      FETCH_CONCURRENCY,
      (competition) => resolve(competition, FETCH_TIMEOUT_MS)
    );

    // Retry unreachable leagues one at a time, so a slow origin does not quietly
    // drop a major league from the comparison.
    const results = [...firstPass];
    const retried = [];
    for (let index = 0; index < results.length; index += 1) {
      if (!results[index].failed) continue;
      retried.push(results[index].competition.slug);
      results[index] = await resolve(results[index].competition, RETRY_TIMEOUT_MS);
    }

    const eligible = results.map((entry) => entry.row).filter(Boolean);
    const failed = results
      .filter((entry) => entry.failed)
      .map((entry) => entry.competition.slug);

    if (eligible.length === 0) {
      // Never overwrite a good dataset with an empty one.
      return res.status(502).json({
        error: "No eligible competitions resolved - keeping the previous dataset",
        fetched: competitions.length,
        failed,
      });
    }

    if (failed.length > Math.ceil(competitions.length * MAX_FAILURE_RATIO)) {
      return res.status(502).json({
        error:
          "Too many competitions unreachable - keeping the previous dataset rather than publishing a partial one",
        fetched: competitions.length,
        eligible: eligible.length,
        failed,
      });
    }

    const payload = buildCompetitionOverview(eligible);
    const stored = await persistOverview(payload);

    return res.status(200).json({
      ok: true,
      fetched: competitions.length,
      eligible: eligible.length,
      skipped: competitions.length - eligible.length,
      retried,
      failed,
      generatedAt: payload.generatedAt,
      stored,
    });
  } catch (error) {
    console.error("Competition overview cron failed:", error);
    return res
      .status(500)
      .json({ error: error.message || "Competition overview cron failed" });
  }
}

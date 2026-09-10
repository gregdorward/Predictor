import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

import { buildMatchFromFixture } from "./buildMatchFromFixture.js";
import { getLeagueName } from "./leagueNames.js";
import { toFormDateKey, toIsoDate } from "./dateUtils.js";

function normalizeOrigin(origin) {
  if (!origin) {
    throw new Error("NEXT_PUBLIC_EXPRESS_SERVER is not set.");
  }
  return origin.endsWith("/") ? origin : `${origin}/`;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    return { ok: false, status: response.status, data: null };
  }
  const data = await response.json();
  return { ok: true, status: response.status, data };
}

function matchesCacheDir() {
  return resolve(process.cwd(), "scripts/output/backtest-cache");
}

function matchesCachePath(isoDate) {
  return resolve(matchesCacheDir(), `matches-${isoDate}.json`);
}

function readMatchesCache(isoDate) {
  const path = matchesCachePath(isoDate);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function writeMatchesCache(isoDate, data) {
  mkdirSync(matchesCacheDir(), { recursive: true });
  writeFileSync(matchesCachePath(isoDate), JSON.stringify(data));
}

async function loadMatchesPayload(isoDate, origin) {
  const cached = readMatchesCache(isoDate);
  if (cached != null) {
    return { ok: true, status: 200, data: cached, source: "cache" };
  }

  const matchesRes = await fetchJson(`${origin}matches/${isoDate}`);
  if (matchesRes.ok && matchesRes.data != null) {
    writeMatchesCache(isoDate, matchesRes.data);
  }
  return { ...matchesRes, source: "api" };
}

function parseAllForm(formData) {
  if (Array.isArray(formData?.allForm)) return formData.allForm;
  if (Array.isArray(formData)) return formData;
  return [];
}

export async function fetchGlobalBacktestData(apiOrigin) {
  const origin = normalizeOrigin(apiOrigin);

  const [resultsRes, averagesRes, predictedScoresRes] = await Promise.all([
    fetchJson(`${origin}results`),
    fetchJson(`${origin}league-averages`),
    fetchJson(`${origin}predictedScores2`),
  ]);

  if (!resultsRes.ok) {
    throw new Error(`Failed to load results (${resultsRes.status}).`);
  }

  let leagueAveragesFallback = null;
  if (averagesRes.ok && Array.isArray(averagesRes.data)) {
    leagueAveragesFallback = averagesRes.data;
  }

  const predictedScores = Array.isArray(predictedScoresRes.data)
    ? predictedScoresRes.data
    : [];

  if (!predictedScoresRes.ok) {
    console.warn(
      `Failed to load predictedScores2 (${predictedScoresRes.status}); kickoff snapshots unavailable.`
    );
  }

  return {
    leagueResults: Array.isArray(resultsRes.data) ? resultsRes.data : [],
    leagueAveragesFallback,
    predictedScores,
  };
}

export async function loadDayData(date, apiOrigin) {
  const origin = normalizeOrigin(apiOrigin);
  const isoDate = toIsoDate(date);
  const formKey = toFormDateKey(date);

  const formRes = await fetchJson(`${origin}form/${formKey}`);

  if (!formRes.ok) {
    return {
      isoDate,
      formKey,
      skipped: true,
      reason: "no_cached_form",
      matches: [],
      allForm: [],
    };
  }

  const allForm = parseAllForm(formRes.data);

  if (allForm.length === 0) {
    return {
      isoDate,
      formKey,
      skipped: true,
      reason: "empty_cached_form",
      matches: [],
      allForm: [],
    };
  }

  const [matchesRes, averagesRes] = await Promise.all([
    loadMatchesPayload(isoDate, origin),
    fetchJson(`${origin}league-averages/${formKey}`),
  ]);

  if (!matchesRes.ok) {
    return {
      isoDate,
      formKey,
      skipped: true,
      reason: "matches_unavailable",
      matches: [],
      allForm: [],
    };
  }

  const fixtureList = Array.isArray(matchesRes.data?.data)
    ? matchesRes.data.data
    : Array.isArray(matchesRes.data)
      ? matchesRes.data
      : [];

  const formIds = new Set(allForm.map((entry) => entry.id));
  const completeFixtures = fixtureList.filter(
    (fixture) => fixture.status === "complete"
  );

  const matches = [];
  for (const fixture of completeFixtures) {
    if (!formIds.has(fixture.id)) {
      continue;
    }

    const leagueName = getLeagueName(fixture.competition_id, fixture);
    matches.push(buildMatchFromFixture(fixture, leagueName));
  }

  const leagueAverages =
    averagesRes.ok && Array.isArray(averagesRes.data) ? averagesRes.data : null;

  return {
    isoDate,
    formKey,
    skipped: false,
    reason: null,
    matches,
    allForm,
    leagueAverages,
    leagueAveragesSource: leagueAverages ? "dated" : "missing",
    matchesSource: matchesRes.source ?? "api",
  };
}

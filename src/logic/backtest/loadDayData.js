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

export async function fetchGlobalBacktestData(apiOrigin) {
  const origin = normalizeOrigin(apiOrigin);

  const [resultsRes, averagesRes] = await Promise.all([
    fetchJson(`${origin}results`),
    fetchJson(`${origin}league-averages`),
  ]);

  if (!resultsRes.ok) {
    throw new Error(`Failed to load results (${resultsRes.status}).`);
  }
  if (!averagesRes.ok) {
    throw new Error(`Failed to load league-averages (${averagesRes.status}).`);
  }

  return {
    leagueResults: Array.isArray(resultsRes.data) ? resultsRes.data : [],
    leagueAverages: averagesRes.data,
  };
}

export async function loadDayData(date, apiOrigin) {
  const origin = normalizeOrigin(apiOrigin);
  const isoDate = toIsoDate(date);
  const formKey = toFormDateKey(date);

  const [matchesRes, formRes] = await Promise.all([
    fetchJson(`${origin}matches/${isoDate}`),
    fetchJson(`${origin}form/${formKey}`),
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

  const fixtureList = Array.isArray(matchesRes.data?.data)
    ? matchesRes.data.data
    : Array.isArray(matchesRes.data)
      ? matchesRes.data
      : [];

  const allForm = Array.isArray(formRes.data?.allForm)
    ? formRes.data.allForm
    : Array.isArray(formRes.data)
      ? formRes.data
      : [];

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

  return {
    isoDate,
    formKey,
    skipped: false,
    reason: null,
    matches,
    allForm,
  };
}

import { getLeagueFixturesByLeagueId } from "../utils/leagueResultsAccess";
import { buildTeamLeagueProfile } from "./buildTeamLeagueProfile";

const MIN_LEAGUE_FIXTURES = 10;
/** Exclude World Cup / API-form-only leagues that lack results-parity history. */
const SKIP_LEAGUE_IDS = new Set([16494, 7956]);

function uniqueTeamNames(fixtures) {
  const names = new Set();
  for (const fixture of fixtures || []) {
    if (fixture?.home_name) names.add(fixture.home_name);
    if (fixture?.away_name) names.add(fixture.away_name);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

/**
 * Build slim comparison profiles for every team in a league from results cache.
 */
export async function buildLeagueTeamComparison(
  allLeagueResults,
  leagueId,
  asOfUnix = Math.floor(Date.now() / 1000),
  options = {}
) {
  if (SKIP_LEAGUE_IDS.has(Number(leagueId))) {
    return null;
  }

  const fixtures = getLeagueFixturesByLeagueId(allLeagueResults, leagueId);
  if (fixtures.length <= MIN_LEAGUE_FIXTURES) {
    return null;
  }

  const teams = uniqueTeamNames(fixtures);
  const profiles = [];

  for (const teamName of teams) {
    const profile = await buildTeamLeagueProfile(
      teamName,
      fixtures,
      asOfUnix,
      options
    );
    if (profile) {
      profiles.push(profile);
    }
  }

  if (profiles.length === 0) {
    return null;
  }

  profiles.sort((a, b) => b.attackingStrength - a.attackingStrength);

  return {
    leagueId: Number(leagueId) || leagueId,
    asOfUnix,
    generatedAt: new Date().toISOString(),
    teamCount: profiles.length,
    teams: profiles,
  };
}

/**
 * Build and POST league comparison payloads for every league in the results cache.
 */
function normalizeComparisonDate(dateStr) {
  const isoMatch = String(dateStr || "").match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Compact homepage format: M D YYYY concatenated (e.g. 872026 → 2026-08-07).
  const compactMatch = String(dateStr || "").match(/^(\d{1,2})(\d{1,2})(20\d{2})$/);
  if (compactMatch) {
    const month = Number(compactMatch[1]);
    const day = Number(compactMatch[2]);
    const year = Number(compactMatch[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  return null;
}

export async function persistLeagueComparisons({
  allLeagueResults,
  dateStr,
  expressBaseUrl,
  asOfUnix = Math.floor(Date.now() / 1000),
}) {
  if (!Array.isArray(allLeagueResults) || allLeagueResults.length === 0) {
    return { ok: 0, skipped: 0, failed: 0 };
  }
  if (!expressBaseUrl || !dateStr) {
    console.warn("persistLeagueComparisons: missing expressBaseUrl or dateStr");
    return { ok: 0, skipped: 0, failed: 0 };
  }

  const normalizedDateStr = normalizeComparisonDate(dateStr);
  if (!normalizedDateStr) {
    console.warn(
      `persistLeagueComparisons: unrecognized dateStr "${dateStr}"`
    );
    return { ok: 0, skipped: 0, failed: 0 };
  }

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of allLeagueResults) {
    const leagueId = entry?.id;
    if (leagueId == null) {
      skipped += 1;
      continue;
    }

    try {
      const payload = await buildLeagueTeamComparison(
        allLeagueResults,
        leagueId,
        asOfUnix
      );

      if (!payload) {
        skipped += 1;
        continue;
      }

      const response = await fetch(
        `${expressBaseUrl}leagueComparison/${leagueId}/${normalizedDateStr}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        console.error(
          `Failed to persist leagueComparison for ${leagueId}:`,
          response.status
        );
        failed += 1;
      } else {
        ok += 1;
      }
    } catch (error) {
      console.error(`Error building leagueComparison for ${leagueId}:`, error);
      failed += 1;
    }
  }

  console.log(
    `League comparisons persisted: ok=${ok} skipped=${skipped} failed=${failed}`
  );
  return { ok, skipped, failed };
}

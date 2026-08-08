#!/usr/bin/env node
/**
 * Checker for FootyStats season IDs and SofaScore season IDs.
 * Loads API keys from footballServer/.env — does not print keys.
 * CURRENT is synced from src/constants/footyStatsToSofaScore.js.
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(path) {
  const env = {};
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
    }
  } catch {
    /* ignore */
  }
  return env;
}

const serverEnv = loadEnvFile(resolve(__dirname, "../../footballServer/.env"));
const FOOTY_KEY = serverEnv.API_KEY || process.env.API_KEY;
const SOFA_KEY = serverEnv.SOFASCORE_RAPIDAPI_KEY || process.env.SOFASCORE_RAPIDAPI_KEY;

if (!FOOTY_KEY) {
  console.error("Missing API_KEY in footballServer/.env");
  process.exit(1);
}
if (!SOFA_KEY) {
  console.error("Missing SOFASCORE_RAPIDAPI_KEY in footballServer/.env");
  process.exit(1);
}

// Synced from src/constants/footyStatsToSofaScore.js
const CURRENT = {
  17146: { name: "Premier League", sofaTournament: 17, sofaSeason: 96668 },
  16494: { name: "World Cup 2026", sofaTournament: 16, sofaSeason: 58210 },
  17184: { name: "Championship", sofaTournament: 18, sofaSeason: 97037 },
  17180: { name: "League One", sofaTournament: 24, sofaSeason: 97077 },
  17185: { name: "League Two", sofaTournament: 25, sofaSeason: 97078 },
  17279: { name: "National League", sofaTournament: 173, sofaSeason: 98160 },
  17263: { name: "National League North", sofaTournament: 176, sofaSeason: 98275 },
  17403: { name: "National League South", sofaTournament: 174, sofaSeason: 98274 },
  17210: { name: "Bundesliga", sofaTournament: 35, sofaSeason: 97464 },
  17199: { name: "La Liga", sofaTournament: 8, sofaSeason: 97268 },
  17148: { name: "Scottish Premiership", sofaTournament: 36, sofaSeason: 96658 },
  17128: { name: "Champions League", sofaTournament: 7, sofaSeason: 96518 },
  17084: { name: "Serie A", sofaTournament: 23, sofaSeason: 95836 },
  16504: { name: "MLS", sofaTournament: 242, sofaSeason: 86668 },
  17102: { name: "Ligue 1", sofaTournament: 34, sofaSeason: 96127 },
  17217: { name: "Primeira Liga", sofaTournament: 238, sofaSeason: 97436 },
  16556: { name: "Copa Libertadores", sofaTournament: 384, sofaSeason: 87760 },
  17097: { name: "Eredivisie", sofaTournament: 37, sofaSeason: 96143 },
  17171: { name: "Belgian Pro League", sofaTournament: 38, sofaSeason: 96616 },
  17091: { name: "Danish Superliga", sofaTournament: 39, sofaSeason: 95785 },
  16558: { name: "Eliteserien", sofaTournament: 20, sofaSeason: 87809 },
  17181: { name: "Austrian Bundesliga", sofaTournament: 45, sofaSeason: 97043 },
  17356: { name: "Greek Super League", sofaTournament: 185, sofaSeason: 98659 },
  17265: { name: "Turkish Super Lig", sofaTournament: 52, sofaSeason: 98080 },
  17112: { name: "Ekstraklasa", sofaTournament: 202, sofaSeason: 96144 },
  17269: { name: "Segunda Division", sofaTournament: 54, sofaSeason: 97280 },
  17212: { name: "Bundesliga 2", sofaTournament: 44, sofaSeason: 97406 },
  17267: { name: "3. Liga", sofaTournament: 491, sofaSeason: 98012 },
  17117: { name: "Ligue 2", sofaTournament: 182, sofaSeason: 96109 },
  17404: { name: "Serie B", sofaTournament: 53, sofaSeason: 99067 },
  17110: { name: "Eerste Divisie", sofaTournament: 131, sofaSeason: 96187 },
  17144: { name: "Scottish Championship", sofaTournament: 206, sofaSeason: 96614 },
  17147: { name: "Scottish League One", sofaTournament: 207, sofaSeason: 96638 },
  17140: { name: "Scottish League Two", sofaTournament: 209, sofaSeason: 96664 },
  17129: { name: "Swiss Super League", sofaTournament: 215, sofaSeason: 96589 },
  17087: { name: "Croatian First League", sofaTournament: 170, sofaSeason: 95727 },
  17157: { name: "Czech First League", sofaTournament: 172, sofaSeason: 96966 },
  17099: { name: "Liga MX", sofaTournament: 11621, sofaSeason: 96191 },
  16544: { name: "Brazil Serie A", sofaTournament: 325, sofaSeason: 87678 },
  16808: { name: "UEFA Nations League", sofaTournament: 10783, sofaSeason: 89945 },
  16614: { name: "Colombian Primera Division", sofaTournament: 11539, sofaSeason: 88503 },
  17115: { name: "J League", sofaTournament: 196, sofaSeason: 96370 },
  16627: { name: "K League", sofaTournament: 410, sofaSeason: 88606 },
  17426: { name: "Saudi Pro League", sofaTournament: 955, sofaSeason: 99275 },
  16263: { name: "Allsvenskan", sofaTournament: 40, sofaSeason: 87925 },
  16537: { name: "Irish Premier Division", sofaTournament: 192, sofaSeason: 87682 },
  17326: { name: "A-League", sofaTournament: 136, sofaSeason: 98511 },
  17127: { name: "Europa League", sofaTournament: 679, sofaSeason: 96522 },
  17130: { name: "Europa Conference League", sofaTournament: 17015, sofaSeason: 96529 },
  16571: { name: "Argentina Primera Division", sofaTournament: 155, sofaSeason: 87913 },
};

let footyCalls = 0;
let sofaCalls = 0;

async function fetchFootyLeagueList() {
  footyCalls++;
  const url = `https://api.football-data-api.com/league-list?chosen_leagues_only=true&key=${FOOTY_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FootyStats league-list HTTP ${res.status}`);
  return res.json();
}

async function fetchSofaSeasons(tournamentId) {
  sofaCalls++;
  const url = `https://sofascore.p.rapidapi.com/tournaments/get-seasons?tournamentId=${tournamentId}`;
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-host": "sofascore.p.rapidapi.com",
      "x-rapidapi-key": SOFA_KEY,
    },
  });
  if (!res.ok) {
    throw new Error(`SofaScore get-seasons HTTP ${res.status} for tournament ${tournamentId}`);
  }
  return res.json();
}

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function pickLatestSeason(seasons) {
  if (!Array.isArray(seasons) || seasons.length === 0) return null;
  return seasons[0];
}

function getSeasons(league) {
  return league?.season || league?.seasons || [];
}

function pickLatestFootySeason(seasons) {
  if (!seasons.length) return null;
  return seasons.reduce((a, b) => (Number(b.id) > Number(a?.id || 0) ? b : a), null);
}

function findLeagueMatch(leagues, currentId, meta) {
  for (const league of leagues) {
    for (const s of getSeasons(league)) {
      if (Number(s.id) === Number(currentId)) {
        const latest = pickLatestFootySeason(getSeasons(league));
        return { league, matchedSeason: s, latestSeason: latest, matchType: "exact-season-id" };
      }
    }
  }

  const targetName = normalize(meta.name);
  let best = null;
  for (const league of leagues) {
    const leagueNames = [league.name, league.english_name, league.league_name]
      .filter(Boolean)
      .map(normalize);
    const isMatch = leagueNames.some(
      (n) => n === targetName || n.includes(targetName) || targetName.includes(n)
    );
    if (!isMatch) continue;
    const latest = pickLatestFootySeason(getSeasons(league));
    if (!latest) continue;
    const score = leagueNames.some((n) => n === targetName) ? 2 : 1;
    if (
      !best ||
      score > best.score ||
      (score === best.score && Number(latest.id) > Number(best.latestSeason.id))
    ) {
      best = { league, latestSeason: latest, matchType: "name-match", score };
    }
  }
  return best;
}

const footyResult = await fetchFootyLeagueList();
console.log(`FootyStats API calls: ${footyCalls}`);

if (!footyResult.success && !footyResult.data) {
  console.error("FootyStats API error:", JSON.stringify(footyResult).slice(0, 300));
  process.exit(1);
}

const leagues = footyResult.data || footyResult;
console.log(`Leagues returned: ${leagues.length}`);

const footyUpdates = [];
const footyUnchanged = [];
const footyUnmatched = [];

for (const [currentId, meta] of Object.entries(CURRENT)) {
  const match = findLeagueMatch(leagues, currentId, meta);
  if (!match) {
    footyUnmatched.push({ currentId: Number(currentId), name: meta.name });
    continue;
  }

  const latestId = Number(match.latestSeason?.id || match.matchedSeason?.id);
  const latestYear = match.latestSeason?.year ?? match.matchedSeason?.year;

  if (latestId && latestId !== Number(currentId)) {
    footyUpdates.push({
      name: meta.name,
      oldId: Number(currentId),
      newId: latestId,
      year: latestYear,
      leagueName: match.league?.name || match.league?.english_name,
      matchType: match.matchType,
    });
  } else {
    footyUnchanged.push({
      id: Number(currentId),
      name: meta.name,
      year: latestYear,
    });
  }
}

console.log("\n=== FOOTYSTATS COMPARISON ===");
console.log("Updates needed:", footyUpdates.length);
console.log(JSON.stringify(footyUpdates, null, 2));
console.log("Unchanged:", footyUnchanged.length);
console.log("Unmatched:", footyUnmatched.length);
console.log(JSON.stringify(footyUnmatched, null, 2));

// SofaScore: only check tournaments for Footy updates + still-stale 25/26 entries
const sofaCheckNames = new Set([
  ...footyUpdates.map((u) => u.name),
  ...Object.values(CURRENT)
    .filter((m) => m.name.includes("South") || m.name === "Serie B" || m.name === "Saudi Pro League")
    .map((m) => m.name),
]);

const sofaTargets = Object.entries(CURRENT).filter(([, meta]) =>
  sofaCheckNames.has(meta.name)
);
const tournamentIds = [...new Set(sofaTargets.map(([, meta]) => meta.sofaTournament))];
const sofaUpdates = [];
const sofaUnchanged = [];
const sofaErrors = [];

for (const tid of tournamentIds) {
  try {
    const data = await fetchSofaSeasons(tid);
    const seasons = data?.seasons || data?.uniqueTournamentSeasons || data?.data || [];
    const latest = pickLatestSeason(seasons);

    for (const [footyId, meta] of sofaTargets) {
      if (meta.sofaTournament !== tid) continue;
      const latestSeasonId = latest?.id;
      if (latestSeasonId && latestSeasonId !== meta.sofaSeason) {
        sofaUpdates.push({
          name: meta.name,
          footyId: Number(footyId),
          tournamentId: tid,
          oldSeason: meta.sofaSeason,
          newSeason: latestSeasonId,
          seasonName: latest?.name || latest?.year,
        });
      } else if (latestSeasonId === meta.sofaSeason) {
        sofaUnchanged.push({
          name: meta.name,
          footyId: Number(footyId),
          tournamentId: tid,
          season: meta.sofaSeason,
        });
      }
    }
  } catch (err) {
    sofaErrors.push({ tournamentId: tid, error: err.message });
    console.error(`SofaScore error for tournament ${tid}:`, err.message);
  }
}

console.log(`\nSofaScore API calls: ${sofaCalls}`);
console.log("\n=== SOFASCORE SEASON COMPARISON ===");
console.log("Updates needed:", sofaUpdates.length);
console.log(JSON.stringify(sofaUpdates, null, 2));
console.log("Unchanged:", sofaUnchanged.length);
console.log("Errors:", sofaErrors.length);

const summary = {
  footyUpdates,
  footyUnchanged,
  footyUnmatched,
  sofaUpdates,
  sofaUnchanged,
  sofaErrors,
  footyCalls,
  sofaCalls,
};
console.log("\n=== SUMMARY JSON ===");
console.log(JSON.stringify(summary, null, 2));

writeFileSync(resolve(__dirname, "competition-id-check-result.json"), JSON.stringify(summary, null, 2));
writeFileSync(
  resolve(__dirname, "footy-league-list.json"),
  JSON.stringify(
    leagues.map((l) => ({
      id: l.id,
      name: l.name,
      english_name: l.english_name,
      seasons: getSeasons(l).map((s) => ({ id: s.id, year: s.year })),
    })),
    null,
    2
  )
);
console.log("\nWrote scripts/competition-id-check-result.json");

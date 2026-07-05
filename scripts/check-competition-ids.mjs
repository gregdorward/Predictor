#!/usr/bin/env node
/**
 * One-off checker for FootyStats season IDs and SofaScore season IDs.
 * Loads API keys from footballServer/.env — does not print keys.
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

// Current FootyStats season IDs from footyStatsToSofaScore.js (keys)
const CURRENT = {
  15050: { name: "Premier League", sofaTournament: 17, sofaSeason: 76986 },
  16494: { name: "World Cup 2026", sofaTournament: 16, sofaSeason: 58210 },
  14930: { name: "Championship", sofaTournament: 18, sofaSeason: 77347 },
  14934: { name: "League One", sofaTournament: 24, sofaSeason: 77352 },
  14935: { name: "League Two", sofaTournament: 25, sofaSeason: 77351 },
  15657: { name: "National League", sofaTournament: 173, sofaSeason: 78229 },
  15845: { name: "National League North", sofaTournament: 176, sofaSeason: 78282 },
  15844: { name: "National League South", sofaTournament: 174, sofaSeason: 78227 },
  14968: { name: "Bundesliga", sofaTournament: 35, sofaSeason: 77333 },
  14956: { name: "La Liga", sofaTournament: 8, sofaSeason: 77559 },
  15000: { name: "Scottish Premiership", sofaTournament: 36, sofaSeason: 77128 },
  14924: { name: "Champions League", sofaTournament: 7, sofaSeason: 76953 },
  15068: { name: "Serie A", sofaTournament: 23, sofaSeason: 76457 },
  16504: { name: "MLS", sofaTournament: 242, sofaSeason: 86668 },
  14932: { name: "Ligue 1", sofaTournament: 34, sofaSeason: 77356 },
  15115: { name: "Primeira Liga", sofaTournament: 238, sofaSeason: 77806 },
  16556: { name: "Copa Libertadores", sofaTournament: 384, sofaSeason: 87760 },
  14936: { name: "Eredivisie", sofaTournament: 37, sofaSeason: 77012 },
  14937: { name: "Belgian Pro League", sofaTournament: 9, sofaSeason: 77849 },
  16263: { name: "Allsvenskan", sofaTournament: 40, sofaSeason: 69956 },
  15055: { name: "Danish Superliga", sofaTournament: 39, sofaSeason: 76491 },
  16558: { name: "Eliteserien", sofaTournament: 20, sofaSeason: 87809 },
  14923: { name: "Austrian Bundesliga", sofaTournament: 45, sofaSeason: 77382 },
  15163: { name: "Greek Super League", sofaTournament: 185, sofaSeason: 78175 },
  14972: { name: "Turkish Super Lig", sofaTournament: 52, sofaSeason: 78175 },
  15031: { name: "Ekstraklasa", sofaTournament: 202, sofaSeason: 76477 },
  15066: { name: "Segunda Division", sofaTournament: 54, sofaSeason: 77558 },
  14931: { name: "Bundesliga 2", sofaTournament: 44, sofaSeason: 77354 },
  14977: { name: "3. Liga", sofaTournament: 491, sofaSeason: 346654 },
  14954: { name: "Ligue 2", sofaTournament: 182, sofaSeason: 77357 },
  15632: { name: "Serie B", sofaTournament: 53, sofaSeason: 79502 },
  14987: { name: "Eerste Divisie", sofaTournament: 131, sofaSeason: 14987 },
  15061: { name: "Scottish Championship", sofaTournament: 206, sofaSeason: 77037 },
  15062: { name: "Scottish League One", sofaTournament: 207, sofaSeason: 77037 },
  15064: { name: "Scottish League Two", sofaTournament: 209, sofaSeason: 77045 },
  15047: { name: "Swiss Super League", sofaTournament: 215, sofaSeason: 77152 },
  15053: { name: "Croatian First League", sofaTournament: 170, sofaSeason: 77152 },
  14973: { name: "Czech First League", sofaTournament: 172, sofaSeason: 77019 },
  14089: { name: "Veikkausliiga", sofaTournament: 41, sofaSeason: 70853 },
  14951: { name: "Ukrainian Premier League", sofaTournament: 218, sofaSeason: 77625 },
  15063: { name: "Slovenian Prva Liga", sofaTournament: 212, sofaSeason: 62660 },
  14933: { name: "Slovak Super Liga", sofaTournament: 211, sofaSeason: 77154 },
  15065: { name: "Serbian SuperLiga", sofaTournament: 210, sofaSeason: 77625 },
  15234: { name: "Liga MX", sofaTournament: 11621, sofaSeason: 76500 },
  16544: { name: "Brazil Serie A", sofaTournament: 325, sofaSeason: 87678 },
  14305: { name: "Brazil Serie B", sofaTournament: 390, sofaSeason: 72603 },
  13878: { name: "Club World Cup", sofaTournament: 357, sofaSeason: 69619 },
  13734: { name: "UEFA Nations League", sofaTournament: 10783, sofaSeason: 58337 },
  14086: { name: "Colombian Liga BetPlay", sofaTournament: 11539, sofaSeason: 70681 },
  14116: { name: "Chilean Primera Division", sofaTournament: 11653, sofaSeason: 76986 },
  14626: { name: "Uruguayan Primera Division", sofaTournament: 278, sofaSeason: 71306 },
  16571: { name: "Argentina Primera Division", sofaTournament: 155, sofaSeason: 87913 },
  16614: { name: "Colombian Primera Division", sofaTournament: 11539, sofaSeason: 87913 },
  16242: { name: "J League", sofaTournament: 196, sofaSeason: 69871 },
  16627: { name: "K League", sofaTournament: 410, sofaSeason: 88606 },
  12772: { name: "Saudi Pro League", sofaTournament: 955, sofaSeason: 63998 },
  13967: { name: "USL", sofaTournament: 13363, sofaSeason: 70263 },
  13964: { name: "World Cup Europe Qualifiers", sofaTournament: 11, sofaSeason: 69427 },
  10121: { name: "World Cup SA Qualifiers", sofaTournament: 295, sofaSeason: 53820 },
  16537: { name: "Irish Premier Division", sofaTournament: 192, sofaSeason: 87682 },
  16036: { name: "A-League", sofaTournament: 136, sofaSeason: 82603 },
  15002: { name: "Europa League", sofaTournament: 679, sofaSeason: 76984 },
  14904: { name: "Europa Conference League", sofaTournament: 17015, sofaSeason: 76960 },
};

// Also track App.js leagueOrder extras
const EXTRA_APP_IDS = { 16808: "Nations League (App.js only)" };

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
  if (!res.ok) throw new Error(`SofaScore get-seasons HTTP ${res.status} for tournament ${tournamentId}`);
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
  // SofaScore returns seasons newest-first in the array.
  return seasons[0];
}

function getSeasons(league) {
  return league?.season || league?.seasons || [];
}

function pickLatestFootySeason(seasons) {
  if (!seasons.length) return null;
  // FootyStats seasons are typically ordered; pick highest id as newest.
  return seasons.reduce((a, b) => (Number(b.id) > Number(a?.id || 0) ? b : a), null);
}

function findLeagueMatch(leagues, currentId, meta) {
  // 1) Exact match: current season id still exists in API
  for (const league of leagues) {
    for (const s of getSeasons(league)) {
      if (Number(s.id) === Number(currentId)) {
        const latest = pickLatestFootySeason(getSeasons(league));
        return { league, matchedSeason: s, latestSeason: latest, matchType: "exact-season-id" };
      }
    }
  }

  // 2) Name match: find league by english/name, then take latest season
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
    if (!best || score > best.score || (score === best.score && Number(latest.id) > Number(best.latestSeason.id))) {
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

  if (latestId && latestId !== Number(currentId)) {
    footyUpdates.push({
      name: meta.name,
      oldId: Number(currentId),
      newId: latestId,
      leagueName: match.league?.name || match.league?.english_name,
      matchType: match.matchType,
    });
  } else {
    footyUnchanged.push({ id: Number(currentId), name: meta.name });
  }
}

console.log("\n=== FOOTYSTATS COMPARISON ===");
console.log("Updates needed:", footyUpdates.length);
console.log(JSON.stringify(footyUpdates, null, 2));
console.log("Unchanged:", footyUnchanged.length);
console.log("Unmatched:", footyUnmatched.length);
console.log(JSON.stringify(footyUnmatched, null, 2));

// SofaScore: dedupe tournament IDs
const tournamentIds = [...new Set(Object.values(CURRENT).map((m) => m.sofaTournament))];
const sofaSeasonCache = new Map();
const sofaUpdates = [];
const sofaUnchanged = [];

for (const tid of tournamentIds) {
  try {
    const data = await fetchSofaSeasons(tid);
    const seasons = data?.seasons || data?.uniqueTournamentSeasons || data?.data || [];
    const latest = pickLatestSeason(seasons);
    sofaSeasonCache.set(tid, { seasons, latest });

    // Find all footy entries using this tournament
    for (const [footyId, meta] of Object.entries(CURRENT)) {
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
    console.error(`SofaScore error for tournament ${tid}:`, err.message);
  }
}

console.log(`\nSofaScore API calls: ${sofaCalls}`);
console.log("\n=== SOFASCORE SEASON COMPARISON ===");
console.log("Updates needed:", sofaUpdates.length);
console.log(JSON.stringify(sofaUpdates, null, 2));
console.log("Unchanged:", sofaUnchanged.length);

// Output machine-readable summary for next step
console.log("\n=== SUMMARY JSON ===");
const summary = { footyUpdates, footyUnchanged, footyUnmatched, sofaUpdates, sofaUnchanged, footyCalls, sofaCalls };
console.log(JSON.stringify(summary, null, 2));

writeFileSync(resolve(__dirname, "competition-id-check-result.json"), JSON.stringify(summary, null, 2));
writeFileSync(
  resolve(__dirname, "footy-league-list.json"),
  JSON.stringify(leagues.map((l) => ({
    id: l.id,
    name: l.name,
    english_name: l.english_name,
    seasons: getSeasons(l).map((s) => ({ id: s.id, year: s.year })),
  })), null, 2)
);
console.log("\nWrote scripts/competition-id-check-result.json");

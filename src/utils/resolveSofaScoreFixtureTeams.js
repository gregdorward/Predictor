import { apiGetUrl } from "./apiUrl";
import { applyNationalTeamAlias } from "./nationalTeamAliases";
import { findSofaScoreGameByTeams } from "./sofaScoreMatch";

function formatDateForApi(unixTimestamp) {
  const d = new Date(unixTimestamp * 1000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Keys must be normalize()-d (lowercase, no spaces/punctuation). */
const TEAM_NAME_ALIASES = {
  psg: "Paris saint-germain",
  fkbodoglimt: "Bodø/Glimt",
  bodoglimt: "Bodø/Glimt",
  intermilan: "inter",
  acmilan: "milan",
  manutd: "manchester united",
  manunited: "manchester united",
  mancity: "manchester city",
  bayern: "bayern munich",
  montrealimpact: "cf montreal",
  botafogo: "botafogo",
};

function normalize(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z]/g, "");
}

function stripClubAffixes(normalized) {
  return normalized
    .replace(/^(fk|fc|bk|afc|cf|ac|cd|sv|ss)/, "")
    .replace(/(fk|fc|bk|afc|cf|ac|cd|sv|ss)$/, "");
}

function removeCommonSuffixes(str) {
  return str.replace(
    /\b(fc|fk|bk|sc|afc|cf|ac|cd|sv|ss|united|city|sporting|club|team|U 20| U 19)\b/g,
    ""
  );
}

function cleanTeamName(str) {
  return stripClubAffixes(removeCommonSuffixes(normalize(str)));
}

export function getMappedTeamName(name) {
  const aliasKey = normalize(name);
  const mapped =
    TEAM_NAME_ALIASES[aliasKey] ||
    TEAM_NAME_ALIASES[stripClubAffixes(aliasKey)] ||
    applyNationalTeamAlias(aliasKey) ||
    name;
  return cleanTeamName(mapped);
}

function isYouthOrReserveTeam(name) {
  const lowered = String(name).toLowerCase();
  return (
    lowered.endsWith(" u23") ||
    lowered.endsWith(" u21") ||
    lowered.endsWith(" u20") ||
    lowered.endsWith(" u19") ||
    lowered.endsWith(" b") ||
    lowered.endsWith(" ii")
  );
}

async function fetchScheduledEventsForDate(unixTimestamp) {
  const dateStr = formatDateForApi(unixTimestamp);
  const response = await fetch(apiGetUrl(`scheduledEvents/${dateStr}`));
  if (!response.ok) {
    return [];
  }

  const games = await response.json();
  if (!Array.isArray(games)) {
    return [];
  }

  return games
    .filter((game) => {
      const homeName = game.homeTeam || "";
      const awayName = game.awayTeam || "";
      if (isYouthOrReserveTeam(homeName) || isYouthOrReserveTeam(awayName)) {
        return false;
      }
      if (game.homeId === 5543 || game.awayId === 5543) {
        return false;
      }
      return true;
    })
    .map((game) => ({
      homeTeam: game.homeTeam,
      homeId: game.homeId ?? null,
      awayTeam: game.awayTeam,
      awayId: game.awayId ?? null,
      id: game.id,
    }));
}

function teamsMatch(left, right) {
  if (!left || !right) {
    return false;
  }

  return left === right || left.includes(right) || right.includes(left);
}

/**
 * Map SofaScore home/away ids onto FootyStats fixture orientation.
 * Single-side fallbacks can match a game where teams are swapped vs FootyStats.
 */
export function mapSofaTeamIdsToFixture(game, footyHomeTeam, footyAwayTeam) {
  if (!game) {
    return null;
  }

  const mappedFootyHome = getMappedTeamName(footyHomeTeam);
  const mappedFootyAway = getMappedTeamName(footyAwayTeam);
  const sofaHomeMapped = getMappedTeamName(game.homeTeam);
  const sofaAwayMapped = getMappedTeamName(game.awayTeam);

  let homeId = null;
  let awayId = null;

  if (teamsMatch(sofaHomeMapped, mappedFootyHome)) {
    homeId = game.homeId ?? null;
  } else if (teamsMatch(sofaAwayMapped, mappedFootyHome)) {
    homeId = game.awayId ?? null;
  }

  if (teamsMatch(sofaAwayMapped, mappedFootyAway)) {
    awayId = game.awayId ?? null;
  } else if (teamsMatch(sofaHomeMapped, mappedFootyAway)) {
    awayId = game.homeId ?? null;
  }

  return { ...game, homeId, awayId };
}

function findBySide(games, teamName, side) {
  const normalizedSearch = getMappedTeamName(teamName);
  const key = side === "home" ? "homeTeam" : "awayTeam";

  const exactMatch = games.find(
    (game) => getMappedTeamName(game[key]) === normalizedSearch
  );
  if (exactMatch) return exactMatch;

  return (
    games.find((game) => {
      const mapped = getMappedTeamName(game[key]);
      return (
        mapped.includes(normalizedSearch) || normalizedSearch.includes(mapped)
      );
    }) || null
  );
}

/**
 * Resolve industry leading stat website team IDs for a fixture (same lookup path as GameStats).
 * Prefer a home+away pair match, then fall back to single-side matches.
 */
export async function resolveSofaScoreFixtureTeams(match) {
  if (!match?.homeTeam || !match?.awayTeam || !match?.date) {
    return null;
  }

  const scheduledGames = await fetchScheduledEventsForDate(match.date);
  if (!scheduledGames.length) {
    return null;
  }

  let matched = findSofaScoreGameByTeams(
    scheduledGames,
    match.homeTeam,
    match.awayTeam,
    getMappedTeamName
  );

  if (!matched) {
    matched = findBySide(scheduledGames, match.homeTeam, "home");
  }
  if (!matched) {
    matched = findBySide(scheduledGames, match.awayTeam, "away");
  }
  if (!matched) {
    matched = findBySide(scheduledGames, match.homeTeam, "away");
  }
  if (!matched) {
    matched = findBySide(scheduledGames, match.awayTeam, "home");
  }

  return mapSofaTeamIdsToFixture(matched, match.homeTeam, match.awayTeam);
}

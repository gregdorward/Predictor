import { apiGetUrl } from "./apiUrl";
import { applyNationalTeamAlias } from "./nationalTeamAliases";
import { findSofaScoreGameByTeams } from "./sofaScoreMatch";
import { formatDateForApi } from "../logic/buildSingleMatch";

const TEAM_NAME_ALIASES = {
  psg: "Paris saint-germain",
  "FK Bodo - Glimt": "Bodø/Glimt",
  "inter milan": "inter",
  "ac milan": "milan",
  "man utd": "manchester united",
  "man united": "manchester united",
  "man city": "manchester city",
  bayern: "bayern munich",
  "montreal impact": "cf montreal",
  botafogo: "botafogo",
  "fk bodo - glimt": "Bodø/Glimt",
};

function normalize(str) {
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[^a-z]/g, "");
}

function removeCommonSuffixes(str) {
  return str.replace(
    /\b(fc|bk|sc|afc|cf|ac|cd|sv|ss|united|city|sporting|club|team|U 20| U 19)\b/g,
    ""
  );
}

function cleanTeamName(str) {
  return removeCommonSuffixes(normalize(str));
}

function getMappedTeamName(name) {
  const aliasKey = normalize(name);
  const mapped = TEAM_NAME_ALIASES[aliasKey] || applyNationalTeamAlias(aliasKey);
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

/**
 * Resolve industry leading stat website team IDs for a fixture (same lookup path as GameStats).
 */
export async function resolveSofaScoreFixtureTeams(match) {
  if (!match?.homeTeam || !match?.awayTeam || !match?.date) {
    return null;
  }

  const scheduledGames = await fetchScheduledEventsForDate(match.date);
  if (!scheduledGames.length) {
    return null;
  }

  return findSofaScoreGameByTeams(
    scheduledGames,
    match.homeTeam,
    match.awayTeam,
    getMappedTeamName
  );
}

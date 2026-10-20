import bundesliga from "./bundesliga.json";
import championship from "./championship.json";
import laLiga from "./la-liga.json";
import premierLeague from "./premier-league.json";
import serieA from "./serie-a.json";

const NOTES_BY_SLUG = {
  "premier-league": premierLeague,
  championship,
  "la-liga": laLiga,
  "serie-a": serieA,
  bundesliga,
};

export function getCompetitionSeasonNote(slug) {
  return NOTES_BY_SLUG[slug] || null;
}

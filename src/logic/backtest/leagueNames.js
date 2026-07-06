import { COMPETITION_CATALOG } from "../../seo/competitionCatalog.js";

const nameById = new Map(
  COMPETITION_CATALOG.map((entry) => [entry.id, entry.name])
);

export function getLeagueName(competitionId, fixture) {
  return (
    nameById.get(competitionId) ||
    fixture?.competition_name ||
    fixture?.league_name ||
    `League ${competitionId}`
  );
}

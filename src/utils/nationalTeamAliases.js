// Keys use the same compact format as GameStats.normalize (lowercase, no spaces/punctuation).
const NATIONAL_TEAM_ALIASES = {
  usa: "united states",
  unitedstatesofamerica: "united states",
  korearepublic: "south korea",
  republicofkorea: "south korea",
  koreadpr: "north korea",
  democraticpeoplesrepublicofkorea: "north korea",
  cotedivoire: "ivory coast",
  czechrepublic: "czechia",
  bosniaherzegovina: "bosnia and herzegovina",
  condr: "dr congo",
  democraticrepublicofthecongo: "dr congo",
  republicofireland: "ireland",
  iriran: "iran",
  turkiye: "turkey",
  capeverdeislands: "cape verde",
  curacao: "curacao",
};

/**
 * Map industry stat website national-team labels where they differ.
 */
export function applyNationalTeamAlias(normalizedKey) {
  if (!normalizedKey) {
    return normalizedKey;
  }

  const key = String(normalizedKey).toLowerCase().trim();
  return NATIONAL_TEAM_ALIASES[key] || normalizedKey;
}

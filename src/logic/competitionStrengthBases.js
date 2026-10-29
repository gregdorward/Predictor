/**
 * Competition starting levels for strength rankings.
 *
 * Figures are ClubElo's published division averages (⌀) from the ranking page
 * dated 28 Oct 2026 (https://clubelo.com/Ranking). They are pinned here and
 * are not refetched: a daily pull would chase ClubElo's full-history Elo on
 * top of the last-six score.
 *
 * Opta's July 2026 league power rankings agree on the order (Premier League
 * clear, the other big four bunched, the Championship level with several
 * European top flights) but are not the stored scale.
 *
 * Divisions ClubElo barely lists step down 100 points from the division
 * above, the usual gap between adjacent English tiers:
 * National League, National League North/South, the Scottish lower leagues,
 * and 3. Liga.
 *
 * La Liga is then drawn 85% of the way from that ClubElo average toward the
 * Premier League. Ligue 1, Serie A and the Bundesliga are drawn 80%. Brazil
 * Serie A is drawn 70%. Every other division is drawn 65%. `clubElo` keeps
 * the published figure. `base` is the number the ranking starts from.
 */

/** Share of the gap to the Premier League closed for named leagues. */
export const NAMED_LEAGUE_PULLS = {
  "la-liga": 0.85,
  "ligue-1": 0.8,
  "serie-a": 0.8,
  "bundesliga": 0.8,
  "brazil-serie-a": 0.7,
};

/** Share of the gap closed for every division without a named pull. */
export const OTHER_LEAGUE_PULL = 0.65;

/** @typedef {{ id: number, slug: string, name: string, base: number, clubElo?: number, source: "clubelo" | "step-down" }} StrengthLeague */

/** @type {StrengthLeague[]} Domestic leagues in homepage leagueOrder. `base` is ClubElo until the pull below. */
const CLUB_ELO_LEAGUES = [
  { id: 17146, slug: "premier-league", name: "Premier League", base: 1838, source: "clubelo" },
  { id: 17184, slug: "championship", name: "Championship", base: 1610, source: "clubelo" },
  { id: 17180, slug: "league-one", name: "League One", base: 1493, source: "clubelo" },
  { id: 17185, slug: "league-two", name: "League Two", base: 1389, source: "clubelo" },
  { id: 17279, slug: "national-league", name: "National League", base: 1289, source: "step-down" },
  { id: 17263, slug: "national-league-north", name: "National League North", base: 1189, source: "step-down" },
  { id: 17403, slug: "national-league-south", name: "National League South", base: 1189, source: "step-down" },
  { id: 17199, slug: "la-liga", name: "La Liga", base: 1766, source: "clubelo" },
  { id: 17148, slug: "scottish-premiership", name: "Scottish Premiership", base: 1455, source: "clubelo" },
  { id: 17210, slug: "bundesliga", name: "Bundesliga", base: 1752, source: "clubelo" },
  { id: 17084, slug: "serie-a", name: "Serie A", base: 1739, source: "clubelo" },
  { id: 17102, slug: "ligue-1", name: "Ligue 1", base: 1714, source: "clubelo" },
  // ClubElo's Portugal level-1 list mixes a few clubs from below the Primeira
  // Liga, so 1596 is a slightly soft published average. Kept as published
  // because we do not ship that roster to re-average against the current squad.
  { id: 17217, slug: "primeira-liga", name: "Primeira Liga", base: 1596, source: "clubelo" },
  { id: 17097, slug: "eredivisie", name: "Eredivisie", base: 1561, source: "clubelo" },
  { id: 17171, slug: "belgian-pro-league", name: "Belgian Pro League", base: 1613, source: "clubelo" },
  { id: 16576, slug: "allsvenskan", name: "Allsvenskan", base: 1506, source: "clubelo" },
  { id: 17091, slug: "danish-superliga", name: "Danish Superliga", base: 1551, source: "clubelo" },
  { id: 16558, slug: "eliteserien", name: "Eliteserien", base: 1523, source: "clubelo" },
  { id: 17181, slug: "austrian-bundesliga", name: "Austrian Bundesliga", base: 1526, source: "clubelo" },
  { id: 17356, slug: "greek-super-league", name: "Greek Super League", base: 1523, source: "clubelo" },
  { id: 17265, slug: "turkish-super-lig", name: "Turkish Super Lig", base: 1607, source: "clubelo" },
  { id: 17112, slug: "ekstraklasa", name: "Ekstraklasa", base: 1540, source: "clubelo" },
  { id: 17129, slug: "swiss-super-league", name: "Swiss Super League", base: 1538, source: "clubelo" },
  { id: 17087, slug: "croatian-first-league", name: "Croatian First League", base: 1466, source: "clubelo" },
  { id: 17157, slug: "czech-first-league", name: "Czech First League", base: 1515, source: "clubelo" },
  { id: 16537, slug: "irish-premier-division", name: "Irish Premier Division", base: 1377, source: "clubelo" },
  { id: 17269, slug: "segunda-division", name: "Segunda Division", base: 1623, source: "clubelo" },
  { id: 17404, slug: "serie-b", name: "Serie B", base: 1542, source: "clubelo" },
  { id: 17212, slug: "bundesliga-2", name: "2. Bundesliga", base: 1590, source: "clubelo" },
  { id: 17267, slug: "3-liga", name: "3. Liga", base: 1490, source: "step-down" },
  { id: 17117, slug: "ligue-2", name: "Ligue 2", base: 1540, source: "clubelo" },
  { id: 17110, slug: "eerste-divisie", name: "Eerste Divisie", base: 1316, source: "clubelo" },
  { id: 17144, slug: "scottish-championship", name: "Scottish Championship", base: 1355, source: "step-down" },
  { id: 17147, slug: "scottish-league-one", name: "Scottish League One", base: 1255, source: "step-down" },
  { id: 17140, slug: "scottish-league-two", name: "Scottish League Two", base: 1155, source: "step-down" },
  { id: 16504, slug: "mls", name: "MLS", base: 1581, source: "clubelo" },
  { id: 16544, slug: "brazil-serie-a", name: "Brazil Serie A", base: 1717, source: "clubelo" },
  { id: 16571, slug: "argentina-primera-division", name: "Argentina Primera Division", base: 1668, source: "clubelo" },
  { id: 17099, slug: "liga-mx", name: "Liga MX", base: 1605, source: "clubelo" },
  { id: 16614, slug: "colombian-primera-division", name: "Colombian Primera Division", base: 1580, source: "clubelo" },
  { id: 17326, slug: "a-league", name: "A-League", base: 1430, source: "clubelo" },
  { id: 16627, slug: "k-league", name: "K League", base: 1534, source: "clubelo" },
  { id: 17115, slug: "j-league", name: "J League", base: 1589, source: "clubelo" },
  { id: 17426, slug: "saudi-pro-league", name: "Saudi Pro League", base: 1475, source: "clubelo" },
];

const PREMIER_BASE = CLUB_ELO_LEAGUES.find((league) => league.slug === "premier-league").base;

/** @type {StrengthLeague[]} */
export const DOMESTIC_STRENGTH_LEAGUES = CLUB_ELO_LEAGUES.map((league) => {
  const clubElo = league.base;
  if (league.slug === "premier-league") return { ...league, clubElo };
  const pull = NAMED_LEAGUE_PULLS[league.slug] ?? OTHER_LEAGUE_PULL;
  return {
    ...league,
    clubElo,
    base: Math.round(clubElo + pull * (PREMIER_BASE - clubElo)),
  };
});

/** Cross-border competitions whose matches can move a global rating when both clubs resolve. */
export const CONTINENTAL_STRENGTH_LEAGUES = [
  { id: 17128, slug: "champions-league", name: "Champions League" },
  { id: 17127, slug: "europa-league", name: "Europa League" },
  { id: 17130, slug: "europa-conference-league", name: "Europa Conference League" },
  { id: 16556, slug: "copa-libertadores", name: "Copa Libertadores" },
  { id: 16808, slug: "uefa-nations-league", name: "UEFA Nations League" },
];

const domesticById = new Map(
  DOMESTIC_STRENGTH_LEAGUES.map((league) => [league.id, league])
);

export function getDomesticStrengthLeague(id) {
  const numericId = Number(id);
  return domesticById.get(numericId) ?? null;
}

export function isContinentalStrengthLeague(id) {
  const numericId = Number(id);
  return CONTINENTAL_STRENGTH_LEAGUES.some((league) => league.id === numericId);
}

/** Domestic slug to the country whose pyramid it belongs in. */
const COUNTRY_BY_SLUG = {
  "premier-league": "England",
  championship: "England",
  "league-one": "England",
  "league-two": "England",
  "national-league": "England",
  "national-league-north": "England",
  "national-league-south": "England",
  "la-liga": "Spain",
  "segunda-division": "Spain",
  "scottish-premiership": "Scotland",
  "scottish-championship": "Scotland",
  "scottish-league-one": "Scotland",
  "scottish-league-two": "Scotland",
  bundesliga: "Germany",
  "bundesliga-2": "Germany",
  "3-liga": "Germany",
  "serie-a": "Italy",
  "serie-b": "Italy",
  "ligue-1": "France",
  "ligue-2": "France",
  "primeira-liga": "Portugal",
  eredivisie: "Netherlands",
  "eerste-divisie": "Netherlands",
  "belgian-pro-league": "Belgium",
  allsvenskan: "Sweden",
  "danish-superliga": "Denmark",
  eliteserien: "Norway",
  "austrian-bundesliga": "Austria",
  "greek-super-league": "Greece",
  "turkish-super-lig": "Turkey",
  ekstraklasa: "Poland",
  "swiss-super-league": "Switzerland",
  "croatian-first-league": "Croatia",
  "czech-first-league": "Czechia",
  "irish-premier-division": "Ireland",
  mls: "United States",
  "brazil-serie-a": "Brazil",
  "argentina-primera-division": "Argentina",
  "liga-mx": "Mexico",
  "colombian-primera-division": "Colombia",
  "a-league": "Australia",
  "k-league": "South Korea",
  "j-league": "Japan",
  "saudi-pro-league": "Saudi Arabia",
};

export function countryForStrengthLeague(league) {
  if (league?.country) return league.country;
  return COUNTRY_BY_SLUG[league?.slug] || null;
}

/**
 * Stack a country's leagues by base, highest division first.
 * Countries themselves are ordered by their strongest base.
 */
export function groupDomesticLeagues(leagues) {
  const byCountry = new Map();
  for (const league of leagues || []) {
    const country = countryForStrengthLeague(league);
    if (!country) continue;
    if (!byCountry.has(country)) byCountry.set(country, []);
    byCountry.get(country).push(league);
  }

  return [...byCountry.entries()]
    .map(([country, rows]) => ({
      country,
      base: Math.max(...rows.map((row) => Number(row.base) || 0)),
      leagues: [...rows].sort(
        (a, b) =>
          Number(b.base) - Number(a.base) ||
          String(a.name).localeCompare(String(b.name))
      ),
    }))
    .sort((a, b) => b.base - a.base || a.country.localeCompare(b.country));
}

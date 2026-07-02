import { footyStatsToSofaScoreMap } from "../constants/footyStatsToSofaScore";

/** @type {{ id: number, slug: string, name: string }[]} */
export const COMPETITION_CATALOG = [
  { id: 15050, slug: "premier-league", name: "Premier League" },
  { id: 16494, slug: "world-cup-2026", name: "World Cup 2026" },
  { id: 14930, slug: "championship", name: "Championship" },
  { id: 14934, slug: "league-one", name: "League One" },
  { id: 14935, slug: "league-two", name: "League Two" },
  { id: 15657, slug: "national-league", name: "National League" },
  { id: 15845, slug: "national-league-north", name: "National League North" },
  { id: 15844, slug: "national-league-south", name: "National League South" },
  { id: 14968, slug: "bundesliga", name: "Bundesliga" },
  { id: 14956, slug: "la-liga", name: "La Liga" },
  { id: 15000, slug: "scottish-premiership", name: "Scottish Premiership" },
  { id: 14924, slug: "champions-league", name: "Champions League" },
  { id: 15068, slug: "serie-a", name: "Serie A" },
  { id: 16504, slug: "mls", name: "MLS" },
  { id: 14932, slug: "ligue-1", name: "Ligue 1" },
  { id: 15115, slug: "primeira-liga", name: "Primeira Liga" },
  { id: 16556, slug: "copa-libertadores", name: "Copa Libertadores" },
  { id: 14936, slug: "eredivisie", name: "Eredivisie" },
  { id: 14937, slug: "belgian-pro-league", name: "Belgian Pro League" },
  { id: 16263, slug: "allsvenskan", name: "Allsvenskan" },
  { id: 15055, slug: "danish-superliga", name: "Danish Superliga" },
  { id: 16558, slug: "eliteserien", name: "Eliteserien" },
  { id: 14923, slug: "austrian-bundesliga", name: "Austrian Bundesliga" },
  { id: 15163, slug: "greek-super-league", name: "Greek Super League" },
  { id: 14972, slug: "turkish-super-lig", name: "Turkish Super Lig" },
  { id: 15031, slug: "ekstraklasa", name: "Ekstraklasa" },
  { id: 15066, slug: "segunda-division", name: "Segunda Division" },
  { id: 14931, slug: "bundesliga-2", name: "Bundesliga 2" },
  { id: 14977, slug: "3-liga", name: "3. Liga" },
  { id: 14954, slug: "ligue-2", name: "Ligue 2" },
  { id: 15632, slug: "serie-b", name: "Serie B" },
  { id: 14987, slug: "eerste-divisie", name: "Eerste Divisie" },
  { id: 15061, slug: "scottish-championship", name: "Scottish Championship" },
  { id: 15062, slug: "scottish-league-one", name: "Scottish League One" },
  { id: 15064, slug: "scottish-league-two", name: "Scottish League Two" },
  { id: 15047, slug: "swiss-super-league", name: "Swiss Super League" },
  { id: 15053, slug: "croatian-first-league", name: "Croatian First League" },
  { id: 14973, slug: "czech-first-league", name: "Czech First League" },
  { id: 14089, slug: "veikkausliiga", name: "Veikkausliiga" },
  { id: 14951, slug: "ukrainian-premier-league", name: "Ukrainian Premier League" },
  { id: 15063, slug: "slovenian-prva-liga", name: "Slovenian Prva Liga" },
  { id: 14933, slug: "slovak-super-liga", name: "Slovak Super Liga" },
  { id: 15065, slug: "serbian-superliga", name: "Serbian SuperLiga" },
  { id: 15234, slug: "liga-mx", name: "Liga MX" },
  { id: 16544, slug: "brazil-serie-a", name: "Brazil Serie A" },
  { id: 14305, slug: "brazil-serie-b", name: "Brazil Serie B" },
  { id: 13878, slug: "club-world-cup", name: "Club World Cup" },
  { id: 13734, slug: "uefa-nations-league", name: "UEFA Nations League" },
  { id: 14086, slug: "colombian-liga-betplay", name: "Colombian Liga BetPlay" },
  { id: 14116, slug: "chilean-primera-division", name: "Chilean Primera Division" },
  { id: 14626, slug: "uruguayan-primera-division", name: "Uruguayan Primera Division" },
  { id: 16571, slug: "argentina-primera-division", name: "Argentina Primera Division" },
  { id: 16614, slug: "colombian-primera-division", name: "Colombian Primera Division" },
  { id: 16242, slug: "j-league", name: "J League" },
  { id: 16627, slug: "k-league", name: "K League" },
  { id: 12772, slug: "saudi-pro-league", name: "Saudi Pro League" },
  { id: 13967, slug: "usl", name: "USL" },
  { id: 13964, slug: "world-cup-europe-qualifiers", name: "World Cup Europe Qualifiers" },
  { id: 10121, slug: "world-cup-south-america-qualifiers", name: "World Cup South America Qualifiers" },
  { id: 16537, slug: "irish-premier-division", name: "Irish Premier Division" },
  { id: 16036, slug: "a-league", name: "A-League" },
  { id: 15002, slug: "europa-league", name: "Europa League" },
  { id: 14904, slug: "europa-conference-league", name: "Europa Conference League" },
];

export const FEATURED_COMPETITION_SLUGS = [
  "premier-league",
  "la-liga",
  "serie-a",
  "bundesliga",
  "ligue-1",
  "championship",
  "champions-league",
  "world-cup-2026",
];

const byId = new Map(COMPETITION_CATALOG.map((entry) => [entry.id, entry]));
const bySlug = new Map(COMPETITION_CATALOG.map((entry) => [entry.slug, entry]));

export function getCompetitionById(id) {
  return byId.get(Number(id)) ?? null;
}

export function getCompetitionBySlug(slug) {
  return bySlug.get(String(slug).toLowerCase()) ?? null;
}

export function getFeaturedCompetitions(excludeSlug = null) {
  return FEATURED_COMPETITION_SLUGS.map((slug) => getCompetitionBySlug(slug)).filter(
    (entry) => entry && entry.slug !== excludeSlug
  );
}

export function getCompetitionUrl(seasonIdOrSlug) {
  const byIdEntry = getCompetitionById(seasonIdOrSlug);
  if (byIdEntry) return `/competition/${byIdEntry.slug}/`;
  const bySlugEntry = getCompetitionBySlug(seasonIdOrSlug);
  if (bySlugEntry) return `/competition/${bySlugEntry.slug}/`;
  return `/competition/${seasonIdOrSlug}/`;
}

export function isKnownCompetitionId(id) {
  return footyStatsToSofaScoreMap[Number(id)] != null;
}

export function resolveCompetitionParam(param) {
  if (/^\d+$/.test(String(param))) {
    return { seasonId: String(param), catalog: getCompetitionById(param) };
  }
  const catalog = getCompetitionBySlug(param);
  if (!catalog) return null;
  return { seasonId: String(catalog.id), catalog };
}

export function buildCompetitionMeta(data, catalog) {
  const name = data?.english_name || data?.name || catalog?.name || "Competition";
  return {
    title: `${name} Betting Stats | SoccerStatsHub`,
    description: `BTTS, Over 2.5, goals, corners and card stats for ${name}. Data-driven league betting insights on SoccerStatsHub.`,
  };
}

export function buildCompetitionJsonLd(data, canonicalUrl, catalog) {
  const name = data?.english_name || data?.name || catalog?.name || "Competition";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `${name} Betting Stats`,
        description: `Football betting stats and market trends for ${name}.`,
        isPartOf: { "@id": "https://www.soccerstatshub.com/#website" },
        inLanguage: "en-GB",
      },
      {
        "@type": "SportsOrganization",
        name,
        sport: "Football",
        url: canonicalUrl,
      },
    ],
  };
}

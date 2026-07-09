import { FEATURED_COMPETITION_SLUGS, getIndexableCompetitions } from "./competitionCatalog";

const REGION_GROUPS = [
  {
    id: "england",
    label: "England",
    slugs: [
      "premier-league",
      "championship",
      "league-one",
      "league-two",
      "national-league",
      "national-league-north",
      "national-league-south",
    ],
  },
  {
    id: "scotland",
    label: "Scotland",
    slugs: [
      "scottish-premiership",
      "scottish-championship",
      "scottish-league-one",
      "scottish-league-two",
    ],
  },
  {
    id: "spain",
    label: "Spain",
    slugs: ["la-liga", "segunda-division"],
  },
  {
    id: "germany",
    label: "Germany",
    slugs: ["bundesliga", "bundesliga-2", "3-liga"],
  },
  {
    id: "italy",
    label: "Italy",
    slugs: ["serie-a", "serie-b"],
  },
  {
    id: "france",
    label: "France",
    slugs: ["ligue-1", "ligue-2"],
  },
  {
    id: "benelux-portugal",
    label: "Benelux & Portugal",
    slugs: ["eredivisie", "eerste-divisie", "primeira-liga", "belgian-pro-league"],
  },
  {
    id: "europe",
    label: "Rest of Europe",
    slugs: [
      "allsvenskan",
      "danish-superliga",
      "eliteserien",
      "austrian-bundesliga",
      "greek-super-league",
      "turkish-super-lig",
      "ekstraklasa",
      "swiss-super-league",
      "croatian-first-league",
      "czech-first-league",
      "irish-premier-division",
      "veikkausliiga",
      "ukrainian-premier-league",
      "slovenian-prva-liga",
      "slovak-super-liga",
      "serbian-superliga",
    ],
  },
  {
    id: "international",
    label: "International & UEFA",
    slugs: [
      "champions-league",
      "europa-league",
      "europa-conference-league",
      "world-cup-2026",
      "uefa-nations-league",
      "world-cup-europe-qualifiers",
      "world-cup-south-america-qualifiers",
      "club-world-cup",
    ],
  },
  {
    id: "americas",
    label: "Americas",
    slugs: [
      "mls",
      "usl",
      "liga-mx",
      "brazil-serie-a",
      "brazil-serie-b",
      "copa-libertadores",
      "argentina-primera-division",
      "colombian-primera-division",
      "chilean-primera-division",
      "uruguayan-primera-division",
    ],
  },
  {
    id: "asia-oceania",
    label: "Asia, Middle East & Oceania",
    slugs: ["j-league", "k-league", "a-league", "saudi-pro-league"],
  },
];

function resolveGroupCompetitions(slugs, bySlug, excludeSlugs) {
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((competition) => competition && !excludeSlugs.has(competition.slug))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export function buildCompetitionsIndexSections() {
  const indexable = getIndexableCompetitions();
  const bySlug = new Map(indexable.map((competition) => [competition.slug, competition]));
  const featuredSlugs = new Set(FEATURED_COMPETITION_SLUGS);

  const featured = FEATURED_COMPETITION_SLUGS.map((slug) => bySlug.get(slug)).filter(Boolean);

  const usedSlugs = new Set(featured.map((competition) => competition.slug));

  const regions = REGION_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    competitions: resolveGroupCompetitions(group.slugs, bySlug, featuredSlugs),
  })).filter((group) => group.competitions.length > 0);

  regions.forEach((group) => {
    group.competitions.forEach((competition) => usedSlugs.add(competition.slug));
  });

  const other = indexable
    .filter((competition) => !usedSlugs.has(competition.slug))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  return { featured, regions, other, total: indexable.length };
}

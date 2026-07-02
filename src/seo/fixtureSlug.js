const FINISHED_FIXTURE_STATUSES = new Set([
  "complete",
  "suspended",
  "canceled",
  "postponed",
  "abandoned",
]);

/** Fixtures with these statuses are past the pre-match indexing window. */
export function isFixtureFinished(fixture) {
  if (!fixture) return false;
  return FINISHED_FIXTURE_STATUSES.has(fixture.status);
}

export const FIXTURE_SITEMAP_WINDOW_DAYS = 3;

export function slugifyTeamName(name) {
  return String(name || "team")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function buildFixtureSlug(homeTeam, awayTeam, matchId) {
  const home = slugifyTeamName(homeTeam) || "home";
  const away = slugifyTeamName(awayTeam) || "away";
  return `${home}-vs-${away}-${matchId}`;
}

export function parseFixtureParam(param) {
  const value = String(param || "");
  if (/^\d+$/.test(value)) {
    return { matchId: value, isNumericOnly: true };
  }
  const match = value.match(/-(\d+)$/);
  if (match) {
    return { matchId: match[1], isNumericOnly: false };
  }
  return null;
}

export function buildFixtureUrl(homeTeam, awayTeam, matchId) {
  return `/fixture/${buildFixtureSlug(homeTeam, awayTeam, matchId)}/`;
}

export function buildFixtureMeta(fixture) {
  const home = fixture?.home_name || fixture?.homeTeam || "Home";
  const away = fixture?.away_name || fixture?.awayTeam || "Away";
  const league = fixture?.competition_name || fixture?.league_name || "";
  const title = `${home} vs ${away} Stats & Prediction | SoccerStatsHub`;
  const description = league
    ? `${home} vs ${away} in ${league}: head-to-head, form, BTTS and Over 2.5 stats with SoccerStatsHub predictions.`
    : `${home} vs ${away}: head-to-head, form, BTTS and Over 2.5 stats with SoccerStatsHub predictions.`;
  return { title, description, home, away, league };
}

export function buildFixtureJsonLd(fixture, canonicalUrl, meta) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: meta.title,
        description: meta.description,
        isPartOf: { "@id": "https://www.soccerstatshub.com/#website" },
        inLanguage: "en-GB",
      },
      {
        "@type": "SportsEvent",
        name: `${meta.home} vs ${meta.away}`,
        sport: "Football",
        url: canonicalUrl,
        homeTeam: { "@type": "SportsTeam", name: meta.home },
        awayTeam: { "@type": "SportsTeam", name: meta.away },
      },
    ],
  };
}

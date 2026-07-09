import { resolveFixtureLeagueName } from "./competitionCatalog";
import { OG_IMAGE } from "./pageMetaConfig";

const FINISHED_FIXTURE_STATUSES = new Set([
  "complete",
  "suspended",
  "canceled",
  "postponed",
  "abandoned",
]);

const FOOTYSTATS_IMAGE_BASE = "https://cdn.footystats.org/img/";

const EVENT_STATUS_BY_FIXTURE_STATUS = {
  incomplete: "https://schema.org/EventScheduled",
  postponed: "https://schema.org/EventPostponed",
  canceled: "https://schema.org/EventCancelled",
  suspended: "https://schema.org/EventPostponed",
  abandoned: "https://schema.org/EventCancelled",
};

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
  const league = resolveFixtureLeagueName(fixture);
  const title = `${home} vs ${away} Stats & Prediction | Soccer Stats Hub`;
  const description = league
    ? `${home} vs ${away} in ${league}: head-to-head, form, BTTS and Over 2.5 stats with Soccer Stats Hub predictions.`
    : `${home} vs ${away}: head-to-head, form, BTTS and Over 2.5 stats with Soccer Stats Hub predictions.`;
  return { title, description, home, away, league };
}

function fixtureStartDateIso(fixture) {
  const dateUnix = fixture?.date_unix ?? fixture?.date;
  if (!dateUnix) return null;
  return new Date(Number(dateUnix) * 1000).toISOString();
}

function buildTeamImageUrl(imagePath) {
  if (!imagePath || imagePath === "-") return null;
  return `${FOOTYSTATS_IMAGE_BASE}${imagePath}`;
}

export function buildFixtureEventImages(fixture) {
  const images = [
    buildTeamImageUrl(fixture?.home_image || fixture?.homeBadge),
    buildTeamImageUrl(fixture?.away_image || fixture?.awayBadge),
  ].filter(Boolean);

  if (images.length === 0) return [OG_IMAGE];
  return images;
}

export function buildFixtureEventLocation(fixture) {
  const name = fixture?.stadium_name || fixture?.stadium;
  const streetAddress = fixture?.stadium_location;

  if (!name && !streetAddress) {
    return { "@type": "Place", name: "Venue to be confirmed" };
  }

  const location = { "@type": "Place" };
  if (name) location.name = name;
  if (streetAddress) {
    location.address = { "@type": "PostalAddress", streetAddress };
  }
  return location;
}

export function buildFixtureEventStatus(fixture) {
  return (
    EVENT_STATUS_BY_FIXTURE_STATUS[fixture?.status] ||
    "https://schema.org/EventScheduled"
  );
}

export function buildFixtureJsonLd(fixture, canonicalUrl, meta) {
  const startDate = fixtureStartDateIso(fixture);
  const sportsEvent = {
    "@type": "SportsEvent",
    "@id": `${canonicalUrl}#event`,
    name: `${meta.home} vs ${meta.away}`,
    description: meta.description,
    sport: "Football",
    url: canonicalUrl,
    startDate,
    eventStatus: buildFixtureEventStatus(fixture),
    location: buildFixtureEventLocation(fixture),
    image: buildFixtureEventImages(fixture),
    performer: [
      { "@type": "SportsTeam", name: meta.home },
      { "@type": "SportsTeam", name: meta.away },
    ],
    homeTeam: { "@type": "SportsTeam", name: meta.home },
    awayTeam: { "@type": "SportsTeam", name: meta.away },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      price: "0",
      priceCurrency: "GBP",
      availability: "https://schema.org/InStock",
      ...(startDate ? { validFrom: startDate } : {}),
    },
  };

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
        mainEntity: { "@id": `${canonicalUrl}#event` },
      },
      sportsEvent,
    ],
  };
}

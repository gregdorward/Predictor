import { getIndexableCompetitions } from "./competitionCatalog";
import {
  fetchUpcomingFixtureLinks,
  filterIndexableCompetitions,
  filterIndexableFixtureLinks,
} from "./serverFetch";
import { SITE_URL } from "./pageMetaConfig";
import { getArticleIndex } from "../data/articles/loadArticles";

export const STATIC_SITEMAP_ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/o25/", priority: "0.8", changefreq: "daily" },
  { path: "/highest-scoring-leagues/", priority: "0.8", changefreq: "daily" },
  { path: "/u25/", priority: "0.8", changefreq: "daily" },
  { path: "/fixtureshigh/", priority: "0.8", changefreq: "daily" },
  { path: "/bttsfixtures/", priority: "0.8", changefreq: "daily" },
  { path: "/bttsteams/", priority: "0.8", changefreq: "daily" },
  { path: "/btts-no-teams/", priority: "0.8", changefreq: "daily" },
  { path: "/premier-league-2026-27/", priority: "0.8", changefreq: "weekly" },
  { path: "/articles/", priority: "0.8", changefreq: "weekly" },
  { path: "/competitions/", priority: "0.8", changefreq: "weekly" },
  { path: "/fixtures/", priority: "0.8", changefreq: "daily" },
  { path: "/about/", priority: "0.6", changefreq: "monthly" },
  { path: "/methodology/", priority: "0.6", changefreq: "monthly" },
  { path: "/faq/", priority: "0.6", changefreq: "monthly" },
  { path: "/privacy/", priority: "0.4", changefreq: "monthly" },
  { path: "/terms/", priority: "0.4", changefreq: "monthly" },
];

function toAbsoluteUrl(path) {
  if (path === "/") return `${SITE_URL}/`;
  return `${SITE_URL}${path}`;
}

function collectCoreSitemapUrls() {
  const staticUrls = STATIC_SITEMAP_ROUTES.map((route) => toAbsoluteUrl(route.path));
  const articleUrls = getArticleIndex().map((article) =>
    toAbsoluteUrl(`/articles/${article.slug}/`)
  );
  return [...staticUrls, ...articleUrls];
}

async function collectIndexableCompetitionUrls() {
  try {
    const indexable = await filterIndexableCompetitions(getIndexableCompetitions());
    return indexable.map((competition) =>
      toAbsoluteUrl(`/competition/${competition.slug}/`)
    );
  } catch {
    return [];
  }
}

/**
 * All indexable URLs used by sitemap.xml and IndexNow pings.
 * Fixture match pages are noindex and excluded by default.
 * Competition hubs are included only when the season has live averages
 * (empty/unstarted seasons are noindex on the page).
 */
export async function collectSitemapUrls({
  fixtureLimit = 80,
  includeFixtures = false,
  includeCompetitions = true,
} = {}) {
  const baseUrls = [
    ...collectCoreSitemapUrls(),
    ...(includeCompetitions ? await collectIndexableCompetitionUrls() : []),
  ];

  if (!includeFixtures) {
    return baseUrls;
  }

  try {
    const fixtures = await fetchUpcomingFixtureLinks({
      limit: fixtureLimit + 20,
      timeoutMs: 3500,
    });
    const indexable = await filterIndexableFixtureLinks(fixtures, {
      snapshotTimeoutMs: 2000,
    });
    const fixtureUrls = indexable
      .slice(0, fixtureLimit)
      .map((fixture) => toAbsoluteUrl(fixture.href));
    return [...baseUrls, ...fixtureUrls];
  } catch {
    return baseUrls;
  }
}

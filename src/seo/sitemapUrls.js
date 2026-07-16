import { getIndexableCompetitions } from "./competitionCatalog";
import { fetchUpcomingFixtureLinks } from "./serverFetch";
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
  { path: "/seasonpreviews/", priority: "0.7", changefreq: "weekly" },
  { path: "/worldcup2026/", priority: "0.9", changefreq: "weekly" },
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

/** All indexable URLs used by sitemap.xml and IndexNow pings. */
export async function collectSitemapUrls({ fixtureLimit = 150 } = {}) {
  const staticUrls = STATIC_SITEMAP_ROUTES.map((route) => toAbsoluteUrl(route.path));
  const articleUrls = getArticleIndex().map((article) =>
    toAbsoluteUrl(`/articles/${article.slug}/`)
  );
  const competitionUrls = getIndexableCompetitions().map((competition) =>
    toAbsoluteUrl(`/competition/${competition.slug}/`)
  );
  const fixtures = await fetchUpcomingFixtureLinks({ limit: fixtureLimit });
  const fixtureUrls = fixtures.map((fixture) => toAbsoluteUrl(fixture.href));

  return [...staticUrls, ...articleUrls, ...competitionUrls, ...fixtureUrls];
}

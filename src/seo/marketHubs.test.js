import { SITE_NAV_LINKS } from "./siteNavLinks";
import { STATIC_SITEMAP_ROUTES, lastmodForPath } from "./sitemapUrls";
import { getCoreStatLinks, STAT_PAGE_SEO } from "./statPageSeoConfig";

const RETIRED_MARKET_PATHS = [
  "/o25/",
  "/u25/",
  "/bttsteams/",
  "/btts-no-teams/",
];

const KEPT_HUBS = ["/bttsfixtures/", "/fixtureshigh/", "/highest-scoring-leagues/"];

describe("collapsed market hubs", () => {
  test("nav no longer links retired keyword-variant lists", () => {
    const paths = SITE_NAV_LINKS.map((link) => link.path);
    expect(paths).toEqual(expect.arrayContaining(KEPT_HUBS));
    for (const retired of RETIRED_MARKET_PATHS) {
      expect(paths).not.toContain(retired);
    }
  });

  test("sitemap no longer advertises retired keyword-variant lists", () => {
    const paths = STATIC_SITEMAP_ROUTES.map((route) => route.path);
    expect(paths).toEqual(expect.arrayContaining(KEPT_HUBS));
    for (const retired of RETIRED_MARKET_PATHS) {
      expect(paths).not.toContain(retired);
    }
  });

  test("related stat links only point at remaining hubs", () => {
    const hrefs = getCoreStatLinks().map((link) => link.href);
    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/bttsfixtures/",
        "/fixtureshigh/",
        "/highest-scoring-leagues/",
        "/competitions/",
      ])
    );
    for (const retired of RETIRED_MARKET_PATHS) {
      expect(hrefs).not.toContain(retired);
    }
  });

  test("kept hub pages do not ship FAQ blocks", () => {
    for (const key of ["bttsFixtures", "fixturesHigh", "highestScoringLeagues"]) {
      expect(STAT_PAGE_SEO[key].faqItems ?? []).toHaveLength(0);
    }
  });

  test("lastmod is limited to dated articles", () => {
    expect(lastmodForPath("/articles/how-we-predict-a-game/")).toBe("2026-07-16");
    expect(lastmodForPath("/privacy/")).toBeNull();
    expect(lastmodForPath("/competition/premier-league/")).toBeNull();
    expect(lastmodForPath("/")).toBeNull();
  });
});

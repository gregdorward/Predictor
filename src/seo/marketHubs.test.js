import { SITE_NAV_LINKS } from "./siteNavLinks";
import { STATIC_SITEMAP_ROUTES } from "./sitemapUrls";
import { getCoreStatLinks } from "./statPageSeoConfig";

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
});

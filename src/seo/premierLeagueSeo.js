import {
  SITE_URL,
  buildPremierLeague202627OgImageUrl,
} from "./pageMetaConfig";

export function buildPremierLeaguePreviewJsonLd(data) {
  const pageUrl = `${SITE_URL}/premier-league-2026-27/`;
  const shareImage = buildPremierLeague202627OgImageUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Premier League 2026/27 Season Preview",
    description:
      data?.overview?.slice(0, 160) ||
      "Premier League 2026/27 season preview with market odds, transfers and club guides.",
    image: [shareImage],
    datePublished: data?.dataAsOf,
    dateModified: data?.generatedAt,
    author: {
      "@type": "Organization",
      name: "Soccer Stats Hub",
    },
    publisher: {
      "@type": "Organization",
      name: "Soccer Stats Hub",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/NewLogo.png`,
      },
    },
    mainEntityOfPage: pageUrl,
    // Season previews are not a single Event (no one venue). Using SportsEvent
    // without location triggers GSC "Missing field location" on Event rich results.
    about: {
      "@type": "SportsOrganization",
      name: "Premier League",
      sport: "Association football",
      url: "https://www.premierleague.com/",
    },
  };
}

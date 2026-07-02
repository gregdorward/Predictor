import newsData from "../data/worldcup2026/tournament-news.json";
import { SITE_URL } from "./pageMetaConfig";

export function buildWorldCupNewsJsonLd() {
  const articles = [];

  for (const section of newsData.sections || []) {
    for (const story of section.stories || []) {
      articles.push({
        "@type": "NewsArticle",
        headline: story.headline,
        description: story.summary,
        datePublished: story.publishedDate,
        author: {
          "@type": "Organization",
          name: "SoccerStatsHub",
        },
        publisher: {
          "@type": "Organization",
          name: "SoccerStatsHub",
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/images/NewLogo.png`,
          },
        },
        mainEntityOfPage: `${SITE_URL}/worldcup2026/`,
        isPartOf: {
          "@type": "WebPage",
          url: `${SITE_URL}/worldcup2026/`,
        },
      });
    }
  }

  return {
    "@context": "https://schema.org",
    "@graph": articles,
  };
}

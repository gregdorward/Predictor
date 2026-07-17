import indexData from "./index.json";
import worldCupAwards from "./world-cup-2026-awards.json";
import howWePredict from "./how-we-predict-a-game.json";
import customiseTipsFilters from "./customise-tips-filters.json";

const ARTICLE_BY_SLUG = {
  [customiseTipsFilters.slug]: customiseTipsFilters,
  [howWePredict.slug]: howWePredict,
  [worldCupAwards.slug]: worldCupAwards,
};

export function getArticleIndex() {
  return indexData.articles || [];
}

export function getArticleBySlug(slug) {
  return ARTICLE_BY_SLUG[slug] || null;
}

export function getAllArticleSlugs() {
  return getArticleIndex().map((entry) => entry.slug);
}

export function getArticleListingMeta(slug) {
  return getArticleIndex().find((entry) => entry.slug === slug) || null;
}

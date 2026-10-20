const DRAFT_BY_SLUG = {};

export function getAllDraftArticleSlugs() {
  return Object.keys(DRAFT_BY_SLUG);
}

export function getDraftArticleBySlug(slug) {
  return DRAFT_BY_SLUG[slug] || null;
}

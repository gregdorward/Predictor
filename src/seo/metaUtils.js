/** Ahrefs / Google snippet guidance — aim ≤155 characters. */
export const META_DESCRIPTION_MAX = 155;

/** Soft cap for visible title length in SERPs. */
export const META_TITLE_MAX = 60;

export function clampMetaDescription(description, max = META_DESCRIPTION_MAX) {
  const text = String(description || "").trim();
  if (!text || text.length <= max) return text;

  const slice = text.slice(0, max - 1).trimEnd();
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut}…`;
}

export function clampMetaTitle(title, max = META_TITLE_MAX) {
  const text = String(title || "").trim();
  if (!text || text.length <= max) return text;

  const slice = text.slice(0, max - 1).trimEnd();
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.5 ? slice.slice(0, lastSpace) : slice;
  return `${cut}…`;
}

/**
 * Split preview prose into paragraphs without breaking decimals or abbreviations.
 */
export function formatMatchPreviewParagraphs(text) {
  if (!text || typeof text !== "string") return [];
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (trimmed.includes("\n")) {
    return trimmed.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  }

  // Keep one paragraph per API block so the summary reads in full lines, not one sentence per row.
  return [trimmed];
}

export function matchPreviewErrorMessage(error) {
  if (!error) {
    return "The preview could not be generated. Try again in a moment.";
  }
  const msg =
    typeof error === "string" ? error : error.message || String(error);
  if (msg.includes("HTTP error")) {
    return "The preview service returned an error. Try again in a moment.";
  }
  if (msg.includes("League data unavailable")) {
    return "League data is not available for this fixture yet.";
  }
  if (msg.includes("League stats request failed")) {
    return "League stats could not be loaded. Check your connection and try again.";
  }
  if (msg.includes("empty")) {
    return "The preview came back empty. Try again in a moment.";
  }
  return "The preview could not be generated. Try again in a moment.";
}

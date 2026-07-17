/**
 * Renders plain text with optional *italic* segments as <em>.
 * Unmatched asterisks are left as literal characters.
 */
export default function renderInlineMarkup(text) {
  if (text == null || text === "") return text;

  const parts = String(text).split(/(\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={`em-${index}`}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

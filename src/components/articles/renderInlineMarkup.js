import { Fragment } from "react";

/**
 * Renders plain text with optional *italic* segments and [label](href) links.
 * Unmatched asterisks or brackets are left as literal characters.
 */
function renderItalicSegments(text, keyPrefix) {
  const parts = String(text).split(/(\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={`${keyPrefix}-em-${index}`}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default function renderInlineMarkup(text) {
  if (text == null || text === "") return text;

  const str = String(text);
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes = [];
  let lastIndex = 0;
  let match = linkPattern.exec(str);
  let segment = 0;

  while (match) {
    if (match.index > lastIndex) {
      nodes.push(
        ...renderItalicSegments(str.slice(lastIndex, match.index), `s${segment++}`)
      );
    }
    const href = match[2].trim();
    nodes.push(
      <a key={`lnk-${segment++}`} href={href}>
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
    match = linkPattern.exec(str);
  }

  if (lastIndex < str.length) {
    nodes.push(...renderItalicSegments(str.slice(lastIndex), `s${segment++}`));
  }

  if (nodes.length === 0) {
    return renderItalicSegments(str, "s0");
  }

  if (nodes.length === 1) {
    return nodes[0];
  }

  return <Fragment>{nodes}</Fragment>;
}

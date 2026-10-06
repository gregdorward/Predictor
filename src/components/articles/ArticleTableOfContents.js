const TOC_MIN_SECTIONS = 4;

export default function ArticleTableOfContents({ sections }) {
  if (!sections?.length || sections.length < TOC_MIN_SECTIONS) {
    return null;
  }

  const items = sections.filter((section) => section.id && section.heading);
  if (items.length < TOC_MIN_SECTIONS) {
    return null;
  }

  return (
    <nav className="ArticleToc" aria-label="On this page">
      <p className="ArticleToc__label">On this page</p>
      <ol className="ArticleToc__list">
        {items.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.heading}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

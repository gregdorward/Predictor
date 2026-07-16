export default function ArticleProse({ article }) {
  if (!article?.sections?.length) return null;

  return (
    <div className="ArticleProse">
      {article.sections.map((section) => (
        <section key={section.id} className="ArticleProse__section">
          {section.heading ? (
            <h2 className="ArticleProse__heading">{section.heading}</h2>
          ) : null}
          {(section.paragraphs || []).map((paragraph) => (
            <p key={paragraph.slice(0, 56)}>{paragraph}</p>
          ))}
          {section.bullets?.length ? (
            <ul className="ArticleProse__list">
              {section.bullets.map((item) => (
                <li key={item.slice(0, 56)}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}

import renderInlineMarkup from "./renderInlineMarkup";

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
            <p key={paragraph.slice(0, 56)}>{renderInlineMarkup(paragraph)}</p>
          ))}
          {section.table ? (
            <div className="ArticleProse__tableWrap">
              <table className="ArticleProse__table">
                {section.table.caption ? (
                  <caption>{section.table.caption}</caption>
                ) : null}
                {section.table.headers?.length ? (
                  <thead>
                    <tr>
                      {section.table.headers.map((header) => (
                        <th key={header} scope="col">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                ) : null}
                <tbody>
                  {(section.table.rows || []).map((row) => (
                    <tr key={row.join("|")}>
                      {row.map((cell, index) => (
                        <td key={`${row[0]}-${index}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {section.bullets?.length ? (
            <ul className="ArticleProse__list">
              {section.bullets.map((item) => (
                <li key={item.slice(0, 56)}>{renderInlineMarkup(item)}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}

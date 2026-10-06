import { Fragment } from "react";
import renderInlineMarkup from "./renderInlineMarkup";
import JourneyContentBreak from "../JourneyContentBreak";

function shouldInsertJourneyBreak(index, totalSections) {
  return totalSections >= 4 && (index + 1) % 2 === 0 && index < totalSections - 1;
}

export default function ArticleProse({ article }) {
  if (!article?.sections?.length) return null;

  const sections = article.sections;

  return (
    <>
      {sections.map((section, index) => (
        <Fragment key={section.id}>
          <section
            id={section.id || undefined}
            className="ArticleProse__section"
          >
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
                        {row.map((cell, cellIndex) => (
                          <td key={`${row[0]}-${cellIndex}`}>{cell}</td>
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
          {shouldInsertJourneyBreak(index, sections.length) ? (
            <JourneyContentBreak />
          ) : null}
        </Fragment>
      ))}
    </>
  );
}

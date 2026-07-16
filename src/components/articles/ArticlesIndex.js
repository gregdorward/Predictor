import SiteHeader from "../SiteHeader";
import PageMeta from "../PageMeta";
import JsonLd from "../JsonLd";
import { SITE_NAME, SITE_URL } from "../../seo/pageMetaConfig";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(`${String(dateStr).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ARTICLES_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/articles/#webpage`,
  url: `${SITE_URL}/articles/`,
  name: `Articles | ${SITE_NAME}`,
  description:
    "In-depth football analysis from Soccer Stats Hub: tournament awards, league deep-dives and data-led longform.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  inLanguage: "en-GB",
};

export default function ArticlesIndex({ articles }) {
  return (
    <>
      <PageMeta />
      <JsonLd data={ARTICLES_JSON_LD} />
      <SiteHeader showThemeToggle withFooter>
        <main className="Articles Articles--index">
          <a href="/" className="HomeLink">
            Home
          </a>
          <header className="Articles__header">
            <p className="Articles__eyebrow">Soccer Stats Hub</p>
            <h1 className="Articles__title">Articles</h1>
            <p className="Articles__dek">
              One-off analytical pieces on leagues, teams and tournaments.
              Built for readers who want the numbers and the story.
            </p>
          </header>

          <ul className="Articles__list">
            {(articles || []).map((article) => (
              <li key={article.slug} className="Articles__listItem">
                <a
                  href={`/articles/${article.slug}/`}
                  className="Articles__listLink"
                >
                  {article.heroLabel ? (
                    <span className="Articles__listLabel">{article.heroLabel}</span>
                  ) : null}
                  <span className="Articles__listTitle">{article.title}</span>
                  {article.dek ? (
                    <span className="Articles__listDek">{article.dek}</span>
                  ) : null}
                  <span className="Articles__listMeta">
                    {formatDate(article.publishedAt)}
                    {article.tags?.length
                      ? ` · ${article.tags.slice(0, 2).join(" · ")}`
                      : ""}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </main>
      </SiteHeader>
    </>
  );
}

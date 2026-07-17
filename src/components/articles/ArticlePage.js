import SiteHeader from "../SiteHeader";
import PageMeta from "../PageMeta";
import JsonLd from "../JsonLd";
import ArticleAwards from "./ArticleAwards";
import ArticleProse from "./ArticleProse";
import ArticleShareButton, { ArticleDateLine } from "./ArticleShareButton";
import renderInlineMarkup from "./renderInlineMarkup";
import { SITE_NAME, SITE_URL, getCanonicalUrl } from "../../seo/pageMetaConfig";

function buildArticleJsonLd(article, listing) {
  const url = getCanonicalUrl(`/articles/${article.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: listing?.ogDescription || article.dek || listing?.dek,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: {
      "@type": "Organization",
      name: article.authorLabel || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    inLanguage: "en-GB",
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

function articleEyebrow(article, listing) {
  if (listing?.heroLabel) return listing.heroLabel;
  if (article.layout === "awards") return "Awards";
  if (article.layout === "prose") return "Analysis";
  return null;
}

export default function ArticlePage({ article, listing }) {
  if (!article) return null;

  const pageTitle = `${article.title} | ${SITE_NAME}`;
  const description =
    listing?.ogDescription || article.dek || listing?.dek || article.subtitle;
  const canonicalPath = `/articles/${article.slug}`;
  const eyebrow = articleEyebrow(article, listing);

  return (
    <>
      <PageMeta
        title={pageTitle}
        description={description}
        canonicalPath={canonicalPath}
        ogType="article"
      />
      <JsonLd data={buildArticleJsonLd(article, listing)} />
      <SiteHeader showThemeToggle withFooter>
        <main className="Articles Articles--detail">
          <nav className="Articles__crumbs" aria-label="Breadcrumb">
            <a href="/" className="HomeLink">
              Home
            </a>
            <span className="Articles__crumbSep" aria-hidden="true">
              /
            </span>
            <a href="/articles/" className="Articles__crumbLink">
              Articles
            </a>
          </nav>

          <header className="Articles__header">
            {eyebrow ? <p className="Articles__eyebrow">{eyebrow}</p> : null}
            <h1 className="Articles__title">{article.title}</h1>
            {article.subtitle ? (
              <p className="Articles__subtitle">{article.subtitle}</p>
            ) : null}
            {article.dek ? <p className="Articles__dek">{article.dek}</p> : null}
            <div className="Articles__headerRow">
              <ArticleDateLine
                publishedAt={article.publishedAt}
                updatedAt={article.updatedAt}
                dataAsOf={article.dataAsOf}
                authorLabel={article.authorLabel}
              />
              <ArticleShareButton title={article.title} text={article.dek} />
            </div>
          </header>

          {article.intro?.length ? (
            <div className="Articles__prose">
              {article.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>
                  {renderInlineMarkup(paragraph)}
                </p>
              ))}
            </div>
          ) : null}

          {article.layout === "awards" ? (
            <ArticleAwards article={article} />
          ) : null}

          {article.layout === "prose" ? (
            <ArticleProse article={article} />
          ) : null}

          {article.outro?.length ? (
            <div className="Articles__prose Articles__prose--outro">
              {article.outro.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>
                  {renderInlineMarkup(paragraph)}
                </p>
              ))}
            </div>
          ) : null}

          {article.relatedLinks?.length ? (
            <footer className="Articles__related">
              <h2 className="Articles__relatedTitle">Related</h2>
              <ul className="Articles__relatedList">
                {article.relatedLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </footer>
          ) : null}
        </main>
      </SiteHeader>
    </>
  );
}

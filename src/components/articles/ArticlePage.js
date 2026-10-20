import SiteHeader from "../SiteHeader";
import PageMeta from "../PageMeta";
import JsonLd from "../JsonLd";
import ArticleAwards from "./ArticleAwards";
import ArticleProse from "./ArticleProse";
import ArticleTableOfContents from "./ArticleTableOfContents";
import ArticleShareButton, { ArticleDateLine } from "./ArticleShareButton";
import renderInlineMarkup from "./renderInlineMarkup";
import JourneyContentBreak from "../JourneyContentBreak";
import { buildFounderPersonSchema, FOUNDER_AUTHOR_LABEL } from "../../seo/authorConfig";
import { SITE_NAME, SITE_URL, getCanonicalUrl } from "../../seo/pageMetaConfig";
import DataCitation from "../DataCitation";

function buildArticleJsonLd(article, listing) {
  const url = getCanonicalUrl(`/articles/${article.slug}`);
  const reviewedAt = article.reviewedAt || article.updatedAt || article.publishedAt;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: listing?.ogDescription || article.dek || listing?.dek,
    datePublished: article.publishedAt,
    dateModified: reviewedAt || article.updatedAt || article.publishedAt,
    author: buildFounderPersonSchema(),
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

function shouldInsertIntroJourneyBreak(article) {
  if (!article?.intro?.length) return false;
  if (article.layout === "awards") return (article.categories?.length || 0) >= 4;
  if (article.layout === "prose") return (article.sections?.length || 0) >= 3;
  return false;
}

export default function ArticlePage({ article, listing, draftPreview = false }) {
  if (!article) return null;

  const pageTitle = draftPreview
    ? `[Draft] ${article.title} | ${SITE_NAME}`
    : `${article.title} | ${SITE_NAME}`;
  const description =
    listing?.ogDescription || article.dek || listing?.dek || article.subtitle;
  const canonicalPath = draftPreview
    ? `/articles/draft/${article.slug}`
    : `/articles/${article.slug}`;
  const eyebrow = draftPreview
    ? "Draft preview"
    : articleEyebrow(article, listing);

  return (
    <>
      <PageMeta
        title={pageTitle}
        description={description}
        canonicalPath={canonicalPath}
        ogType="article"
        noIndex={draftPreview}
        follow={draftPreview}
      />
      {!draftPreview ? <JsonLd data={buildArticleJsonLd(article, listing)} /> : null}
      <SiteHeader showThemeToggle withFooter>
        <main className="StaticPage StaticPage--article">
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
            {draftPreview ? (
              <p className="Articles__draftNotice" role="status">
                Draft preview only. This URL is not indexed. Publish by moving the
                article into <code>loadArticles.js</code> and{" "}
                <code>index.json</code> when ready.
              </p>
            ) : null}
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
                reviewedAt={article.reviewedAt}
                dataAsOf={article.dataAsOf}
                authorLabel={article.authorLabel || FOUNDER_AUTHOR_LABEL}
              />
              <ArticleShareButton title={article.title} text={article.dek} />
            </div>
          </header>

          <div id="ssh-content" className="journey-content Articles__content">
            {article.layout === "prose" ? (
              <ArticleTableOfContents sections={article.sections} />
            ) : null}

            {article.intro?.length ? (
              <div className="Articles__prose">
                {article.intro.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>
                    {renderInlineMarkup(paragraph)}
                  </p>
                ))}
              </div>
            ) : null}

            {shouldInsertIntroJourneyBreak(article) ? <JourneyContentBreak /> : null}

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

            {article.showDataCitation ? (
              <DataCitation
                asOf={article.dataAsOf || article.reviewedAt || article.updatedAt}
                pageLabel="this article"
              />
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
          </div>
        </main>
      </SiteHeader>
    </>
  );
}

import ArticlePage from "../../src/components/articles/ArticlePage";
import {
  getAllArticleSlugs,
  getArticleBySlug,
  getArticleListingMeta,
} from "../../src/data/articles/loadArticles";

export default function ArticleBySlugPage({ article, listing }) {
  return <ArticlePage article={article} listing={listing} />;
}

export async function getStaticPaths() {
  const paths = getAllArticleSlugs().map((slug) => ({
    params: { slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const slug = params?.slug;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { notFound: true };
  }

  return {
    props: {
      article,
      listing: getArticleListingMeta(slug),
    },
  };
}

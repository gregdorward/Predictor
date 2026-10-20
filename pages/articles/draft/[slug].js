import ArticlePage from "../../../src/components/articles/ArticlePage";
import {
  getAllDraftArticleSlugs,
  getDraftArticleBySlug,
} from "../../../src/data/articles/loadDraftArticles";

export default function DraftArticlePreviewPage({ article }) {
  return <ArticlePage article={article} draftPreview />;
}

export async function getStaticPaths() {
  const paths = getAllDraftArticleSlugs().map((slug) => ({
    params: { slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const slug = params?.slug;
  const article = getDraftArticleBySlug(slug);

  if (!article) {
    return { notFound: true };
  }

  return {
    props: {
      article,
    },
  };
}

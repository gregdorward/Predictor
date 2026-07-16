import ArticlesIndex from "../../src/components/articles/ArticlesIndex";
import { getArticleIndex } from "../../src/data/articles/loadArticles";

export default function ArticlesIndexPage({ articles }) {
  return <ArticlesIndex articles={articles} />;
}

export async function getStaticProps() {
  return {
    props: {
      articles: getArticleIndex(),
    },
  };
}

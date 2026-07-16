import indexData from "./index.json";
import awards from "./world-cup-2026-awards.json";
import howWePredict from "./how-we-predict-a-game.json";
import {
  getArticleBySlug,
  getArticleIndex,
  getAllArticleSlugs,
} from "./loadArticles";

const EM_DASH = "\u2014";
const EN_DASH = "\u2013";

function collectArticleText(article) {
  const parts = [
    article.title,
    article.subtitle,
    article.dek,
    ...(article.intro || []),
    ...(article.outro || []),
  ];

  (article.sections || []).forEach((section) => {
    parts.push(section.heading, ...(section.paragraphs || []), ...(section.bullets || []));
  });

  (article.categories || []).forEach((category) => {
    parts.push(
      category.title,
      category.subtitle,
      category.analysis,
      category.winner?.name,
      category.winner?.note,
      category.winner?.team
    );
    (category.contenders || []).forEach((contender) => {
      parts.push(contender.name, contender.note, contender.team);
    });
    (category.stats || []).forEach((stat) => {
      parts.push(stat.label, String(stat.value));
    });
  });

  return parts.filter(Boolean).join(" ");
}

describe("articles index", () => {
  test("lists at least one article with required listing fields", () => {
    const articles = getArticleIndex();
    expect(articles.length).toBeGreaterThanOrEqual(1);
    articles.forEach((entry) => {
      expect(entry.slug).toBeTruthy();
      expect(entry.title).toBeTruthy();
      expect(entry.dek).toBeTruthy();
      expect(entry.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  test("index slugs resolve to article bodies", () => {
    getAllArticleSlugs().forEach((slug) => {
      expect(getArticleBySlug(slug)).toBeTruthy();
    });
  });

  test("index.json articles array matches loader", () => {
    expect(indexData.articles.map((a) => a.slug)).toEqual(getAllArticleSlugs());
  });
});

describe("world-cup-2026-awards article", () => {
  test("has awards layout and required metadata", () => {
    expect(awards.layout).toBe("awards");
    expect(awards.slug).toBe("world-cup-2026-awards");
    expect(awards.title).toBeTruthy();
    expect(awards.dataAsOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(awards.intro.length).toBeGreaterThanOrEqual(2);
    expect(awards.categories.length).toBeGreaterThanOrEqual(6);
    expect(awards.relatedLinks.some((link) => link.href === "/worldcup2026/")).toBe(
      true
    );
  });

  test("each category has winner, contenders, analysis and stats", () => {
    awards.categories.forEach((category) => {
      expect(category.id).toBeTruthy();
      expect(category.title).toBeTruthy();
      expect(category.winner?.name).toBeTruthy();
      expect(category.contenders.length).toBeGreaterThanOrEqual(2);
      expect(category.analysis).toBeTruthy();
      expect(category.stats.length).toBeGreaterThanOrEqual(2);
      category.stats.forEach((stat) => {
        expect(stat.label).toBeTruthy();
        expect(stat.value).toBeTruthy();
      });
    });
  });

  test("includes late drama and distance categories", () => {
    const ids = awards.categories.map((category) => category.id);
    expect(ids).toContain("late-drama");
    expect(ids).toContain("distance");
    expect(ids).toContain("player-of-the-tournament");
  });

  test("content contains no em-dashes", () => {
    expect(collectArticleText(awards)).not.toContain(EM_DASH);
  });

  test("content contains no Oscars references", () => {
    expect(collectArticleText(awards).toLowerCase()).not.toContain("oscar");
  });
});

describe("how-we-predict-a-game article", () => {
  test("has prose layout and required sections", () => {
    expect(howWePredict.layout).toBe("prose");
    expect(howWePredict.slug).toBe("how-we-predict-a-game");
    expect(howWePredict.title).toBe("How we predict a game");
    expect(howWePredict.intro.length).toBeGreaterThanOrEqual(2);
    expect(howWePredict.sections.length).toBeGreaterThanOrEqual(5);
    expect(howWePredict.relatedLinks.some((link) => link.href === "/methodology/")).toBe(
      true
    );
  });

  test("highlights per-fixture competition history", () => {
    const text = collectArticleText(howWePredict).toLowerCase();
    expect(text).toContain("completed");
    expect(text).toContain("fixture");
    expect(text).toContain("poisson");
    expect(howWePredict.sections.some((section) => section.id === "every-fixture")).toBe(
      true
    );
  });

  test("each section has a heading and paragraphs", () => {
    howWePredict.sections.forEach((section) => {
      expect(section.id).toBeTruthy();
      expect(section.heading).toBeTruthy();
      expect(section.paragraphs.length).toBeGreaterThanOrEqual(1);
    });
  });

  test("content contains no em-dashes or en-dashes", () => {
    const text = collectArticleText(howWePredict);
    expect(text).not.toContain(EM_DASH);
    expect(text).not.toContain(EN_DASH);
  });
});

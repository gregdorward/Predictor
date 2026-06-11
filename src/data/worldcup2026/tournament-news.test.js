import newsData from "./tournament-news.json";

const EM_DASH = "\u2014";

function allStoryText(stories) {
  return stories.flatMap((s) => [s.headline, s.summary]);
}

describe("World Cup 2026 tournament news data", () => {
  test("has required top-level fields and sections", () => {
    expect(newsData.wrapUp).toBeTruthy();
    expect(newsData.updatedAt).toBeTruthy();
    expect(newsData.sections.length).toBeGreaterThanOrEqual(3);
  });

  test("each section has heading and stories", () => {
    newsData.sections.forEach((section) => {
      expect(section.id).toBeTruthy();
      expect(section.heading).toBeTruthy();
      expect(section.stories.length).toBeGreaterThan(0);
    });
  });

  test("each story has headline, summary and sources", () => {
    newsData.sections.forEach((section) => {
      section.stories.forEach((story) => {
        expect(story.id).toBeTruthy();
        expect(story.headline).toBeTruthy();
        expect(story.summary).toBeTruthy();
        expect(story.publishedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(story.sources.length).toBeGreaterThan(0);
        story.sources.forEach((source) => {
          expect(source.name).toBeTruthy();
          expect(source.url).toMatch(/^https:\/\//);
        });
      });
    });
  });

  test("content contains no em-dashes", () => {
    const allText = [
      newsData.wrapUp,
      ...newsData.sections.flatMap((section) => [
        section.heading,
        section.description || "",
        ...allStoryText(section.stories),
      ]),
    ].join(" ");
    expect(allText).not.toContain(EM_DASH);
  });

  test("includes narrative-focused section headings", () => {
    const headings = newsData.sections.map((s) => s.id);
    expect(headings).toContain("injuries-fitness");
    expect(headings).toContain("analysis-outlook");
  });
});

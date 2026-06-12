import newsData from "./tournament-news.json";

const EM_DASH = "\u2014";
const MAX_STORY_AGE_DAYS = 3;

function allStoryText(stories) {
  return stories.flatMap((s) => [s.headline, s.summary]);
}

function parseDate(dateStr) {
  return new Date(`${dateStr}T00:00:00Z`);
}

function storyCutoffDate(updatedAt) {
  const cutoff = parseDate(updatedAt.slice(0, 10));
  cutoff.setUTCDate(cutoff.getUTCDate() - MAX_STORY_AGE_DAYS);
  return cutoff;
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

  test("stories are no more than three days older than updatedAt", () => {
    const cutoff = storyCutoffDate(newsData.updatedAt);
    newsData.sections.forEach((section) => {
      section.stories.forEach((story) => {
        expect(parseDate(story.publishedDate).getTime()).toBeGreaterThanOrEqual(
          cutoff.getTime()
        );
      });
    });
  });

  test("stories within each section are sorted newest first", () => {
    newsData.sections.forEach((section) => {
      for (let i = 1; i < section.stories.length; i += 1) {
        const prev = section.stories[i - 1];
        const curr = section.stories[i];
        const dateCompare = curr.publishedDate.localeCompare(prev.publishedDate);
        expect(dateCompare).toBeLessThanOrEqual(0);
        if (dateCompare === 0) {
          expect(curr.id.localeCompare(prev.id)).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });
});

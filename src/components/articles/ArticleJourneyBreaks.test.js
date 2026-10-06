import { render } from "@testing-library/react";
import ArticlePage from "./ArticlePage";
import howWePredict from "../../data/articles/how-we-predict-a-game.json";
import nonPenaltyXg from "../../data/articles/non-penalty-xg-predictions.json";
import worldCupAwards from "../../data/articles/world-cup-2026-awards.json";

jest.mock("../SiteHeader", () => {
  return function MockSiteHeader({ children }) {
    return <>{children}</>;
  };
});

jest.mock("../PageMeta", () => {
  return function MockPageMeta() {
    return null;
  };
});

jest.mock("../JsonLd", () => {
  return function MockJsonLd() {
    return null;
  };
});

jest.mock("./ArticleShareButton", () => {
  function MockArticleShareButton() {
    return null;
  }

  function ArticleDateLine() {
    return <span>Article date</span>;
  }

  return {
    __esModule: true,
    default: MockArticleShareButton,
    ArticleDateLine,
  };
});

function countAdSlots(container) {
  return container.querySelectorAll(".FixturePage-contentBreak--adSlot").length;
}

function countDirectContentAdSlots(container) {
  return container.querySelectorAll(
    "#ssh-content > .FixturePage-contentBreak--adSlot"
  ).length;
}

describe("article Journey break markers", () => {
  it("adds an early break and section-spaced breaks to long prose articles", () => {
    const { container } = render(<ArticlePage article={howWePredict} />);

    expect(countAdSlots(container)).toBe(4);
    expect(countDirectContentAdSlots(container)).toBe(4);
  });

  it("renders section anchors and a table of contents on long prose articles", () => {
    const { container, getByRole } = render(<ArticlePage article={howWePredict} />);

    expect(getByRole("navigation", { name: "On this page" })).toBeTruthy();
    expect(container.querySelector("#starting-point")).toBeTruthy();
    expect(container.querySelector("#every-fixture")).toBeTruthy();
  });

  it("keeps shorter prose articles less dense", () => {
    const { container } = render(<ArticlePage article={nonPenaltyXg} />);

    expect(countAdSlots(container)).toBe(2);
    expect(countDirectContentAdSlots(container)).toBe(2);
  });

  it("omits the table of contents when there are fewer than four sections", () => {
    const shortArticle = {
      ...nonPenaltyXg,
      sections: nonPenaltyXg.sections.slice(0, 3),
    };
    const { queryByRole } = render(<ArticlePage article={shortArticle} />);

    expect(queryByRole("navigation", { name: "On this page" })).toBeNull();
  });

  it("adds breaks between award category groups", () => {
    const { container } = render(<ArticlePage article={worldCupAwards} />);

    expect(countAdSlots(container)).toBeGreaterThan(3);
    expect(countDirectContentAdSlots(container)).toBe(countAdSlots(container));
  });
});

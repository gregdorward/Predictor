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

describe("article Journey break markers", () => {
  it("adds an early break and section-spaced breaks to long prose articles", () => {
    const { container } = render(<ArticlePage article={howWePredict} />);

    expect(countAdSlots(container)).toBe(4);
  });

  it("keeps shorter prose articles less dense", () => {
    const { container } = render(<ArticlePage article={nonPenaltyXg} />);

    expect(countAdSlots(container)).toBe(2);
  });

  it("adds breaks between award category groups", () => {
    const { container } = render(<ArticlePage article={worldCupAwards} />);

    expect(countAdSlots(container)).toBeGreaterThan(3);
  });
});

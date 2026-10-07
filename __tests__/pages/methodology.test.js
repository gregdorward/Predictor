import { render } from "@testing-library/react";
import MethodologyPage from "../../pages/methodology";

jest.mock("../../src/components/SiteHeader", () => {
  return function MockSiteHeader({ children }) {
    return <>{children}</>;
  };
});

jest.mock("../../src/components/PageMeta", () => {
  return function MockPageMeta() {
    return null;
  };
});

jest.mock("../../src/components/JsonLd", () => {
  return function MockJsonLd() {
    return null;
  };
});

jest.mock("../../src/components/articles/ArticleShareButton", () => {
  return function MockArticleShareButton() {
    return null;
  };
});

describe("MethodologyPage", () => {
  it("renders table of contents and section anchors", () => {
    const { container, getByRole } = render(<MethodologyPage />);

    expect(getByRole("navigation", { name: "On this page" })).toBeTruthy();
    expect(container.querySelector("#goal-expectation")).toBeTruthy();
    expect(container.querySelector("#poisson-markets")).toBeTruthy();
    expect(container.querySelector(".Articles__related")).toBeTruthy();
    expect(container.querySelector(".StaticPage--article")).toBeTruthy();
  });
});

import { act, render } from "@testing-library/react";
import AdSenseUnitInner from "./AdSenseUnitInner";
import { flushAdSenseAds } from "../utils/flushAdSenseAds";

jest.mock("../utils/flushAdSenseAds", () => ({ flushAdSenseAds: jest.fn() }));

describe("AdSense placement lifecycle", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalIntersectionObserver = window.IntersectionObserver;
  const originalResizeObserver = window.ResizeObserver;
  let width;
  let intersection;
  let resize;

  beforeEach(() => {
    process.env.NODE_ENV = "production";
    width = 600;
    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(() => ({ width }));
    window.IntersectionObserver = jest.fn().mockImplementation((callback) => {
      intersection = callback;
      return { observe: jest.fn(), disconnect: jest.fn() };
    });
    window.ResizeObserver = jest.fn().mockImplementation((callback) => {
      resize = callback;
      return { observe: jest.fn(), disconnect: jest.fn() };
    });
    flushAdSenseAds.mockClear();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    window.IntersectionObserver = originalIntersectionObserver;
    window.ResizeObserver = originalResizeObserver;
    jest.restoreAllMocks();
  });

  it("waits until the placement is near the viewport", () => {
    const { container } = render(<AdSenseUnitInner slot="123" />);
    expect(container.querySelector("ins")).toBeNull();
    act(() => intersection([{ isIntersecting: true }]));
    expect(container.querySelector("ins")).toHaveAttribute("data-ad-slot", "123");
  });

  it("never inserts a unit in a hidden mobile rail, then loads on desktop", () => {
    width = 0;
    const { container } = render(<AdSenseUnitInner slot="123" lazy={false} />);
    expect(container.querySelector("ins")).toBeNull();
    width = 300;
    act(() => resize());
    expect(container.querySelector("ins")).toBeTruthy();
  });

  it("preserves a requested ad through width changes and re-renders", () => {
    const { container, rerender } = render(<AdSenseUnitInner slot="123" lazy={false} />);
    const ad = container.querySelector("ins");
    ad.setAttribute("data-adsbygoogle-status", "done");
    width = 0;
    act(() => resize());
    width = 600;
    act(() => resize());
    rerender(<AdSenseUnitInner slot="123" lazy={false} />);
    expect(container.querySelector("ins")).toBe(ad);
  });

  it.each([
    ["display", "auto", null],
    ["inArticle", "fluid", "in-article"],
    ["multiplex", "autorelaxed", null],
  ])("renders %s markup", (variant, format, layout) => {
    const { container } = render(<AdSenseUnitInner slot="123" variant={variant} lazy={false} />);
    const ad = container.querySelector("ins");
    expect(ad).toHaveAttribute("data-ad-format", format);
    expect(ad.getAttribute("data-ad-layout")).toBe(layout);
    expect(ad.closest('[aria-hidden="true"]')).toBeNull();
  });

  it("loads without IntersectionObserver or ResizeObserver support", () => {
    delete window.IntersectionObserver;
    delete window.ResizeObserver;
    const { container } = render(<AdSenseUnitInner slot="123" />);
    expect(container.querySelector("ins")).toBeTruthy();
  });

  it("does not insert ads in development", () => {
    process.env.NODE_ENV = "development";
    const { container } = render(<AdSenseUnitInner slot="123" lazy={false} />);
    expect(container.querySelector("ins")).toBeNull();
  });
});

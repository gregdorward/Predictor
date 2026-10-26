import { render } from "@testing-library/react";
import { useRouter } from "next/compat/router";
import AdSenseUnit from "./AdSenseUnit";
import { ADSENSE_SLOTS } from "../constants/adsense";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("next/dynamic", () => () => function MockAd({ variant }) {
  return <ins data-variant={variant} />;
});

it("preserves ads for anchor and query changes, remounting on page navigation", () => {
  useRouter.mockReturnValue({ asPath: "/competition/a/" });
  const { container, rerender } = render(<AdSenseUnit slot="123" placementId="test" />);
  const first = container.querySelector("ins");
  useRouter.mockReturnValue({ asPath: "/competition/a/?filter=home#standings" });
  rerender(<AdSenseUnit slot="123" placementId="test" />);
  expect(container.querySelector("ins")).toBe(first);
  useRouter.mockReturnValue({ asPath: "/competition/b/" });
  rerender(<AdSenseUnit slot="123" placementId="test" />);
  expect(container.querySelector("ins")).not.toBe(first);
});

it("supports legacy React roots without a Next router", () => {
  useRouter.mockReturnValue(null);
  const { container } = render(<AdSenseUnit slot="123" />);
  expect(container.querySelector("ins")).toBeTruthy();
});

it.each([
  [ADSENSE_SLOTS.HOME_MID_CONTENT, "inArticle"],
  [ADSENSE_SLOTS.FIXTURES_INDEX_BOTTOM, "inArticle"],
  [ADSENSE_SLOTS.FIXTURE_PAGE_TOP, "inArticle"],
  [ADSENSE_SLOTS.FIXTURE_PAGE_DISPLAY, "display"],
  [ADSENSE_SLOTS.STATS_FOOTER_MULTIPLEX, "multiplex"],
])("uses the account's unit type for slot %s", (slot, variant) => {
  useRouter.mockReturnValue(null);
  const { container } = render(<AdSenseUnit slot={slot} variant="display" />);
  expect(container.querySelector("ins")).toHaveAttribute("data-variant", variant);
});

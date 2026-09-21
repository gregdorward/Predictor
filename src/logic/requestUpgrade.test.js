/**
 * @jest-environment jsdom
 */
import {
  registerUpgradeHandler,
  requestUpgrade,
  UPGRADE_HOME_HREF,
  watchAndScrollToPremiumUpgrade,
} from "./requestUpgrade";

describe("requestUpgrade", () => {
  afterEach(() => {
    registerUpgradeHandler(null);
    delete window.location;
    window.location = { assign: jest.fn(), search: "", hash: "" };
    document.body.innerHTML = "";
  });

  beforeEach(() => {
    delete window.location;
    window.location = { assign: jest.fn(), search: "", hash: "" };
  });

  test("calls registered handler", () => {
    const fn = jest.fn();
    registerUpgradeHandler(fn);
    requestUpgrade();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("scrolls to premium-upgrade when no handler", () => {
    const el = document.createElement("div");
    el.id = "premium-upgrade";
    el.scrollIntoView = jest.fn();
    document.body.appendChild(el);
    requestUpgrade();
    expect(el.scrollIntoView).toHaveBeenCalled();
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  test("navigates home with upgrade flag when pricing is missing", () => {
    requestUpgrade();
    expect(window.location.assign).toHaveBeenCalledWith(UPGRADE_HOME_HREF);
  });

  test("watchAndScrollToPremiumUpgrade scrolls when upgrade query is set", () => {
    window.location.search = "?upgrade=1";
    window.location.hash = "";
    const el = document.createElement("div");
    el.id = "premium-upgrade";
    el.scrollIntoView = jest.fn();
    document.body.appendChild(el);

    const cleanup = watchAndScrollToPremiumUpgrade();
    expect(el.scrollIntoView).toHaveBeenCalled();
    cleanup();
  });

  test("watchAndScrollToPremiumUpgrade is a no-op without upgrade flag", () => {
    window.location.search = "";
    window.location.hash = "";
    const el = document.createElement("div");
    el.id = "premium-upgrade";
    el.scrollIntoView = jest.fn();
    document.body.appendChild(el);

    const cleanup = watchAndScrollToPremiumUpgrade();
    expect(el.scrollIntoView).not.toHaveBeenCalled();
    cleanup();
  });
});

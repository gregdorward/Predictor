/**
 * @jest-environment jsdom
 */
import {
  MEMBERSHIP_LOGIN_PROMPT_EVENT,
  promptGuestLoginOnPage,
  requestUpgrade,
  UPGRADE_HOME_HREF,
  watchAndScrollToPremiumUpgrade,
} from "./requestUpgrade";

describe("requestUpgrade", () => {
  afterEach(() => {
    delete window.location;
    window.location = { assign: jest.fn(), search: "", hash: "", pathname: "/fixture/foo" };
    document.body.innerHTML = "";
  });

  beforeEach(() => {
    delete window.location;
    window.location = { assign: jest.fn(), search: "", hash: "", pathname: "/fixture/foo" };
  });

  test("scrolls to premium-upgrade when present", () => {
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

  test("does not treat header hamburger as login — navigates away from fixture", () => {
    const menu = document.createElement("div");
    menu.id = "HamburgerMenuDiv";
    document.body.appendChild(menu);
    requestUpgrade();
    expect(window.location.assign).toHaveBeenCalledWith(UPGRADE_HOME_HREF);
  });

  test("promptGuestLoginOnPage focuses guest landing login", () => {
    window.location.pathname = "/";
    const slot = document.createElement("div");
    slot.id = "guest-landing-auth-slot";
    const input = document.createElement("button");
    input.id = "LoginSignUp";
    slot.appendChild(input);
    document.body.appendChild(slot);
    slot.scrollIntoView = jest.fn();
    input.focus = jest.fn();

    const onPrompt = jest.fn();
    window.addEventListener(MEMBERSHIP_LOGIN_PROMPT_EVENT, onPrompt);

    expect(promptGuestLoginOnPage()).toBe(true);
    expect(onPrompt).toHaveBeenCalled();
    expect(slot.classList.contains("GuestLanding-auth--membershipPrompt")).toBe(
      true
    );
    requestUpgrade();
    expect(window.location.assign).not.toHaveBeenCalled();

    window.removeEventListener(MEMBERSHIP_LOGIN_PROMPT_EVENT, onPrompt);
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

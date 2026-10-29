import { render } from "@testing-library/react";
import { useShowGuestAds } from "./useShowGuestAds";
import { useAuth } from "../logic/authProvider";
import { PREMIUM_AD_FREE_STORAGE_KEY } from "../utils/premiumAdFreeStorage";

jest.mock("../logic/authProvider", () => ({
  useAuth: jest.fn(),
}));

function readShowGuestAds() {
  let value;
  function Probe() {
    value = useShowGuestAds();
    return null;
  }
  render(<Probe />);
  return value;
}

describe("useShowGuestAds", () => {
  beforeEach(() => {
    window.localStorage.removeItem(PREMIUM_AD_FREE_STORAGE_KEY);
    useAuth.mockReturnValue({
      isPaidUser: false,
      loading: false,
      user: null,
    });
  });

  it("shows ads for signed-out visitors", () => {
    expect(readShowGuestAds()).toBe(true);
  });

  it("shows ads for logged-in free users", () => {
    useAuth.mockReturnValue({
      isPaidUser: false,
      loading: false,
      user: { uid: "u1" },
    });
    expect(readShowGuestAds()).toBe(true);
  });

  it("hides ads while subscription status is loading for a signed-in user", () => {
    useAuth.mockReturnValue({
      isPaidUser: false,
      loading: true,
      user: { uid: "u1" },
    });
    expect(readShowGuestAds()).toBe(false);
  });

  it("hides ads for premium subscribers", () => {
    useAuth.mockReturnValue({
      isPaidUser: true,
      loading: false,
      user: { uid: "u1" },
    });
    expect(readShowGuestAds()).toBe(false);
  });

  it("hides ads when the premium ad-free browser flag is set", () => {
    window.localStorage.setItem(PREMIUM_AD_FREE_STORAGE_KEY, "1");
    useAuth.mockReturnValue({
      isPaidUser: false,
      loading: false,
      user: null,
    });
    expect(readShowGuestAds()).toBe(false);
  });
});

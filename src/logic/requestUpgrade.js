/**
 * Shared upgrade / pricing navigation for React trees and render() islands.
 */

export const UPGRADE_HOME_HREF = "/?upgrade=1#premium-upgrade";

/** Fired when upgrade flow scrolls the guest to sign up / log in before checkout. */
export const MEMBERSHIP_LOGIN_PROMPT_EVENT = "ssh:membership-login-prompt";

function scrollToPremiumUpgrade() {
  if (typeof document === "undefined") return false;
  const target = document.getElementById("premium-upgrade");
  if (!target) return false;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

function isHomePath() {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname || "/";
  return path === "/" || path === "";
}

/**
 * Scroll to the guest login form on the homepage (not the header hamburger).
 * @returns {boolean} whether a login form was found and focused
 */
export function promptGuestLoginOnPage() {
  if (typeof document === "undefined") return false;

  const guestSlot = document.getElementById("guest-landing-auth-slot");
  const emailInput = document.getElementById("LoginSignUp");
  if (!guestSlot && !emailInput) return false;

  const scrollTarget = guestSlot || emailInput;
  scrollTarget?.scrollIntoView?.({ behavior: "smooth", block: "start" });

  guestSlot?.classList?.add("GuestLanding-auth--membershipPrompt");
  window.dispatchEvent(new CustomEvent(MEMBERSHIP_LOGIN_PROMPT_EVENT));

  if (emailInput) {
    emailInput.classList.add("flash-attention");
    window.setTimeout(() => {
      emailInput.classList.remove("flash-attention");
      emailInput.focus();
    }, 1000);
  }

  return true;
}

/**
 * Scroll to Premium pricing, prompt login on the homepage, or navigate home
 * so pricing can load. Safe from any route (fixture pages, stat pages, etc.).
 */
export function requestUpgrade() {
  if (typeof window === "undefined") return;

  if (scrollToPremiumUpgrade()) return;

  if (isHomePath() && promptGuestLoginOnPage()) return;

  window.location.assign(UPGRADE_HOME_HREF);
}

/**
 * Call from App after mount / auth settle when landing with ?upgrade=1 or #premium-upgrade.
 * @returns {() => void} cleanup
 */
export function watchAndScrollToPremiumUpgrade({ maxMs = 12000 } = {}) {
  if (typeof window === "undefined") return () => {};

  const params = new URLSearchParams(window.location.search);
  const wantsUpgrade =
    params.get("upgrade") === "1" ||
    window.location.hash === "#premium-upgrade";
  if (!wantsUpgrade) return () => {};

  if (scrollToPremiumUpgrade()) return () => {};

  const started = Date.now();
  const id = window.setInterval(() => {
    if (scrollToPremiumUpgrade() || Date.now() - started > maxMs) {
      window.clearInterval(id);
    }
  }, 150);

  return () => window.clearInterval(id);
}

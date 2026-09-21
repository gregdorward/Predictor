/**
 * Registerable upgrade handler so render() islands and React trees can
 * open checkout / scroll to pricing without importing App.js.
 */

export const UPGRADE_HOME_HREF = "/?upgrade=1#premium-upgrade";

let upgradeHandler = null;

/**
 * @param {(() => void) | null} handler
 */
export function registerUpgradeHandler(handler) {
  upgradeHandler = typeof handler === "function" ? handler : null;
}

function scrollToPremiumUpgrade() {
  if (typeof document === "undefined") return false;
  const target = document.getElementById("premium-upgrade");
  if (!target) return false;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

/**
 * Scroll to Premium pricing, or navigate home so App can show it.
 * Safe to call from any click handler (including fixture pages).
 */
export function requestUpgrade() {
  if (typeof upgradeHandler === "function") {
    upgradeHandler();
    return;
  }

  if (typeof window === "undefined") return;

  if (scrollToPremiumUpgrade()) return;

  // Fixture page / other routes: App is not mounted — go home with a flag
  // so App can scroll once #premium-upgrade exists.
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

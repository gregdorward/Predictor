/** While the hamburger nav is open, hide late-injected / reparented ad DOM. */

const SUPPRESS_CLASS = "ssh-nav-ad-suppressed";

const AD_ROOT_SELECTORS = [
  "#ssh-sidebar",
  ".SshSidebar",
  ".AdSenseUnit",
  ".FixturePage-contentBreak--adSlot",
  ".google-auto-placed",
  "ins.adsbygoogle",
  "ins.adsbygoogle-noablate",
  '[id*="adhesion" i]',
  '[class*="adhesion" i]',
  '[data-type="adhesion"]',
  'iframe[id^="google_ads_iframe"]',
  'div[id^="google_ads_iframe"]',
  '[id^="aswift_"]',
  'iframe[src*="googlesyndication"]',
  'iframe[src*="doubleclick.net"]',
  'iframe[src*="googleadservices.com"]',
];

function isInsideNavOverlay(node) {
  return Boolean(node?.closest?.(".MobileNavOverlay"));
}

function markSuppressed(node) {
  if (!node || node.nodeType !== 1 || isInsideNavOverlay(node)) return;
  if (node.classList.contains(SUPPRESS_CLASS)) return;
  node.classList.add(SUPPRESS_CLASS);
}

function suppressMatchingAds(root = document) {
  for (const selector of AD_ROOT_SELECTORS) {
    root.querySelectorAll(selector).forEach(markSuppressed);
  }
}

function suppressHighZIndexFixedAds() {
  document.body?.querySelectorAll("*").forEach((node) => {
    if (isLikelyHighZIndexAutoAd(node)) markSuppressed(node);
  });
}

function isLikelyHighZIndexAutoAd(node) {
  if (node?.nodeType !== 1 || isInsideNavOverlay(node)) return false;
  const id = node.id || "";
  if (/^google_ads_iframe|^aswift_/.test(id)) return true;
  if (node.matches?.("ins.adsbygoogle, .google-auto-placed")) return true;

  const style = node.getAttribute?.("style") || "";
  if (/position:\s*fixed/i.test(style) && /z-index:\s*\d{6,}/i.test(style)) {
    return true;
  }

  const computed =
    typeof window !== "undefined" && node instanceof HTMLElement
      ? window.getComputedStyle(node)
      : null;
  if (
    computed?.position === "fixed" &&
    Number.parseInt(computed.zIndex, 10) >= 1_000_000
  ) {
    return true;
  }
  return false;
}

function purgeAddedNode(node) {
  if (node.nodeType !== 1) return;
  if (isLikelyHighZIndexAutoAd(node)) {
    markSuppressed(node);
    return;
  }
  suppressMatchingAds(node);
  if (node.querySelectorAll) {
    for (const selector of AD_ROOT_SELECTORS) {
      node.querySelectorAll(selector).forEach(markSuppressed);
    }
  }
}

/**
 * @returns {() => void}
 */
export function startNavOpenAdSuppression() {
  if (typeof document === "undefined") return () => {};

  suppressMatchingAds();
  suppressHighZIndexFixedAds();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(purgeAddedNode);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    document.querySelectorAll(`.${SUPPRESS_CLASS}`).forEach((node) => {
      node.classList.remove(SUPPRESS_CLASS);
    });
  };
}
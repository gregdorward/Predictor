/** Blocks Google in-page Auto ads from injecting into marked UI (e.g. Premium upsell). */

export const AUTO_ADS_EXCLUDE_CLASS = "ssh-auto-ads-exclude";
export const AUTO_ADS_EXCLUDE_SELECTOR = `.${AUTO_ADS_EXCLUDE_CLASS}`;

const AUTO_AD_SELECTORS = ".google-auto-placed, ins.adsbygoogle";

function removeAutoAdsInsideExcludeZones() {
  document
    .querySelectorAll(
      `${AUTO_ADS_EXCLUDE_SELECTOR} ${AUTO_AD_SELECTORS}`
    )
    .forEach((node) => {
      node.remove();
    });
}

function purgeAddedNode(node) {
  if (node.nodeType !== 1) return;
  if (node.matches?.(AUTO_AD_SELECTORS) && node.closest(AUTO_ADS_EXCLUDE_SELECTOR)) {
    node.remove();
    return;
  }
  node.querySelectorAll?.(AUTO_AD_SELECTORS).forEach((ad) => {
    if (ad.closest(AUTO_ADS_EXCLUDE_SELECTOR)) ad.remove();
  });
}

/**
 * Strips auto-inserted units from exclude zones and watches for late injections.
 * @returns {() => void} disconnect
 */
export function startAutoAdsZoneExclusion() {
  if (typeof document === "undefined") return () => {};

  removeAutoAdsInsideExcludeZones();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(purgeAddedNode);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  return () => observer.disconnect();
}
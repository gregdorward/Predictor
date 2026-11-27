/** @jest-environment jsdom */

import { startNavOpenAdSuppression } from "./navOpenAdSuppression";

describe("navOpenAdSuppression", () => {
  it("marks reparented ad iframes and cleans up on stop", () => {
    const iframe = document.createElement("iframe");
    iframe.id = "google_ads_iframe_123";
    iframe.src = "https://googleads.g.doubleclick.net/example";
    document.body.appendChild(iframe);

    const stop = startNavOpenAdSuppression();
    expect(iframe.classList.contains("ssh-nav-ad-suppressed")).toBe(true);

    stop();
    expect(iframe.classList.contains("ssh-nav-ad-suppressed")).toBe(false);
    iframe.remove();
  });
});
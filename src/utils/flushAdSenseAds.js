let flushScheduled = false;
const requestedAds = new WeakSet();

/** Batch scheduling, but queue exactly one request per measurable ad element. */
export function flushAdSenseAds() {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;

  if (flushScheduled) return;
  flushScheduled = true;

  const run = () => {
    flushScheduled = false;
    const pending = document.querySelectorAll(
      "ins.adsbygoogle:not([data-adsbygoogle-status])"
    );
    pending.forEach((el) => {
      // A queued request may not receive Google's status attribute until the
      // script loads. Track it ourselves to avoid requesting it twice.
      if (requestedAds.has(el) || el.getBoundingClientRect().width <= 0) return;
      requestedAds.add(el);
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch (error) {
        // Leave other placements eligible even if one request fails.
        requestedAds.delete(el);
        console.warn("AdSense request failed", error);
      }
    });
  };

  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(run);
  } else {
    window.setTimeout(run, 0);
  }
}

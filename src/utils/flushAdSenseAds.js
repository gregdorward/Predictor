let flushScheduled = false;

/** Schedule a single adsbygoogle.push for all unfilled ins elements on the page. */
export function flushAdSenseAds() {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;

  if (flushScheduled) return;
  flushScheduled = true;

  const run = () => {
    flushScheduled = false;
    try {
      const pending = document.querySelectorAll(
        "ins.adsbygoogle:not([data-adsbygoogle-status])"
      );
      if (!pending.length) return;
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      /* TagError or script not ready */
    }
  };

  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(run);
  } else {
    window.setTimeout(run, 0);
  }
}

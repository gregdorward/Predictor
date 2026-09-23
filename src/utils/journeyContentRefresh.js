/** Ask Mediavine / Scriptwrapper to rescan #ssh-content after late-rendered markup. */
export function requestJourneyContentRefresh() {
  if (typeof window === "undefined") return;

  const run = () => {
    try {
      const journey = window.journey;
      if (typeof journey?.requestContentRefresh === "function") {
        journey.requestContentRefresh();
        return;
      }
      if (typeof journey?.requestJourneyContentRefresh === "function") {
        journey.requestJourneyContentRefresh();
        return;
      }
    } catch {
      /* Journey global missing or blocked */
    }

    try {
      const adthrive = window.adthrive;
      if (adthrive?.cmd?.push) {
        adthrive.cmd.push(() => {
          if (typeof adthrive.refresh === "function") {
            adthrive.refresh();
          }
        });
        return;
      }
    } catch {
      /* Mediavine cmd queue unavailable */
    }

    try {
      window.dispatchEvent?.(new Event("resize"));
    } catch {
      /* noop */
    }
  };

  try {
    window.requestAnimationFrame?.(() => {
      run();
      window.setTimeout?.(run, 500);
    });
  } catch {
    /* noop */
  }
}

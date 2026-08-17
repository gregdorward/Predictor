import { useRouter } from "next/router";

const BANNER_PATH = "/premier-league-2026-27/";

export default function WorldCupBanner() {
  const router = useRouter();
  const pathname = router?.pathname || "/";

  if (
    pathname.startsWith("/premier-league-2026-27") ||
    pathname.startsWith("/seasonpreviews")
  ) {
    return null;
  }

  return (
    <a
      href={BANNER_PATH}
      className="WC26Banner"
      aria-label="View Premier League 2026/27 season preview"
    >
      <div className="WC26Banner__inner">
        <span className="WC26Banner__badge">New</span>
        <span className="WC26Banner__flags" aria-hidden="true">
          ⚽
        </span>
        <span className="WC26Banner__copy">
          <strong className="WC26Banner__title">Premier League 2026/27 preview</strong>
          <span className="WC26Banner__sub">
            Season preview, Betfair odds, transfers &amp; all 20 club guides
          </span>
        </span>
        <span className="WC26Banner__cta" aria-hidden="true">
          View
          <span className="WC26Banner__arrow">→</span>
        </span>
      </div>
    </a>
  );
}

import { useRouter } from "next/router";

const BANNER_PATH = "/competitions/compare/";

export default function WorldCupBanner() {
  const router = useRouter();
  const pathname = router?.pathname || "/";

  if (pathname.startsWith("/competitions/compare")) {
    return null;
  }

  return (
    <a
      href={BANNER_PATH}
      className="WC26Banner"
      aria-label="Compare football leagues — goals, BTTS, cards and more"
    >
      <div className="WC26Banner__inner">
        <span className="WC26Banner__badge">New</span>
        <span className="WC26Banner__flags" aria-hidden="true">
          📊
        </span>
        <span className="WC26Banner__copy">
          <strong className="WC26Banner__title">Compare football leagues</strong>
          <span className="WC26Banner__sub">
            Goals, BTTS, cards &amp; corners — every league side by side
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

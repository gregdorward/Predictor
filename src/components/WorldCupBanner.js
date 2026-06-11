import { useLocation } from "react-router-dom";

const BANNER_PATH = "/worldcup2026/";

export default function WorldCupBanner() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/worldcup2026")) {
    return null;
  }

  return (
    <a
      href={BANNER_PATH}
      className="WC26Banner"
      aria-label="View FIFA World Cup 2026 tournament preview"
    >
      <div className="WC26Banner__inner">
        <span className="WC26Banner__badge">New</span>
        <span className="WC26Banner__flags" aria-hidden="true">
          🇺🇸 🇲🇽 🇨🇦
        </span>
        <span className="WC26Banner__copy">
          <strong className="WC26Banner__title">World Cup 2026</strong>
          <span className="WC26Banner__sub">
            News, group predictions, winner &amp; Golden Boot picks
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

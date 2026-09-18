import { useRouter } from "next/router";

const BANNER_PATH = "/articles/";

export default function WorldCupBanner() {
  const router = useRouter();
  const hidden = String(router.pathname || "").startsWith("/articles");

  return (
    <a
      href={BANNER_PATH}
      className={`WC26Banner${hidden ? " WC26Banner--hidden" : ""}`}
      aria-label="Articles and analysis — read more about our story"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
    >
      <div className="WC26Banner__inner">
        <span className="WC26Banner__badge">New</span>
        <span className="WC26Banner__flags" aria-hidden="true">
          📰
        </span>
        <span className="WC26Banner__copy">
          <strong className="WC26Banner__title">Articles &amp; analysis</strong>
          <span className="WC26Banner__sub">
            Read more about our story
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

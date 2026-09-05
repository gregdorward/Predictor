import { useRouter } from "next/router";

const BANNER_PATH = "/articles/";

export default function WorldCupBanner() {
  const router = useRouter();
  const pathname = router?.pathname || "/";

  if (pathname.startsWith("/articles")) {
    return null;
  }

  return (
    <a
      href={BANNER_PATH}
      className="WC26Banner"
      aria-label="Articles and analysis — read more about our story"
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

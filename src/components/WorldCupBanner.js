import { useRouter } from "next/router";

const BANNER_PATH = "/strength-rankings/";

export default function WorldCupBanner() {
  const router = useRouter();
  const hidden = String(router.pathname || "").startsWith("/strength-rankings");

  return (
    <a
      href={BANNER_PATH}
      className={`WC26Banner${hidden ? " WC26Banner--hidden" : ""}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
    >
      <div className="WC26Banner__inner">
        <span className="WC26Banner__badge">New</span>
        <span className="WC26Banner__copy">
          <strong className="WC26Banner__title">
            <span className="WC26Banner__label WC26Banner__label--short">
              Team Strength Rankings
            </span>
            <span className="WC26Banner__label WC26Banner__label--long">
              Team Strength Rankings - Domestic and Global
            </span>
          </strong>
        </span>
        <span className="WC26Banner__cta" aria-hidden="true">
          View
          <span className="WC26Banner__arrow">→</span>
        </span>
      </div>
    </a>
  );
}

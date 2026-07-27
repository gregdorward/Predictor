import { useEffect, useRef } from "react";
import { useShowGuestAds } from "../hooks/useShowGuestAds";

export const ADSENSE_CLIENT = "ca-pub-2835838153738108";

export const AD_SLOTS = {
  fixtureTop: "6569554999",
  fixtureMid: "1153310858",
  statsMid: "7687883902",
  articleInArticle: "9819223224",
  competitionsIndex: "3935386867",
  competitionPage: "7527147510",
  fixturesIndexBottom: "9371546376",
};

const SCRIPT_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

function ensureAdSenseScript() {
  if (typeof document === "undefined") return;
  if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = SCRIPT_SRC;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

/**
 * Manual AdSense unit. Loads adsbygoogle.js once on first mount.
 * Hidden for paid subscribers and outside production.
 */
export default function GoogleAdUnit({
  slot,
  format,
  layout,
  fullWidthResponsive = false,
  className = "",
}) {
  const showAds = useShowGuestAds();
  const insRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!showAds || process.env.NODE_ENV !== "production") return undefined;
    if (pushedRef.current || !insRef.current) return undefined;

    ensureAdSenseScript();

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      // AdSense may throw if the slot was already initialised.
    }

    return undefined;
  }, [showAds, slot]);

  if (!showAds || process.env.NODE_ENV !== "production") return null;

  const style =
    layout === "in-article"
      ? { display: "block", textAlign: "center" }
      : { display: "block" };

  return (
    <aside
      className={`GoogleAdUnit${className ? ` ${className}` : ""}`}
      aria-label="Advertisement"
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ ...style, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        {...(format ? { "data-ad-format": format } : {})}
        {...(layout ? { "data-ad-layout": layout } : {})}
        {...(fullWidthResponsive
          ? { "data-full-width-responsive": "true" }
          : {})}
      />
    </aside>
  );
}

export function FixtureTopAd() {
  return (
    <GoogleAdUnit
      slot={AD_SLOTS.fixtureTop}
      format="fluid"
      layout="in-article"
      className="GoogleAdUnit--fixtureTop"
    />
  );
}

export function FixtureMidAd() {
  return (
    <GoogleAdUnit
      slot={AD_SLOTS.fixtureMid}
      format="auto"
      className="GoogleAdUnit--fixtureMid"
    />
  );
}

export function StatsMidAd() {
  return (
    <GoogleAdUnit
      slot={AD_SLOTS.statsMid}
      format="fluid"
      layout="in-article"
      className="GoogleAdUnit--statsMid"
    />
  );
}

export function ArticleInArticleAd() {
  return (
    <GoogleAdUnit
      slot={AD_SLOTS.articleInArticle}
      format="fluid"
      layout="in-article"
      className="GoogleAdUnit--article"
    />
  );
}

export function CompetitionsIndexAd() {
  return (
    <GoogleAdUnit
      slot={AD_SLOTS.competitionsIndex}
      format="fluid"
      layout="in-article"
      className="GoogleAdUnit--competitionsIndex"
    />
  );
}

export function CompetitionPageAd() {
  return (
    <GoogleAdUnit
      slot={AD_SLOTS.competitionPage}
      format="fluid"
      layout="in-article"
      className="GoogleAdUnit--competitionPage"
    />
  );
}

export function FixturesIndexBottomAd() {
  return (
    <GoogleAdUnit
      slot={AD_SLOTS.fixturesIndexBottom}
      format="fluid"
      layout="in-article"
      className="GoogleAdUnit--fixturesIndex"
    />
  );
}

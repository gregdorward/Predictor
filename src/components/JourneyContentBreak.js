import { ADSENSE_SLOTS } from "../constants/adsense";
import AdSenseUnit from "./AdSenseUnit";

/** Structural break between major sections; empty breaks render an AdSense unit. */
export default function JourneyContentBreak({
  children,
  slot = ADSENSE_SLOTS.ARTICLE_IN_ARTICLE,
  variant = "inArticle",
  placementId = "content-break",
  lazy = false,
}) {
  const hasCopy =
    children != null &&
    children !== false &&
    !(typeof children === "string" && children.trim() === "");

  if (!hasCopy) {
    return (
      <div
        className="FixturePage-contentBreak FixturePage-contentBreak--adSlot"
        aria-hidden="true"
      >
        <AdSenseUnit
          slot={slot}
          variant={variant}
          placementId={placementId}
          lazy={lazy}
        />
      </div>
    );
  }

  return <p className="FixturePage-contentBreak">{children}</p>;
}

import AdSenseUnit from "./AdSenseUnit";
import StatsFooterAd from "./StatsFooterAd";
import { ADSENSE_SLOTS } from "../constants/adsense";

/** Display unit for static / editorial pages (AdSense). */
export function StaticPageAboveFoldAd({ placementId }) {
  return (
    <AdSenseUnit
      slot={ADSENSE_SLOTS.COMPETITIONS_ABOVE_FOLD}
      variant="display"
      placementId={placementId}
    />
  );
}

export { StatsFooterAd as StaticPageFooterAd };

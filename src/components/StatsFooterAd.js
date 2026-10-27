import AdSenseUnit from "./AdSenseUnit";
import { ADSENSE_SLOTS } from "../constants/adsense";

export default function StatsFooterAd() {
  return (
    <div className="FixturePage-footerAd">
      <AdSenseUnit
        slot={ADSENSE_SLOTS.STATS_FOOTER_MULTIPLEX}
        variant="multiplex"
        placementId="stats-footer-multiplex"
      />
    </div>
  );
}

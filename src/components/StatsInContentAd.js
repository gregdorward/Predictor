import AdSenseUnit from "./AdSenseUnit";
import { ADSENSE_SLOTS } from "../constants/adsense";

export default function StatsInContentAd() {
  return (
    <div className="FixturePage-footerAd">
      <AdSenseUnit
        slot={ADSENSE_SLOTS.STATS_BTTS_O25_IN_CONTENT}
        placementId="stats-btts-o25-in-content"
        lazy={false}
      />
    </div>
  );
}

import PageMeta from "../src/components/PageMeta";
import SiteHeader from "../src/components/SiteHeader";
import GuestLandingGate from "../src/components/GuestLandingGate";
import DeferredApp from "../src/components/DeferredApp";
import JourneyContentBreak from "../src/components/JourneyContentBreak";
import { ADSENSE_SLOTS } from "../src/constants/adsense";

export default function HomePage() {
  return (
    <>
      <PageMeta />
      <SiteHeader showThemeToggle withFooter>
        <div id="ssh-content">
          <GuestLandingGate />
          <JourneyContentBreak
            slot={ADSENSE_SLOTS.HOME_MID_CONTENT}
            placementId="home-after-gate"
          />
          <DeferredApp shellMounted />
        </div>
      </SiteHeader>
    </>
  );
}

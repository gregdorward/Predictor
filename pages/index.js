import PageMeta from "../src/components/PageMeta";
import SiteHeader from "../src/components/SiteHeader";
import GuestLandingGate from "../src/components/GuestLandingGate";
import DeferredApp from "../src/components/DeferredApp";
import { StaticPageFooterAd } from "../src/components/StaticPageAds";

export default function HomePage() {
  return (
    <>
      <PageMeta />
      <SiteHeader showThemeToggle withFooter beforeFooter={<StaticPageFooterAd />}>
        <div id="ssh-content">
          <GuestLandingGate />
          <DeferredApp shellMounted />
        </div>
      </SiteHeader>
    </>
  );
}

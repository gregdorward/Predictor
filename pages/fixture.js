import dynamic from "next/dynamic";
import PageMeta from "../src/components/PageMeta";
import SiteHeader from "../src/components/SiteHeader";
import { StaticPageFooterAd } from "../src/components/StaticPageAds";

const TeamPage = dynamic(() => import("../src/components/Team"), {
  ssr: false,
});

export default function Fixture() {
  return (
    <>
      <PageMeta />
      <SiteHeader showThemeToggle withFooter beforeFooter={<StaticPageFooterAd />}>
        <div id="ssh-content">
          <TeamPage />
        </div>
      </SiteHeader>
    </>
  );
}

import { useState } from "react";
import PageMeta from "../src/components/PageMeta";
import SiteHeader from "../src/components/SiteHeader";
import GuestLandingGate from "../src/components/GuestLandingGate";
import DeferredApp from "../src/components/DeferredApp";
import { buildHomepageTodayLinks } from "../src/seo/statPageSeoConfig";
import {
  loadBttsTeamRows,
  loadHighestScoringLeagueRows,
  loadO25TeamRows,
} from "../src/seo/statPageData";

export default function HomePage({ todayLinks = [] }) {
  const [landingVisible, setLandingVisible] = useState(true);

  return (
    <>
      <PageMeta />
      <SiteHeader showThemeToggle withFooter>
        <div id="ssh-content">
          {landingVisible ? <GuestLandingGate todayLinks={todayLinks} /> : null}
          <DeferredApp shellMounted onAppReady={() => setLandingVisible(false)} />
        </div>
      </SiteHeader>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const [bttsTeams, o25Teams, leagues] = await Promise.all([
      loadBttsTeamRows(),
      loadO25TeamRows(),
      loadHighestScoringLeagueRows(),
    ]);

    return {
      props: {
        todayLinks: buildHomepageTodayLinks({ bttsTeams, o25Teams, leagues }),
      },
    };
  } catch {
    return { props: { todayLinks: [] } };
  }
}

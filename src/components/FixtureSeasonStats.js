import { useCallback, useMemo, useState } from "react";
import Stats from "./createStatsDiv";
import {
  buildAllStatsProps,
  calculateComparisonStatusMap,
  getInvertedComparisonMap,
} from "../logic/allStatsProps";
import { useAuth } from "../logic/authProvider";

function FixtureSeasonStats({ match }) {
  const { isPaidUser, loading, user } = useAuth();
  const lockPremiumSections = !isPaidUser && !(loading && user);
  const [openSections, setOpenSections] = useState({});

  const getCollapsableProps = useCallback(
    (sectionName) => ({
      isOpen: !!openSections[sectionName],
      onTriggerToggle: () =>
        setOpenSections((prev) => ({
          ...prev,
          [sectionName]: !prev[sectionName],
        })),
    }),
    [openSections]
  );

  const seasonStats = match?.seasonStats ?? {};
  const homeForm = match?.formHome;
  const awayForm = match?.formAway;

  const homeAllStatsProps = useMemo(
    () =>
      buildAllStatsProps({
        match,
        form: homeForm,
        teamStats: seasonStats.homeTeamStats,
        side: "home",
        getCollapsableProps,
        formTextString: seasonStats.formSummaries?.home,
        bttsArray: seasonStats.bttsArrayHome,
        injuryImpact: undefined,
      }),
    [match, homeForm, seasonStats, getCollapsableProps]
  );

  const awayAllStatsProps = useMemo(
    () =>
      buildAllStatsProps({
        match,
        form: awayForm,
        teamStats: seasonStats.awayTeamStats,
        side: "away",
        getCollapsableProps,
        formTextString: seasonStats.formSummaries?.away,
        bttsArray: seasonStats.bttsArrayAway,
        injuryImpact: undefined,
      }),
    [match, awayForm, seasonStats, getCollapsableProps]
  );

  const comparisonStatusMap = useMemo(
    () => calculateComparisonStatusMap(homeAllStatsProps, awayAllStatsProps),
    [homeAllStatsProps, awayAllStatsProps]
  );

  const invertedComparisonMap = useMemo(
    () => getInvertedComparisonMap(comparisonStatusMap),
    [comparisonStatusMap]
  );

  if (!homeForm || !awayForm) {
    return null;
  }

  return (
    <section className="FixturePage-seasonStats">
      <h3 className="FixturePage-statGroupTitle">Season Stats</h3>
      {lockPremiumSections ? (
        <p className="FixturePage-seasonStatsPreviewNote">
          Key Stats is a free preview. Upgrade to Premium to unlock all stat categories.
        </p>
      ) : null}
      <div className="flex-container">
        <div className="flex-childOne">
          <ul>
            <Stats
              {...homeAllStatsProps}
              getCollapsableProps={getCollapsableProps}
              comparisonStatusMap={comparisonStatusMap}
              lockPremiumSections={lockPremiumSections}
            />
          </ul>
        </div>
        <div className="flex-childTwo">
          <ul>
            <Stats
              {...awayAllStatsProps}
              getCollapsableProps={getCollapsableProps}
              comparisonStatusMap={invertedComparisonMap}
              lockPremiumSections={lockPremiumSections}
            />
          </ul>
        </div>
      </div>
    </section>
  );
}

export default FixtureSeasonStats;

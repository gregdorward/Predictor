import { useMemo, useState } from "react";
import {
  buildAllStatsProps,
  calculateComparisonStatusMap,
} from "../logic/allStatsProps";
import { useAuth } from "../logic/authProvider";
import { ALL_STATS_SECTIONS } from "../logic/statComparisonSections";
import PremiumUpsell from "./PremiumUpsell";
import { StatCompareRows } from "./StatComparison";

const FREE_CATEGORY_ID = "key";

function FixtureSeasonStats({ match, statsFullAccess = false }) {
  const { isPaidUser, loading, user } = useAuth();
  const premiumUnlocked = statsFullAccess || isPaidUser;
  const lockPremiumSections = !premiumUnlocked && !(loading && user);
  const [activeCategoryId, setActiveCategoryId] = useState(FREE_CATEGORY_ID);

  const seasonStats = match?.seasonStats ?? {};
  const homeForm = match?.formHome;
  const awayForm = match?.formAway;

  const homeStats = useMemo(
    () =>
      buildAllStatsProps({
        match,
        form: homeForm,
        teamStats: seasonStats.homeTeamStats,
        side: "home",
        getCollapsableProps: () => ({}),
        formTextString: seasonStats.formSummaries?.home,
        bttsArray: seasonStats.bttsArrayHome,
        injuryImpact: undefined,
      }),
    [match, homeForm, seasonStats]
  );

  const awayStats = useMemo(
    () =>
      buildAllStatsProps({
        match,
        form: awayForm,
        teamStats: seasonStats.awayTeamStats,
        side: "away",
        getCollapsableProps: () => ({}),
        formTextString: seasonStats.formSummaries?.away,
        bttsArray: seasonStats.bttsArrayAway,
        injuryImpact: undefined,
      }),
    [match, awayForm, seasonStats]
  );

  const comparisonStatusMap = useMemo(
    () => calculateComparisonStatusMap(homeStats, awayStats),
    [homeStats, awayStats]
  );

  if (!homeForm || !awayForm) {
    return null;
  }

  const activeCategory =
    ALL_STATS_SECTIONS.find((category) => category.id === activeCategoryId) ||
    ALL_STATS_SECTIONS[0];
  const categoryLocked = lockPremiumSections && !activeCategory.free;

  return (
    <section className="FixturePage-seasonStats">
      <div className="FixturePage-compareHeader">
        <h3 className="FixturePage-statGroupTitle">Season Stats</h3>
        <div className="FixturePage-compareTeams" aria-hidden="true">
          <span className="FixturePage-compareTeam FixturePage-compareTeam--home">
            {match.homeTeam}
          </span>
          <span className="FixturePage-compareTeam FixturePage-compareTeam--away">
            {match.awayTeam}
          </span>
        </div>
      </div>

      <div className="FixturePage-statTabs" role="tablist" aria-label="Season stat categories">
        {ALL_STATS_SECTIONS.map((category) => {
          const locked = lockPremiumSections && !category.free;
          const selected = category.id === activeCategory.id;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={
                locked ? `${category.label} (Premium)` : category.label
              }
              className={`FixturePage-statTab${selected ? " FixturePage-statTab--active" : ""}${
                locked ? " FixturePage-statTab--locked" : ""
              }`}
              onClick={() => setActiveCategoryId(category.id)}
            >
              {category.label}
              {locked ? <span className="FixturePage-statTabLock">Premium</span> : null}
            </button>
          );
        })}
      </div>

      {categoryLocked ? (
        <PremiumUpsell
          variant="compact"
          className="FixturePage-seasonStatsUpsell"
          headline={`Unlock ${activeCategory.label.toLowerCase()} with Premium`}
          description="Key Stats stays free. Premium unlocks attacking, defensive, possession, form and every other season category, plus unlimited predictions and tip lists."
        />
      ) : (
        <div className="FixturePage-compareRows StatCompare" role="tabpanel">
          <p className="StatCompare-key">The solid bar in each row has the edge.</p>
          <StatCompareRows
            rows={activeCategory.rows}
            homeStats={homeStats}
            awayStats={awayStats}
            statusMap={comparisonStatusMap}
            homeName={match.homeTeam}
            awayName={match.awayTeam}
          />
        </div>
      )}

      {lockPremiumSections && !categoryLocked ? (
        <p className="FixturePage-seasonStatsPreviewNote">
          Key Stats is free. Premium unlocks attacking, defensive, possession, form and more.
        </p>
      ) : null}
    </section>
  );
}

export default FixtureSeasonStats;

import { useMemo, useState } from "react";
import {
  buildAllStatsProps,
  calculateComparisonStatusMap,
} from "../logic/allStatsProps";
import { useAuth } from "../logic/authProvider";
import { isMissingStat, STAT_FALLBACK } from "../utils/formatStat";

const FREE_CATEGORY_ID = "key";

const SEASON_STAT_CATEGORIES = [
  {
    id: "key",
    label: "Key Stats",
    free: true,
    rows: [
      { key: "leaguePosition", label: "League position" },
      { key: "goals", label: "Avg goals scored" },
      { key: "conceeded", label: "Avg goals conceded" },
      { key: "XG", label: "Avg xG" },
      { key: "XGConceded", label: "Avg xG conceded" },
      { key: "goalDifference", label: "Goal difference" },
      { key: "goalDifferenceHomeOrAway", label: "Goal difference (venue)" },
      { key: "possession", label: "Avg possession" },
    ],
  },
  {
    id: "attacking",
    label: "Attacking",
    rows: [
      { key: "shots", label: "Avg shots" },
      { key: "sot", label: "Avg shots on target" },
      { key: "shootingAccuracy", label: "Shooting accuracy" },
      { key: "goalConversionRate", label: "Shot conversion" },
      { key: "dangerousAttacks", label: "Avg dangerous attacks" },
      { key: "shotsInsideBox", label: "Shots inside box" },
      { key: "shotsFromOutsideTheBox", label: "Shots outside box" },
      { key: "shotsFromInsideBoxPercentage", label: "Shots inside box %" },
      { key: "goalsFromInsideTheBox", label: "Goals inside box" },
      { key: "goalsFromOutsideTheBox", label: "Goals outside box" },
      { key: "fastBreakShots", label: "Fast-break shots" },
      { key: "bigChances", label: "Big chances created" },
      { key: "bigChancesMissed", label: "Big chances missed" },
      { key: "bigChanceConversionRate", label: "Big-chance conversion" },
    ],
  },
  {
    id: "defensive",
    label: "Defensive",
    rows: [
      { key: "cleansheetPercentage", label: "Clean sheet %" },
      { key: "shotsOnTargetAgainst", label: "Avg SOT against" },
      { key: "shotsInsideBoxAgainst", label: "Shots inside box against" },
      { key: "shotsFromOutsideTheBoxAgainst", label: "Shots outside box against" },
      { key: "shotsInsideBoxPercentAgainst", label: "Shots inside box against %" },
      { key: "bigChancesConceded", label: "Big chances against" },
      { key: "accurateCrossesAgainst", label: "Accurate crosses against" },
      { key: "errorsLeadingToShotAgainst", label: "Errors leading to shot" },
    ],
  },
  {
    id: "possession",
    label: "In Possession",
    rows: [
      { key: "PPAA", label: "Passes per attacking action" },
      { key: "accuratePassesPercentage", label: "Accurate passes" },
      { key: "accuratePassesOpponentHalf", label: "Accurate attacking passes" },
      { key: "accuratePassesDefensiveHalf", label: "Accurate own-half passes" },
      { key: "longBallPercentage", label: "Long-ball %" },
      { key: "accurateLongBallsPercentage", label: "Accurate long balls" },
      { key: "accurateCrosses", label: "Accurate crosses" },
      { key: "dribbleAttempts", label: "Dribble attempts" },
      { key: "successfulDribbles", label: "Successful dribbles" },
      { key: "fastBreaksLeadingToShot", label: "Fast breaks → shot" },
    ],
  },
  {
    id: "outOfPossession",
    label: "Out of Possession",
    rows: [
      { key: "PPDA", label: "Passes per defensive action" },
      { key: "tackles", label: "Tackles per game" },
      { key: "ballRecovery", label: "Ball recoveries per game" },
      { key: "interceptions", label: "Interceptions per game" },
      { key: "duelsWonPercentage", label: "Duels won" },
      { key: "aerialDuelsWonPercentage", label: "Aerial duels won" },
      { key: "accurateLongBallsAgainstPercentage", label: "Long balls against success" },
    ],
  },
  {
    id: "form",
    label: "Form",
    rows: [
      { key: "ppg", label: "Season PPG" },
      { key: "formTrend[0]", label: "Last 10 PPG", getValue: (stats) => stats.formTrend?.[0] },
      { key: "formTrend[1]", label: "Last 6 PPG", getValue: (stats) => stats.formTrend?.[1] },
      { key: "formTrend[2]", label: "Last 5 PPG", getValue: (stats) => stats.formTrend?.[2] },
      { key: "winPercentage", label: "Venue PPG" },
    ],
  },
  {
    id: "discipline",
    label: "Discipline",
    rows: [
      { key: "CardsPerGame", label: "Yellow cards per game" },
      { key: "RedCardsPerGame", label: "Red cards per game" },
      { key: "FoulsPerGame", label: "Fouls per game" },
      { key: "PenaltiesConceded", label: "Penalties conceded" },
    ],
  },
  {
    id: "setPieces",
    label: "Set Pieces",
    rows: [
      { key: "CornersAverage", label: "Corners average" },
      { key: "FreeKickGoals", label: "Free-kick goals" },
    ],
  },
];

function displayStat(value) {
  if (isMissingStat(value)) return STAT_FALLBACK;
  return value;
}

function CompareRow({ label, homeValue, awayValue, homeStatus }) {
  return (
    <div className="FixturePage-compareRow">
      <span
        className={`FixturePage-compareValue FixturePage-compareValue--home${
          homeStatus === "better" ? " FixturePage-compareValue--better" : ""
        }${homeStatus === "worse" ? " FixturePage-compareValue--worse" : ""}`}
      >
        {displayStat(homeValue)}
      </span>
      <span className="FixturePage-compareLabel">{label}</span>
      <span
        className={`FixturePage-compareValue FixturePage-compareValue--away${
          homeStatus === "worse" ? " FixturePage-compareValue--better" : ""
        }${homeStatus === "better" ? " FixturePage-compareValue--worse" : ""}`}
      >
        {displayStat(awayValue)}
      </span>
    </div>
  );
}

function FixtureSeasonStats({ match }) {
  const { isPaidUser, loading, user } = useAuth();
  const lockPremiumSections = !isPaidUser && !(loading && user);
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
    SEASON_STAT_CATEGORIES.find((category) => category.id === activeCategoryId) ||
    SEASON_STAT_CATEGORIES[0];
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
        {SEASON_STAT_CATEGORIES.map((category) => {
          const locked = lockPremiumSections && !category.free;
          const selected = category.id === activeCategory.id;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={selected}
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
        <div className="FixturePage-seasonStatsLocked">
          <p>
            Unlock {activeCategory.label.toLowerCase()} and every other season category with
            Premium.
          </p>
          <a className="FixturePage-upgradeLink" href="/">
            Upgrade to Premium
          </a>
        </div>
      ) : (
        <div className="FixturePage-compareRows" role="tabpanel">
          {activeCategory.rows.map((row) => {
            const homeValue = row.getValue
              ? row.getValue(homeStats)
              : homeStats[row.key];
            const awayValue = row.getValue
              ? row.getValue(awayStats)
              : awayStats[row.key];
            return (
              <CompareRow
                key={row.key}
                label={row.label}
                homeValue={homeValue}
                awayValue={awayValue}
                homeStatus={comparisonStatusMap[row.key]}
              />
            );
          })}
        </div>
      )}

      {lockPremiumSections ? (
        <p className="FixturePage-seasonStatsPreviewNote">
          Key Stats is free. Premium unlocks attacking, defensive, possession, form and more.
        </p>
      ) : null}
    </section>
  );
}

export default FixtureSeasonStats;

import { useMemo } from "react";
import StatComparison from "./StatComparison";
import FormContextCompare from "./FormContextCompare";
import ExpectedPointsBullet from "./charts/ExpectedPointsBullet";
import PremiumBlurGate from "./PremiumBlurGate";
import SeasonPpgChart from "./SeasonPpgChart";
import AttackDefenceMetricTrendTables from "./AttackDefenceMetricTrendTables";
import { GoalTimingHeatShare } from "./GoalTimingHeatStrip";
import MultiTypeChart, { sharedXgDiffRange } from "./MultitypeChart";
import ShareableVisual from "./ShareableVisual";
import { sanitizeImageFilename } from "../utils/captureElementImage";
import { RECENT_FORM_ROWS } from "../logic/statComparisonSections";
import {
  buildRecentFormComparisonStats,
  buildVenueFormComparisonStats,
  calculateComparisonStatusMap,
} from "../logic/allStatsProps";
import { allLeagueResultsArrayOfObjects } from "../logic/getFixtures";
import { getLeagueFixturesByLeagueId } from "../utils/leagueResultsAccess";
import {
  buildCompetitionAverageTeam,
  completedFixturesBefore,
} from "../logic/competitionAverageTeam";
import { buildGoalTimingRates } from "../utils/goalTimingHeatmap";
import {
  hasDetailedAllTeamResults,
  shouldUseFootyStatsFixtureTemplate,
} from "../logic/fixturePageFootyStatsFallback";

function competitionAverages(match) {
  const leagueFixtures = getLeagueFixturesByLeagueId(
    allLeagueResultsArrayOfObjects,
    match?.leagueID
  );
  if (!leagueFixtures?.length) {
    return null;
  }
  const averageTeam = buildCompetitionAverageTeam(leagueFixtures, match.date);
  if (!averageTeam?.overall) {
    return null;
  }
  const label = match.leagueDesc || match.leagueName || "this competition";
  return {
    season: {
      home: averageTeam.overall,
      away: averageTeam.overall,
    },
    venue: {
      home: averageTeam.home,
      away: averageTeam.away,
    },
    seasonNote: `Avg is the season average for a team in ${label}.`,
    venueNote: `Avg is the season average for home and away sides in ${label}.`,
    competitionAverageOverall: averageTeam.overall,
    goalTimingRates: buildGoalTimingRates(
      completedFixturesBefore(leagueFixtures, match.date)
    ),
  };
}

function canShowExpectedPoints(homeForm, awayForm) {
  if (!hasDetailedAllTeamResults(homeForm) || !hasDetailedAllTeamResults(awayForm)) {
    return false;
  }
  return (
    homeForm?.trueForm !== undefined &&
    awayForm?.trueForm !== undefined &&
    Number.isFinite(Number(homeForm.totalExpectedPoints)) &&
    Number.isFinite(Number(awayForm.totalExpectedPoints))
  );
}

export function matchHasRichFixtureHistory(match) {
  return match && !shouldUseFootyStatsFixtureTemplate(match);
}

export default function FixtureHistoryPanels({ match, statsFullAccess = false }) {
  const homeForm = match?.formHome;
  const awayForm = match?.formAway;

  const ctx = useMemo(() => competitionAverages(match), [match]);

  if (!matchHasRichFixtureHistory(match) || !homeForm || !awayForm) {
    return null;
  }

  const showLast5 = Boolean(homeForm.twoDGoalsArray);

  const homeLast5Data = buildRecentFormComparisonStats(homeForm);
  const awayLast5Data = buildRecentFormComparisonStats(awayForm);
  const last5ComparisonMap = calculateComparisonStatusMap(
    homeLast5Data,
    awayLast5Data
  );

  const homeOnlyData = buildVenueFormComparisonStats(homeForm, "home");
  const awayOnlyData = buildVenueFormComparisonStats(awayForm, "away");
  const hOrAComparisonMap = calculateComparisonStatusMap(
    homeOnlyData,
    awayOnlyData
  );

  const competitionGamesLabel = match.leagueDesc
    ? `${match.leagueDesc} games`
    : "Competition games";

  const homeResults = homeForm.allTeamResults ?? [];
  const awayResults = awayForm.allTeamResults ?? [];
  const showSeasonPpg =
    !match.apiFormOnly &&
    homeResults.length > 0 &&
    awayResults.length > 0;

  const showGoalTiming =
    homeForm?.goalTiming?.hasData || awayForm?.goalTiming?.hasData;

  const showXgDiff =
    Array.isArray(homeForm.twoDGoalsArray) && Array.isArray(awayForm.twoDGoalsArray);

  return (
    <div className="FixturePage-historyPanels">
      {showLast5 ? (
        <section className="FixturePage-historySection">
          <h3 className="FixturePage-statGroupTitle">Last 5 games</h3>
          <PremiumBlurGate locked={!statsFullAccess}>
            <div className={!statsFullAccess ? "blurred" : undefined}>
              <StatComparison
                rows={RECENT_FORM_ROWS}
                homeStats={homeLast5Data}
                awayStats={awayLast5Data}
                statusMap={last5ComparisonMap}
                homeName={match.homeTeam}
                awayName={match.awayTeam}
                homeContext="Last 5 games"
                awayContext="Last 5 games"
                averages={ctx?.season}
                averageNote={ctx?.seasonNote}
              />
            </div>
          </PremiumBlurGate>
        </section>
      ) : null}

      {showLast5 ? (
        <section className="FixturePage-historySection">
          <h3 className="FixturePage-statGroupTitle">Home / away games</h3>
          <PremiumBlurGate locked={!statsFullAccess}>
            <div className={!statsFullAccess ? "blurred" : undefined}>
              <StatComparison
                rows={RECENT_FORM_ROWS}
                homeStats={homeOnlyData}
                awayStats={awayOnlyData}
                statusMap={hOrAComparisonMap}
                homeName={match.homeTeam}
                awayName={match.awayTeam}
                homeContext="Home games"
                awayContext="Away games"
                averages={ctx?.venue}
                averageNote={ctx?.venueNote}
              />
            </div>
          </PremiumBlurGate>
        </section>
      ) : null}

      <FormContextCompare
        homeTeam={match.homeTeam}
        awayTeam={match.awayTeam}
        homeMetrics={homeForm.contextMetrics}
        awayMetrics={awayForm.contextMetrics}
      />

      {canShowExpectedPoints(homeForm, awayForm) ? (
        <section className="FixturePage-historySection FixturePage-expectedPoints">
          <h3 className="FixturePage-statGroupTitle">Points vs the odds</h3>
          <p className="FixturePage-expectedPointsNote">
            Points won against what the odds expected, last 5 games. Expected
            points come from the implied probability of each match&apos;s odds.
          </p>
          <ExpectedPointsBullet
            rows={[
              {
                team: match.homeTeam,
                actual: homeForm.pointsSum5,
                expected: homeForm.totalExpectedPoints,
                delta: homeForm.trueForm,
              },
              {
                team: match.awayTeam,
                actual: awayForm.pointsSum5,
                expected: awayForm.totalExpectedPoints,
                delta: awayForm.trueForm,
              },
            ]}
          />
        </section>
      ) : null}

      {showSeasonPpg ? (
        <section className="FixturePage-historySection">
          <h3 className="FixturePage-statGroupTitle">Season PPG</h3>
          <PremiumBlurGate locked={!statsFullAccess}>
            <ShareableVisual
              filename={sanitizeImageFilename(
                `${match.homeTeam}-vs-${match.awayTeam}-season-form`
              )}
              shareTitle={`${match.homeTeam} vs ${match.awayTeam} - season form`}
              className={`rankings-wrapper${!statsFullAccess ? " rankings-wrapper--locked" : ""}`}
              hideActions={!statsFullAccess}
            >
              <div
                {...(statsFullAccess ? { "data-share-capture": true } : {})}
                className={`rankings-container${!statsFullAccess ? " blurred" : ""}`}
              >
                <SeasonPpgChart
                  homeTeam={match.homeTeam}
                  awayTeam={match.awayTeam}
                  homeResults={homeResults}
                  awayResults={awayResults}
                />
              </div>
            </ShareableVisual>
          </PremiumBlurGate>
        </section>
      ) : null}

      {homeResults.length && awayResults.length ? (
        <section className="FixturePage-historySection">
          <AttackDefenceMetricTrendTables
            team1={match.homeTeam}
            team2={match.awayTeam}
            homeBadge={match.homeBadge}
            awayBadge={match.awayBadge}
            homeResults={homeResults}
            awayResults={awayResults}
            averages={ctx?.competitionAverageOverall ?? null}
            text={`${competitionGamesLabel} - attack & defence trends`}
          />
        </section>
      ) : null}

      {showGoalTiming ? (
        <section className="FixturePage-historySection">
          <GoalTimingHeatShare
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            homeData={homeForm.goalTiming}
            awayData={awayForm.goalTiming}
            averageRates={ctx?.goalTimingRates}
            competitionName={match.leagueDesc || match.leagueName}
            text="Goal timing"
          />
        </section>
      ) : null}

      {showXgDiff ? (
        <section className="FixturePage-historySection FixturePage-xgDiffCharts">
          <h3 className="FixturePage-statGroupTitle">xG difference over time</h3>
          <div className="FixturePage-xgDiffGrid">
            <MultiTypeChart
              dataArray={homeForm.twoDGoalsArray}
              text={`${homeForm.teamName || match.homeTeam} xG diff (${competitionGamesLabel})`}
              yRange={sharedXgDiffRange(
                homeForm.twoDGoalsArray,
                awayForm.twoDGoalsArray
              )}
            />
            <MultiTypeChart
              dataArray={awayForm.twoDGoalsArray}
              text={`${awayForm.teamName || match.awayTeam} xG diff (${competitionGamesLabel})`}
              yRange={sharedXgDiffRange(
                homeForm.twoDGoalsArray,
                awayForm.twoDGoalsArray
              )}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
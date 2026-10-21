import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { CreateBadge } from "./createBadge";
import { predictMatchById } from "../logic/predictMatchById";
import { mapMatchToFixturePageData } from "../logic/buildSingleMatch";
import {
  buildLegacyFixtureSections,
  FIXTURE_MARKETS_SNAPSHOT_LABELS,
} from "../logic/fixturePageMetrics";
import FixtureSeasonStats from "./FixtureSeasonStats";
import ShareableVisual from "./ShareableVisual";
import SharePageLinkButton from "./SharePageLinkButton";
import { sanitizeImageFilename } from "../utils/captureElementImage";
import { buildMatchShareUrl } from "../utils/shareMatchUrl";
import "./charts/chartSetup";
import { Bar } from "react-chartjs-2";
import { useChartTheme, getChartColors, tooltipStyle } from "./charts/chartTheme";
import { barValueLabelsPlugin } from "./charts/chartPlugins";
import { growFromZero } from "./charts/chartMotion";
import LazyChart from "./charts/LazyChart";
import SplitBar from "./charts/SplitBar";
import { useFixturePredictionUnlock } from "../logic/useFixturePredictionUnlock";
import FeaturedFreeBadge from "./FeaturedFreeBadge";
import { FREE_DAILY_PREDICTION_LIMIT } from "../logic/freePredictionAllowance";
import JourneyContentBreak from "./JourneyContentBreak";
import FixtureFootyStatsFallback from "./FixtureFootyStatsFallback";
import FixtureMarketsSnapshot from "./FixtureMarketsSnapshot";
import FixtureSocialShareCard from "./FixtureSocialShareCard";
import { buildFixtureShareCardFromMatch } from "../logic/fixtureShareCardData";

function formatStatValue(label, value) {
  if (value == null || value === undefined) {
    return "-";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  if (typeof value === "number" && Number.isNaN(value)) {
    return "-";
  }

  if (
    (label === "Average Shot Value Against" ||
      label === "Average Shot Value" ||
      label === "Weighted XG" ||
      label === "Weighted XG Against" ||
      label === "Average npXG" ||
      label === "Average npXG Against" ||
      label === "Average Shots" ||
      label === "Average Shots Against") &&
    value !== "" &&
    !Number.isNaN(Number(value))
  ) {
    return Number(value).toFixed(2);
  }

  if (label === "Clean Sheet Percentage" && typeof value === "string" && value.endsWith("%")) {
    const n = Number(value.replace("%", ""));
    if (Number.isFinite(n)) {
      return `${n.toFixed(2)}%`;
    }
  }

  return value;
}

function normalizeResultMatch(match) {
  if (!match || typeof match !== "object") {
    return null;
  }

  const isHomeFixture = match.venue === "Home";

  return {
    date: match.date,
    homeTeam: isHomeFixture ? match.team : match.oppTeam,
    awayTeam: isHomeFixture ? match.oppTeam : match.team,
    homeGoals: match.homeGoals,
    awayGoals: match.awayGoals,
    result: match.result,
    venue: match.venue,
  };
}

function LoadingSkeleton({ seoShell = null }) {
  return (
    <div className="FixturePage-loading" aria-busy="true" aria-label="Loading fixture analysis">
      {seoShell ? null : (
        <div className="FixturePage-skeleton FixturePage-skeleton--hero" />
      )}
      <div className="FixturePage-skeleton FixturePage-skeleton--chart" />
      <div className="FixturePage-skeleton FixturePage-skeleton--card" />
      <div className="FixturePage-skeleton FixturePage-skeleton--card" />
    </div>
  );
}

function CompareRow({ label, homeValue, awayValue }) {
  return (
    <div className="FixturePage-compareRow">
      <span className="FixturePage-compareValue FixturePage-compareValue--home">
        {formatStatValue(label, homeValue)}
      </span>
      <span className="FixturePage-compareLabel">{label}</span>
      <span className="FixturePage-compareValue FixturePage-compareValue--away">
        {formatStatValue(label, awayValue)}
      </span>
    </div>
  );
}

const marketsSnapshotLabelSet = new Set(FIXTURE_MARKETS_SNAPSHOT_LABELS);

function filterCompareRows(sectionId, homeRows, awayRows) {
  if (sectionId !== "markets") {
    return { homeRows, awayRows };
  }
  const home = homeRows.filter((row) => !marketsSnapshotLabelSet.has(row.label));
  const away = awayRows.filter((row) => !marketsSnapshotLabelSet.has(row.label));
  return { homeRows: home, awayRows: away };
}

function CompareSection({
  sectionId,
  title,
  homeRows = [],
  awayRows = [],
  hideTitle = false,
}) {
  const filtered = filterCompareRows(sectionId, homeRows, awayRows);
  const rows = filtered.homeRows.map((homeStat, index) => ({
    label: homeStat.label,
    homeValue: homeStat.value,
    awayValue: filtered.awayRows[index]?.value,
  }));

  if (!rows.length) {
    return null;
  }

  return (
    <section className="FixturePage-compareSection">
      {hideTitle ? null : (
        <h3 className="FixturePage-statGroupTitle">{title}</h3>
      )}
      <div className="FixturePage-compareRows">
        {rows.map((row) => (
          <CompareRow
            key={row.label}
            label={row.label}
            homeValue={row.homeValue}
            awayValue={row.awayValue}
          />
        ))}
      </div>
    </section>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="FixturePage-stat">
      <span className="FixturePage-statLabel">{label}</span>
      <span className="FixturePage-statValue">{formatStatValue(label, value)}</span>
    </div>
  );
}

function modelOutcomeCaption(homeName, awayName, homeWin, draw, awayWin) {
  const outcomes = [
    { winner: homeName || "The home side", value: homeWin, draw: false },
    { winner: null, value: draw, draw: true },
    { winner: awayName || "The away side", value: awayWin, draw: false },
  ].sort((a, b) => b.value - a.value);
  const [first, second] = outcomes;
  if (first.value - second.value < 2) {
    return "The model has this match as close.";
  }
  if (first.draw) {
    return `A draw is the most likely result, at ${first.value.toFixed(1)}%.`;
  }
  return `${first.winner} are the most likely winners, at ${first.value.toFixed(1)}%.`;
}

function ModelOutputsChart({ modelOutputs, homeTeamName, awayTeamName }) {
  if (!modelOutputs) {
    return (
      <p className="FixturePage-modelOutputsEmpty">Model outputs unavailable.</p>
    );
  }

  const homeWin = Number(modelOutputs.homeWin);
  const draw = Number(modelOutputs.draw);
  const awayWin = Number(modelOutputs.awayWin);
  if (![homeWin, draw, awayWin].every((value) => Number.isFinite(value))) {
    return (
      <p className="FixturePage-modelOutputsEmpty">Model outputs unavailable.</p>
    );
  }

  const homeLabel = homeTeamName ? `${homeTeamName} win` : "Home win";
  const awayLabel = awayTeamName ? `${awayTeamName} win` : "Away win";

  return (
    <SplitBar
      segments={[
        { label: homeLabel, value: homeWin, tone: "home" },
        { label: "Draw", value: draw, tone: "draw" },
        { label: awayLabel, value: awayWin, tone: "away" },
      ]}
      caption={modelOutcomeCaption(homeTeamName, awayTeamName, homeWin, draw, awayWin)}
    />
  );
}

function strengthLead(homeName, awayName, homeValue, awayValue, metric) {
  const home = Number(homeValue);
  const away = Number(awayValue);
  if (!Number.isFinite(home) || !Number.isFinite(away)) return null;
  if (Math.abs(home - away) < 0.005) return `${metric} is level.`;
  const leader = home > away ? homeName : awayName;
  return `${leader} are stronger in ${metric}.`;
}

function comparisonLead(homeName, awayName, values) {
  const attack = strengthLead(homeName, awayName, values.homeAttack, values.awayAttack, "attack");
  const defence = strengthLead(
    homeName,
    awayName,
    values.homeDefence,
    values.awayDefence,
    "defence"
  );
  const leadsBoth = (name) =>
    attack === `${name} are stronger in attack.` &&
    defence === `${name} are stronger in defence.`;
  if (leadsBoth(homeName)) {
    return `${homeName} are stronger in attack and defence.`;
  }
  if (leadsBoth(awayName)) {
    return `${awayName} are stronger in attack and defence.`;
  }
  return [attack, defence].filter(Boolean).join(" ");
}

function formatStrength(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return Math.abs(n) >= 10 ? n.toFixed(1) : n.toFixed(2);
}

function h2hShares(summary) {
  const home = Number(summary?.homeTeamWins);
  const draw = Number(summary?.draws);
  const away = Number(summary?.awayTeamWins);
  if (![home, draw, away].every((value) => Number.isFinite(value))) return null;
  const total = home + draw + away;
  if (total <= 0) return null;
  return {
    home: (home / total) * 100,
    draw: (draw / total) * 100,
    away: (away / total) * 100,
    homeCount: home,
    drawCount: draw,
    awayCount: away,
    total,
  };
}

function HeadToHeadSection({ headToHead, homeTeamName, awayTeamName }) {
  if (!headToHead?.summary) {
    return null;
  }

  const { summary, recentMatches } = headToHead;
  const shares = h2hShares(summary);

  return (
    <section className="FixturePage-h2hCard">
      <h3 className="FixturePage-statGroupTitle">Head to Head</h3>

      <div className="FixturePage-h2hSummary">
        {shares ? (
          <SplitBar
            segments={[
              { label: homeTeamName, value: shares.home, tone: "home" },
              { label: "Draws", value: shares.draw, tone: "draw" },
              { label: awayTeamName, value: shares.away, tone: "away" },
            ]}
              caption={`${homeTeamName} have won ${shares.homeCount} of ${shares.total} meetings. ${awayTeamName} have won ${shares.awayCount}, with ${shares.drawCount === 1 ? "1 draw" : `${shares.drawCount} draws`}.`}
          />
        ) : (
          <>
            <StatRow label="Total matches" value={summary.totalMatches} />
            <StatRow label={`${homeTeamName} wins`} value={summary.homeTeamWins} />
            <StatRow label={`${awayTeamName} wins`} value={summary.awayTeamWins} />
            <StatRow label="Draws" value={summary.draws} />
          </>
        )}
      </div>

      {recentMatches.length > 0 ? (
        <>
          <h4 className="FixturePage-h2hSubheading">Recent meetings</h4>
          <div className="FixturePage-h2hMatches">
            {recentMatches.map((meeting, index) => (
              <div
                key={`${meeting.date}-${index}`}
                className="FixturePage-h2hMatch"
              >
                <div className="FixturePage-h2hMatchMeta">
                  <span className="FixturePage-h2hMatchDate">{meeting.date}</span>
                </div>
                <div className="FixturePage-h2hMatchRow">
                  <span
                    className="FixturePage-h2hMatchTeam FixturePage-h2hMatchTeam--home"
                    title={meeting.homeTeam}
                  >
                    {meeting.homeTeam}
                  </span>
                  <span className="FixturePage-h2hMatchScore">
                    {meeting.homeGoals} - {meeting.awayGoals}
                  </span>
                  <span
                    className="FixturePage-h2hMatchTeam FixturePage-h2hMatchTeam--away"
                    title={meeting.awayTeam}
                  >
                    {meeting.awayTeam}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

function ResultsColumn({ side, matches }) {
  return (
    <div className={`FixturePage-resultsList FixturePage-resultsList--${side}`}>
      {matches.length === 0 ? (
        <p className="FixturePage-resultsEmpty">No recent results available.</p>
      ) : (
        matches.map((match, index) => (
          <div key={`${match.date}-${index}`} className="FixturePage-result">
            <div className="FixturePage-resultMeta">
              <span className="FixturePage-resultDate" title={match.date}>
                {match.date}
              </span>
              {match.venue && (
                <span
                  className="FixturePage-resultVenue"
                  title={match.venue}
                >
                  {match.venue === "Home"
                    ? "H"
                    : match.venue === "Away"
                      ? "A"
                      : match.venue}
                </span>
              )}
              {match.result && (
                <span
                  className={`FixturePage-resultBadge FixturePage-resultBadge--${match.result.toLowerCase()}`}
                >
                  {match.result}
                </span>
              )}
            </div>
            <div className="FixturePage-resultRow">
              <span className="FixturePage-resultTeam FixturePage-resultTeam--home">
                {match.homeTeam}
              </span>
              <span className="FixturePage-resultScore">
                {match.homeGoals} : {match.awayGoals}
              </span>
              <span className="FixturePage-resultTeam FixturePage-resultTeam--away">
                {match.awayTeam}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function TeamPage({ matchId, seoShell = null }) {
  const [pageData, setPageData] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(Boolean(matchId));
  const [error, setError] = useState(null);
  const { unlocked: predictionUnlocked, unlockOrUpgrade, isPaidUser } =
    useFixturePredictionUnlock(matchId, match?.featuredFixtureId ?? null);
  const isFeaturedFree = Boolean(match?.isFeaturedFree);
  const fullAccess = isPaidUser || isFeaturedFree;

  const storedFixtureDetails = useSelector(
    (state) => state.data.fixtureDetails
  );
  const storedFixtureDetailsJson = matchId
    ? pageData?.fixtureDetails ?? {}
    : JSON.parse(storedFixtureDetails || "{}");

  useEffect(() => {
    if (!matchId) {
      return;
    }

    let cancelled = false;

    async function loadMatch() {
      setLoading(true);
      setError(null);

      try {
        const match = await predictMatchById(matchId);
        if (cancelled) {
          return;
        }

        setPageData(mapMatchToFixturePageData(match));
        setMatch(match);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Failed to load fixture");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMatch();

    return () => {
      cancelled = true;
    };
  }, [matchId]);

  const theme = useChartTheme();
  const colors = getChartColors(theme);

  const storedDataHome = useSelector((state) => state.data.dataHome);
  const storedDataHomeDef = useSelector((state) => state.data.dataHomeDef);
  const storedDataAway = useSelector((state) => state.data.dataAway);
  const storedDataAwayDef = useSelector((state) => state.data.dataAwayDef);
  const storedDataallTeamResultsHome = useSelector(
    (state) => state.data.allTeamResultsHome
  );
  const storedDataallTeamResultsAway = useSelector(
    (state) => state.data.allTeamResultsAway
  );
  const homeDetails = useSelector((state) => state.data.homeDetails);
  const awayDetails = useSelector((state) => state.data.awayDetails);

  const sections = useMemo(() => {
    if (matchId) {
      return (pageData?.sections ?? []).filter((section) =>
        ["markets", "advanced-tendencies"].includes(section.id)
      );
    }

    const homeForm = JSON.parse(storedDataHome || "{}");
    const homeFormDef = JSON.parse(storedDataHomeDef || "{}");
    const awayForm = JSON.parse(storedDataAway || "{}");
    const awayFormDef = JSON.parse(storedDataAwayDef || "{}");

    return buildLegacyFixtureSections(homeForm, homeFormDef, awayForm, awayFormDef);
  }, [
    matchId,
    pageData?.sections,
    storedDataHome,
    storedDataHomeDef,
    storedDataAway,
    storedDataAwayDef,
  ]);

  const chartValues = useMemo(() => {
    if (matchId) {
      return pageData?.chart ?? {};
    }

    const jsonHomeDetails = JSON.parse(homeDetails || "{}");
    const jsonAwayDetails = JSON.parse(awayDetails || "{}");

    return {
      homeAttack: jsonHomeDetails["Attacking Strength"],
      homeDefence: jsonHomeDetails["Defensive Strength"],
      awayAttack: jsonAwayDetails["Attacking Strength"],
      awayDefence: jsonAwayDetails["Defensive Strength"],
    };
  }, [matchId, pageData?.chart, homeDetails, awayDetails]);

  const recentResults = useMemo(() => {
    const normalizeList = (raw) =>
      (Array.isArray(raw) ? raw : Object.values(raw ?? {}))
        .map(normalizeResultMatch)
        .filter(Boolean);

    if (matchId) {
      return {
        home: normalizeList(pageData?.recentResults?.home),
        away: normalizeList(pageData?.recentResults?.away),
      };
    }

    return {
      home: normalizeList(JSON.parse(storedDataallTeamResultsHome || "[]")),
      away: normalizeList(JSON.parse(storedDataallTeamResultsAway || "[]")),
    };
  }, [
    matchId,
    pageData?.recentResults,
    storedDataallTeamResultsHome,
    storedDataallTeamResultsAway,
  ]);

  if (loading) {
    return (
      <div className="FixturePage">
        <LoadingSkeleton seoShell={seoShell} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="FixturePage">
        <p className="FixturePage-error">{error}</p>
      </div>
    );
  }

  if (matchId && !storedFixtureDetailsJson?.homeTeamName) {
    return (
      <div className="FixturePage">
        <p className="FixturePage-error">Fixture not found.</p>
      </div>
    );
  }

  const strengthValues = [
    chartValues.homeAttack,
    chartValues.awayAttack,
    chartValues.homeDefence,
    chartValues.awayDefence,
  ].map(Number);
  const finiteStrengths = strengthValues.filter((value) => Number.isFinite(value));
  const strengthMin = finiteStrengths.length ? Math.min(...finiteStrengths) : 0;

  const chartOptions = {
    ...growFromZero(),
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        ...tooltipStyle(colors),
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${formatStrength(context.raw)}`,
        },
      },
      barValueLabels: {
        format: (value) => formatStrength(value),
        color: colors.color,
        fontSize: 11,
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    layout: { padding: { top: 18, right: 8, bottom: 4, left: 8 } },
    scales: {
      x: {
        ticks: {
          color: colors.color,
          font: { size: 12, weight: "600" },
          maxRotation: 0,
        },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: strengthMin >= 0,
        grace: "18%",
        ticks: { color: colors.faint, font: { size: 10 } },
        grid: { color: colors.gridColor, drawTicks: false },
        border: { display: false },
      },
    },
  };

  const chartData = {
    labels: ["Attack", "Defence"],
    datasets: [
      {
        data: [chartValues.homeAttack, chartValues.homeDefence],
        label: storedFixtureDetailsJson?.homeTeamName || "Home",
        backgroundColor: colors.home,
        borderWidth: 0,
        borderRadius: 6,
        maxBarThickness: 48,
        valueLabels: true,
      },
      {
        data: [chartValues.awayAttack, chartValues.awayDefence],
        label: storedFixtureDetailsJson?.awayTeamName || "Away",
        backgroundColor: colors.away,
        borderWidth: 0,
        borderRadius: 6,
        maxBarThickness: 48,
        valueLabels: true,
      },
    ],
  };

  const homeName = storedFixtureDetailsJson.homeTeamName;
  const awayName = storedFixtureDetailsJson.awayTeamName;
  const pageUrl =
    buildMatchShareUrl(matchId, null, undefined, {
      homeTeam: homeName,
      awayTeam: awayName,
    }) || "";
  const strengthSummary = comparisonLead(homeName, awayName, chartValues);
  const useFootyStatsTemplate = match?.fixtureStatsSource === "footystats-api";

  return (
    <div className="FixturePage">
      <header
        className={`FixturePage-header${
          seoShell ? " FixturePage-header--supplement" : ""
        }`}
      >
        {!seoShell ? (
          <>
            <h1 className="FixturePage-heading">
              <span className="FixturePage-teamLine FixturePage-teamLine--home">
                <CreateBadge
                  image={storedFixtureDetailsJson.homeTeamBadge}
                  ClassName="FixturePage-badge FixturePage-badge--home"
                  alt=""
                />
                <span
                  className="FixturePage-headingTeam FixturePage-headingTeam--home"
                  title={storedFixtureDetailsJson.homeTeamName}
                >
                  {storedFixtureDetailsJson.homeTeamName}
                </span>
              </span>
              <span className="FixturePage-vs">v</span>
              <span className="FixturePage-teamLine FixturePage-teamLine--away">
                <CreateBadge
                  image={storedFixtureDetailsJson.awayTeamBadge}
                  ClassName="FixturePage-badge FixturePage-badge--away"
                  alt=""
                />
                <span
                  className="FixturePage-headingTeam FixturePage-headingTeam--away"
                  title={storedFixtureDetailsJson.awayTeamName}
                >
                  {storedFixtureDetailsJson.awayTeamName}
                </span>
              </span>
            </h1>

            <div className="FixturePage-meta">
              {storedFixtureDetailsJson.leagueName ? (
                <span className="FixturePage-metaItem">
                  {storedFixtureDetailsJson.leagueName}
                </span>
              ) : null}
              <span className="FixturePage-metaItem">
                KO: {storedFixtureDetailsJson.time}
              </span>
              {storedFixtureDetailsJson.stadium ? (
                <span className="FixturePage-metaItem">
                  {storedFixtureDetailsJson.stadium}
                </span>
              ) : null}
            </div>
          </>
        ) : null}

        <div className="FixturePage-prediction">
          <FeaturedFreeBadge show={isFeaturedFree && !isPaidUser} />
          <span className="FixturePage-predictionLabel">Predicted score</span>
          {predictionUnlocked || fullAccess ? (
            <span className="FixturePage-predictionScore">
              {storedFixtureDetailsJson.homeGoals} -{" "}
              {storedFixtureDetailsJson.awayGoals}
            </span>
          ) : (
            <button
              type="button"
              className="PredictionUnlockBtn FixturePage-predictionUnlock"
              onClick={unlockOrUpgrade}
              aria-label="Unlock predicted score"
            >
              🔒 Unlock ({FREE_DAILY_PREDICTION_LIMIT} free/day)
            </button>
          )}
        </div>

        <SharePageLinkButton
          className="FixturePage-shareLink"
          title={`${storedFixtureDetailsJson.homeTeamName} vs ${storedFixtureDetailsJson.awayTeamName} | Soccer Stats Hub`}
          text={`${storedFixtureDetailsJson.homeTeamName} vs ${storedFixtureDetailsJson.awayTeamName} stats and prediction`}
          label="Share match link"
        />
        {matchId && match ? (
          <ShareableVisual
            hideBrand
            hideCapture
            className="FixturePage-shareCard FixturePage-shareCard--sourceOnly"
            filename={sanitizeImageFilename(
              `${storedFixtureDetailsJson.homeTeamName}-vs-${storedFixtureDetailsJson.awayTeamName}-summary`
            )}
            shareTitle={`${storedFixtureDetailsJson.homeTeamName} vs ${storedFixtureDetailsJson.awayTeamName}`}
            shareText={`${storedFixtureDetailsJson.homeTeamName} vs ${storedFixtureDetailsJson.awayTeamName} stats and prediction`}
            shareUrl={pageUrl}
          >
            <FixtureSocialShareCard
              pageUrl={pageUrl}
              data={buildFixtureShareCardFromMatch(match, {
                kickOff: seoShell?.kickOff || storedFixtureDetailsJson.time || "",
                league: seoShell?.league || storedFixtureDetailsJson.leagueName || "",
              })}
            />
          </ShareableVisual>
        ) : null}
      </header>

      {matchId && match ? (
        <FixtureMarketsSnapshot
          match={match}
          homeTeamName={storedFixtureDetailsJson.homeTeamName}
          awayTeamName={storedFixtureDetailsJson.awayTeamName}
        />
      ) : null}

      <p className="FixturePage-homeStatsNote">
        Looking for more? The{" "}
        <a href="/">homepage</a> has more extensive match stats for this game,
        comparative charts, wider context, an AI preview, and loads more fixtures to
        explore.
      </p>

      {useFootyStatsTemplate ? (
        <FixtureFootyStatsFallback
          match={match}
          sections={pageData?.sections ?? []}
          homeTeamName={homeName}
          awayTeamName={awayName}
          formatStatValue={formatStatValue}
        />
      ) : (
        <>
          {matchId && match ? (
            <FixtureSeasonStats match={match} statsFullAccess={fullAccess} />
          ) : null}

          <JourneyContentBreak>
            {homeName} and {awayName} compared on attacking and defensive strength.
          </JourneyContentBreak>

          <section className="FixturePage-chartCard">
            <h3 className="FixturePage-statGroupTitle">Team comparison</h3>
            <ShareableVisual
              filename={sanitizeImageFilename(
                `${storedFixtureDetailsJson.homeTeamName}-vs-${storedFixtureDetailsJson.awayTeamName}-comparison`
              )}
              shareTitle={`${storedFixtureDetailsJson.homeTeamName} vs ${storedFixtureDetailsJson.awayTeamName} - stat comparison`}
              className="FixturePage-chartShare"
            >
              <div data-share-capture className="FixturePage-comparisonChart">
                {strengthSummary ? (
                  <p className="FixturePage-chartNote">{strengthSummary}</p>
                ) : null}
                <div className="FixturePage-comparisonChartCanvas">
                  <LazyChart fill>
                    <Bar
                      key={theme}
                      options={chartOptions}
                      data={chartData}
                      plugins={[barValueLabelsPlugin]}
                      className="FixturePage-chart"
                    />
                  </LazyChart>
                </div>
                <div className="FixturePage-chartLegend" aria-hidden="true">
                  <span className="FixturePage-chartLegendItem">
                    <span className="FixturePage-chartLegendSwatch FixturePage-chartLegendSwatch--home" />
                    {homeName}
                  </span>
                  <span className="FixturePage-chartLegendItem">
                    <span className="FixturePage-chartLegendSwatch FixturePage-chartLegendSwatch--away" />
                    {awayName}
                  </span>
                </div>
              </div>
            </ShareableVisual>
          </section>

          <div className="FixturePage-compareBlock">
            <div className="FixturePage-compareTeams FixturePage-compareTeams--block">
              <span className="FixturePage-compareTeam FixturePage-compareTeam--home">
                {storedFixtureDetailsJson.homeTeamName}
              </span>
              <span className="FixturePage-compareTeam FixturePage-compareTeam--away">
                {storedFixtureDetailsJson.awayTeamName}
              </span>
            </div>

            {sections.map((section) => {
              if (section.id === "advanced-tendencies") {
                return (
                  <details
                    key={section.id}
                    className="FixturePage-advancedTendencies"
                  >
                    <summary
                      className="FixturePage-statGroupTitle FixturePage-advancedTendenciesSummary"
                    >
                      {section.title}
                    </summary>
                    <CompareSection
                      sectionId={section.id}
                      title={section.title}
                      homeRows={section.home}
                      awayRows={section.away}
                      hideTitle
                    />
                  </details>
                );
              }

              return (
                <CompareSection
                  key={section.id}
                  sectionId={section.id}
                  title={section.title}
                  homeRows={section.home}
                  awayRows={section.away}
                />
              );
            })}
          </div>
        </>
      )}

      {matchId && pageData?.modelOutputs ? (
        <JourneyContentBreak>
          Modelled win, draw and away probabilities for {homeName} vs {awayName}.
        </JourneyContentBreak>
      ) : null}

      {matchId && pageData?.modelOutputs ? (
        <section className="FixturePage-modelOutputsCard">
          <h3 className="FixturePage-statGroupTitle">Model Outputs</h3>
          {predictionUnlocked || fullAccess ? (
            <ModelOutputsChart
              modelOutputs={pageData.modelOutputs}
              homeTeamName={storedFixtureDetailsJson.homeTeamName}
              awayTeamName={storedFixtureDetailsJson.awayTeamName}
            />
          ) : (
            <div className="FixturePage-seasonStatsLocked">
              <p>
                Model win/draw/away probabilities unlock with your daily free
                predictions ({FREE_DAILY_PREDICTION_LIMIT} per day).
              </p>
              <button
                type="button"
                className="FixturePage-upgradeLink"
                onClick={unlockOrUpgrade}
              >
                Unlock this match
              </button>
            </div>
          )}
        </section>
      ) : null}

      {matchId && pageData?.headToHead ? (
        <JourneyContentBreak>
          Previous meetings between {homeName} and {awayName}.
        </JourneyContentBreak>
      ) : null}

      {matchId && pageData?.headToHead ? (
        <HeadToHeadSection
          headToHead={pageData.headToHead}
          homeTeamName={storedFixtureDetailsJson.homeTeamName}
          awayTeamName={storedFixtureDetailsJson.awayTeamName}
        />
      ) : null}

      {useFootyStatsTemplate ? null : (
        <>
          <JourneyContentBreak>
            Recent results for both sides, most recent first.
          </JourneyContentBreak>

          <div className="FixturePage-resultsBlock">
            <h3 className="FixturePage-statGroupTitle">Recent Results</h3>
            <div className="FixturePage-resultsGrid">
              <div className="FixturePage-resultsPanel FixturePage-resultsPanel--home">
                <h4 className="FixturePage-resultsPanelTitle">
                  {storedFixtureDetailsJson.homeTeamName}
                </h4>
                <ResultsColumn side="home" matches={recentResults.home} />
              </div>
              <div className="FixturePage-resultsPanel FixturePage-resultsPanel--away">
                <h4 className="FixturePage-resultsPanelTitle">
                  {storedFixtureDetailsJson.awayTeamName}
                </h4>
                <ResultsColumn side="away" matches={recentResults.away} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TeamPage;

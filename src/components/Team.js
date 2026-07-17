import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { CreateBadge } from "./createBadge";
import { predictMatchById } from "../logic/predictMatchById";
import { mapMatchToFixturePageData } from "../logic/buildSingleMatch";
import { buildLegacyFixtureSections } from "../logic/fixturePageMetrics";
import FixtureSeasonStats from "./FixtureSeasonStats";
import { FixtureSeoBody } from "./FixtureSeoShell";
import ShareableVisual from "./ShareableVisual";
import { sanitizeImageFilename } from "../utils/captureElementImage";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useChartTheme, getChartColors } from "./Chart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
      <div className="FixturePage-skeleton FixturePage-skeleton--hero" />
      {seoShell ? <FixtureSeoBody {...seoShell} /> : null}
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

function CompareSection({ title, homeRows = [], awayRows = [] }) {
  const rows = homeRows.map((homeStat, index) => ({
    label: homeStat.label,
    homeValue: homeStat.value,
    awayValue: awayRows[index]?.value,
  }));

  return (
    <section className="FixturePage-compareSection">
      <h3 className="FixturePage-statGroupTitle">{title}</h3>
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

function ModelOutputsChart({ modelOutputs, homeTeamName, awayTeamName, theme, color, gridColor, tooltipBackground }) {
  if (!modelOutputs) {
    return (
      <p className="FixturePage-modelOutputsEmpty">Model outputs unavailable.</p>
    );
  }

  const { homeWin, draw, awayWin } = modelOutputs;
  const homeLabel = homeTeamName ? `${homeTeamName} win` : "Home win";
  const awayLabel = awayTeamName ? `${awayTeamName} win` : "Away win";

  const chartOptions = {
    indexAxis: "y",
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBackground,
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.toFixed(1)}%`,
        },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    layout: {
      padding: { top: 8, right: 12, bottom: 8, left: 12 },
    },
    scales: {
      x: {
        stacked: true,
        max: 100,
        ticks: {
          color,
          font: { size: 11 },
          callback: (value) => `${value}%`,
        },
        grid: { color: gridColor },
        border: { display: false },
      },
      y: {
        stacked: true,
        display: false,
        grid: { display: false },
      },
    },
  };

  const chartData = {
    labels: [" "],
    datasets: [
      {
        label: homeLabel,
        data: [homeWin],
        backgroundColor: "#01a501",
        borderWidth: 0,
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.85,
      },
      {
        label: "Draw",
        data: [draw],
        backgroundColor: "#8a8a8a",
        borderWidth: 0,
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.85,
      },
      {
        label: awayLabel,
        data: [awayWin],
        backgroundColor: "#d71200",
        borderWidth: 0,
        borderRadius: 6,
        barPercentage: 0.7,
        categoryPercentage: 0.85,
      },
    ],
  };

  return (
    <div className="FixturePage-modelOutputsBody">
      <div className="FixturePage-modelOutputsChartWrap">
        <Bar
          key={`model-${theme}`}
          options={chartOptions}
          data={chartData}
          className="FixturePage-modelOutputsChart"
        />
      </div>
      <div className="FixturePage-chartLegend" aria-hidden="true">
        <span className="FixturePage-chartLegendItem">
          <span className="FixturePage-chartLegendSwatch FixturePage-chartLegendSwatch--home" />
          {homeLabel}
          <strong>{Number(homeWin).toFixed(1)}%</strong>
        </span>
        <span className="FixturePage-chartLegendItem">
          <span className="FixturePage-chartLegendSwatch FixturePage-chartLegendSwatch--draw" />
          Draw
          <strong>{Number(draw).toFixed(1)}%</strong>
        </span>
        <span className="FixturePage-chartLegendItem">
          <span className="FixturePage-chartLegendSwatch FixturePage-chartLegendSwatch--away" />
          {awayLabel}
          <strong>{Number(awayWin).toFixed(1)}%</strong>
        </span>
      </div>
    </div>
  );
}

function HeadToHeadSection({ headToHead, homeTeamName, awayTeamName }) {
  if (!headToHead?.summary) {
    return null;
  }

  const { summary, recentMatches } = headToHead;

  return (
    <section className="FixturePage-h2hCard">
      <h3 className="FixturePage-statGroupTitle">Head to Head</h3>

      <div className="FixturePage-h2hSummary">
        <StatRow label="Total matches" value={summary.totalMatches} />
        <StatRow
          label={`${homeTeamName} wins`}
          value={
            summary.homeWinPercent != null
              ? `${summary.homeTeamWins} (${summary.homeWinPercent}%)`
              : summary.homeTeamWins
          }
        />
        <StatRow
          label={`${awayTeamName} wins`}
          value={
            summary.awayWinPercent != null
              ? `${summary.awayTeamWins} (${summary.awayWinPercent}%)`
              : summary.awayTeamWins
          }
        />
        <StatRow label="Draws" value={summary.draws} />
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
  const { color, gridColor, tooltipBackground } = getChartColors(theme);

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
      return (pageData?.sections ?? []).filter(
        (section) => section.id === "tendencies"
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
      <div
        className={`FixturePage${seoShell ? " FixturePage--hasSeoBody" : ""}`}
      >
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

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBackground,
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
      },
    },
    maintainAspectRatio: false,
    responsive: true,
    layout: {
      padding: { top: 8, right: 8, bottom: 4, left: 8 },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          color,
          font: { size: 12, weight: "500" },
          maxRotation: 0,
          autoSkip: true,
        },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        stacked: true,
        display: false,
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  const chartData = {
    labels: [
      storedFixtureDetailsJson?.homeTeamName,
      storedFixtureDetailsJson?.awayTeamName,
    ],
    datasets: [
      {
        data: [chartValues.homeAttack, chartValues.awayAttack],
        label: "Attacking",
        backgroundColor: "#01a501",
        borderWidth: 0,
        borderRadius: 6,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
      {
        data: [chartValues.homeDefence, chartValues.awayDefence],
        label: "Defensive",
        backgroundColor: "#d71200",
        borderWidth: 0,
        borderRadius: 6,
        barPercentage: 0.65,
        categoryPercentage: 0.7,
      },
    ],
  };

  return (
    <div className={`FixturePage${seoShell ? " FixturePage--hasSeoBody" : ""}`}>
      <header className="FixturePage-header">
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

        <div className="FixturePage-prediction">
          <span className="FixturePage-predictionLabel">Predicted score</span>
          <span className="FixturePage-predictionScore">
            {storedFixtureDetailsJson.homeGoals} -{" "}
            {storedFixtureDetailsJson.awayGoals}
          </span>
        </div>
      </header>

      {seoShell ? <FixtureSeoBody {...seoShell} /> : null}

      {matchId && match ? <FixtureSeasonStats match={match} /> : null}

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
            <div className="FixturePage-comparisonChartCanvas">
              <Bar
                key={theme}
                options={chartOptions}
                data={chartData}
                className="FixturePage-chart"
              />
            </div>
            <div className="FixturePage-chartLegend" aria-hidden="true">
              <span className="FixturePage-chartLegendItem">
                <span className="FixturePage-chartLegendSwatch FixturePage-chartLegendSwatch--home" />
                Attacking
              </span>
              <span className="FixturePage-chartLegendItem">
                <span className="FixturePage-chartLegendSwatch FixturePage-chartLegendSwatch--away" />
                Defensive
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

        {sections.map((section) => (
          <CompareSection
            key={section.id}
            title={section.title}
            homeRows={section.home}
            awayRows={section.away}
          />
        ))}
      </div>

      {matchId && pageData?.modelOutputs ? (
        <section className="FixturePage-modelOutputsCard">
          <h3 className="FixturePage-statGroupTitle">Model Outputs</h3>
          <ModelOutputsChart
            modelOutputs={pageData.modelOutputs}
            homeTeamName={storedFixtureDetailsJson.homeTeamName}
            awayTeamName={storedFixtureDetailsJson.awayTeamName}
            theme={theme}
            color={color}
            gridColor={gridColor}
            tooltipBackground={tooltipBackground}
          />
        </section>
      ) : null}

      {matchId && pageData?.headToHead ? (
        <HeadToHeadSection
          headToHead={pageData.headToHead}
          homeTeamName={storedFixtureDetailsJson.homeTeamName}
          awayTeamName={storedFixtureDetailsJson.awayTeamName}
        />
      ) : null}

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
    </div>
  );
}

export default TeamPage;

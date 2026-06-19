import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { CreateBadge } from "./createBadge";
import { predictMatchById } from "../logic/predictMatchById";
import { mapMatchToFixturePageData } from "../logic/buildSingleMatch";
import { buildLegacyFixtureSections } from "../logic/fixturePageMetrics";
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
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  if (typeof value === "number" && Number.isNaN(value)) {
    return "—";
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

function PairedCardTitle({ side, name, subtitle }) {
  return (
    <h2 className={`FixturePage-cardTitle FixturePage-cardTitle--${side}`}>
      <span className="FixturePage-cardTitleName">{name}</span>
      {subtitle ? (
        <span className="FixturePage-cardTitleSub">{subtitle}</span>
      ) : null}
    </h2>
  );
}

function PairedStatSection({ title, homeContent, awayContent }) {
  return (
    <section className="FixturePage-pairedSection">
      <h3 className="FixturePage-statGroupTitle">{title}</h3>
      <div className="FixturePage-pairedRow">
        <div className="FixturePage-pairedCol FixturePage-pairedCol--home">
          {homeContent}
        </div>
        <div className="FixturePage-pairedCol FixturePage-pairedCol--away">
          {awayContent}
        </div>
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

  const chartOptions = {
    indexAxis: "y",
    plugins: {
      legend: {
        labels: { color },
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
    aspectRatio: 3.5,
    maintainAspectRatio: true,
    responsive: true,
    scales: {
      x: {
        stacked: true,
        max: 100,
        ticks: {
          color,
          callback: (value) => `${value}%`,
        },
        grid: { color: gridColor },
      },
      y: {
        stacked: true,
        display: false,
        grid: { display: false },
      },
    },
  };

  const chartData = {
    labels: ["Match outcome"],
    datasets: [
      {
        label: homeTeamName ? `${homeTeamName} win` : "Home win",
        data: [homeWin],
        backgroundColor: "#01a501",
      },
      {
        label: "Draw",
        data: [draw],
        backgroundColor: "#888888",
      },
      {
        label: awayTeamName ? `${awayTeamName} win` : "Away win",
        data: [awayWin],
        backgroundColor: "#d71200",
      },
    ],
  };

  return (
    <Bar
      key={`model-${theme}`}
      options={chartOptions}
      data={chartData}
      className="FixturePage-modelOutputsChart"
    />
  );
}

function ResultsColumn({ side, matches }) {
  return (
    <div
      className={`FixturePage-pairedCol FixturePage-pairedCol--${side} FixturePage-results`}
    >
      <div className="FixturePage-resultsList">
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
    </div>
  );
}

function TeamPage({ matchId }) {
  const [pageData, setPageData] = useState(null);
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
      return pageData?.sections ?? [];
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
        <p className="FixturePage-loading">Loading fixture analysis…</p>
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
        labels: { color },
      },
      title: {
        display: true,
        text: "Team Comparison",
        color,
        font: { size: 14, weight: "600" },
      },
      tooltip: {
        backgroundColor: tooltipBackground,
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
      },
    },
    aspectRatio: 1.4,
    maintainAspectRatio: true,
    responsive: true,
    scales: {
      x: {
        stacked: true,
        ticks: { color },
        grid: { color: gridColor },
      },
      y: {
        stacked: true,
        display: false,
        grid: { display: false },
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
        label: "Attacking Strength",
        backgroundColor: "#01a501",
      },
      {
        data: [chartValues.homeDefence, chartValues.awayDefence],
        label: "Defensive Strength",
        backgroundColor: "#d71200",
      },
    ],
  };

  return (
    <div className="FixturePage">
      <header className="FixturePage-header">
        <div className="FixturePage-matchTitle">
          <CreateBadge
            image={storedFixtureDetailsJson.homeTeamBadge}
            ClassName="FixturePage-badge FixturePage-badge--home"
            alt="Home team badge"
          />
          <div className="FixturePage-teams">
            <h1 className="FixturePage-heading">
              <span
                className="FixturePage-headingTeam FixturePage-headingTeam--home"
                title={storedFixtureDetailsJson.homeTeamName}
              >
                {storedFixtureDetailsJson.homeTeamName}
              </span>
              <span className="FixturePage-vs">v</span>
              <span
                className="FixturePage-headingTeam FixturePage-headingTeam--away"
                title={storedFixtureDetailsJson.awayTeamName}
              >
                {storedFixtureDetailsJson.awayTeamName}
              </span>
            </h1>
          </div>
          <CreateBadge
            image={storedFixtureDetailsJson.awayTeamBadge}
            ClassName="FixturePage-badge FixturePage-badge--away"
            alt="Away team badge"
          />
        </div>

        <div className="FixturePage-meta">
          <span className="FixturePage-metaItem">
            {storedFixtureDetailsJson.stadium}
          </span>
          <span className="FixturePage-metaItem">
            KO: {storedFixtureDetailsJson.time}
          </span>
          {storedFixtureDetailsJson.leagueName ? (
            <span className="FixturePage-metaItem">
              {storedFixtureDetailsJson.leagueName}
            </span>
          ) : null}
        </div>

        <div className="FixturePage-prediction">
          <span className="FixturePage-predictionLabel">
            Soccer Stats Hub Prediction
          </span>
          <span className="FixturePage-predictionScore">
            {storedFixtureDetailsJson.homeGoals} –{" "}
            {storedFixtureDetailsJson.awayGoals}
          </span>
        </div>
      </header>

      <section className="FixturePage-chartCard ComparisonBarChart">
        <Bar
          key={theme}
          options={chartOptions}
          data={chartData}
          className="FixturePage-chart"
        />
      </section>

      <div className="FixturePage-pairedBlock">
        <div className="FixturePage-pairedHeaders">
          <PairedCardTitle
            side="home"
            name={storedFixtureDetailsJson.homeTeamName}
          />
          <PairedCardTitle
            side="away"
            name={storedFixtureDetailsJson.awayTeamName}
          />
        </div>

        {sections.map((section) => (
          <PairedStatSection
            key={section.id}
            title={section.title}
            homeContent={section.home.map((stat) => (
              <StatRow
                key={`home-${section.id}-${stat.label}`}
                label={stat.label}
                value={stat.value}
              />
            ))}
            awayContent={section.away.map((stat) => (
              <StatRow
                key={`away-${section.id}-${stat.label}`}
                label={stat.label}
                value={stat.value}
              />
            ))}
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

      <div className="FixturePage-pairedBlock FixturePage-pairedBlock--results">
        <div className="FixturePage-pairedHeaders">
          <PairedCardTitle
            side="home"
            name={storedFixtureDetailsJson.homeTeamName}
            subtitle="Recent Results"
          />
          <PairedCardTitle
            side="away"
            name={storedFixtureDetailsJson.awayTeamName}
            subtitle="Recent Results"
          />
        </div>

        <div className="FixturePage-pairedRow FixturePage-pairedRow--stretch">
          <ResultsColumn side="home" matches={recentResults.home} />
          <ResultsColumn side="away" matches={recentResults.away} />
        </div>
      </div>
    </div>
  );
}

export default TeamPage;

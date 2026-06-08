import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { CreateBadge } from "./createBadge";
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
    label === "Average Shot Value Against" &&
    value !== "" &&
    !Number.isNaN(Number(value))
  ) {
    return Number(value).toFixed(2);
  }

  return value;
}

// Avoids "undefined%" when API stats are missing on the /fixture page.
function formatPercentValue(value) {
  if (value == null || value === "") {
    return "—";
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return "—";
  }
  return `${n}%`;
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

function getSeasonStats(dataState, side) {
  const isHome = side === "home";

  const playedOnly = isHome
    ? dataState.playedHomeOnly
    : dataState.playedAwayOnly;
  const scoredOnly = isHome
    ? dataState.scoredOverallHomeOnly
    : dataState.scoredOverallAwayOnly;
  const concededOnly = isHome
    ? dataState.conceededOverallHomeOnly
    : dataState.conceededOverallAwayOnly;

  return [
    {
      label: "Scored overall",
      value: isHome ? dataState.scoredOverallHome : dataState.scoredOverallAway,
    },
    {
      label: "Conceeded overall",
      value: isHome
        ? dataState.conceededOverallHome
        : dataState.conceededOverallAway,
    },
    {
      label: `Average scored ${isHome ? "home" : "away"} only`,
      value: playedOnly ? (scoredOnly / playedOnly).toFixed(2) : "—",
    },
    {
      label: `Average conceeded ${isHome ? "home" : "away"} only`,
      value: playedOnly ? (concededOnly / playedOnly).toFixed(2) : "—",
    },
    {
      label: "PPG overall",
      value: isHome ? dataState.PPGOverallHome : dataState.PPGOverallAway,
    },
    {
      label: `PPG ${isHome ? "home" : "away"} only`,
      value: isHome ? dataState.PPGOverallHomeOnly : dataState.PPGOverallAwayOnly,
    },
    {
      label: "League position",
      value: isHome
        ? dataState.leaguePosition_overallHome
        : dataState.leaguePosition_overallAway,
    },
    {
      label: `League position ${isHome ? "home" : "away"} only`,
      value: isHome
        ? dataState.leaguePosition_HomeOnly
        : dataState.leaguePosition_AwayOnly,
    },
    {
      label: "BTTS",
      value: formatPercentValue(
        isHome
          ? dataState.BTTSPercentage_overallHome
          : dataState.BTTSPercentage_overallAway
      ),
    },
    {
      label: "BTTS and win",
      value: formatPercentValue(
        isHome
          ? dataState.BTTSAndWinPercentage_Home
          : dataState.BTTSAndWinPercentage_Away
      ),
    },
    {
      label: "BTTS and lose",
      value: formatPercentValue(
        isHome
          ? dataState.BTTSAndLosePercentage_Home
          : dataState.BTTSAndLosePercentage_Away
      ),
    },
    {
      label: "BTTS both halves",
      value: formatPercentValue(
        isHome ? dataState.BTTSBothHalvesHome : dataState.BTTSBothHalvesAway
      ),
    },
    {
      label: "Goal diff 1st half",
      value: isHome
        ? dataState.GoalDifferenceHT_overall_Home
        : dataState.GoalDifferenceHT_overall_Away,
    },
    {
      label: "Goal diff 2nd half",
      value: isHome ? dataState.GD_2hg_overall_Home : dataState.GD_2hg_overall_Away,
    },
    {
      label: "Leading at half time",
      value: formatPercentValue(
        isHome
          ? dataState.leadingAtHTPercentage_overallHome
          : dataState.leadingAtHTPercentage_overallAway
      ),
    },
    {
      label: "Over 1.5 goals",
      value: formatPercentValue(
        isHome
          ? dataState.seasonOver15Percentage_overallHome
          : dataState.seasonOver15Percentage_overallAway
      ),
    },
    {
      label: "Over 2.5 goals",
      value: formatPercentValue(
        isHome
          ? dataState.seasonOver25Percentage_overallHome
          : dataState.seasonOver25Percentage_overallAway
      ),
    },
    {
      label: "Over 3.5 goals",
      value: formatPercentValue(
        isHome
          ? dataState.seasonOver35Percentage_overallHome
          : dataState.seasonOver35Percentage_overallAway
      ),
    },
    {
      label: "Over 4.5 goals",
      value: formatPercentValue(
        isHome
          ? dataState.seasonOver45Percentage_overallHome
          : dataState.seasonOver45Percentage_overallAway
      ),
    },
    {
      label: "Scored both halves",
      value: formatPercentValue(
        isHome
          ? dataState.scoredBothHalvesPercentage_overallHome
          : dataState.scoredBothHalvesPercentage_overallAway
      ),
    },
    {
      label: "SOTs per goal",
      value: isHome
        ? dataState.shots_on_target_per_goals_scored_overallHome
        : dataState.shots_on_target_per_goals_scored_overallAway,
    },
    {
      label: "Corners avg",
      value: isHome
        ? dataState.cornersTotalAVG_overallHome
        : dataState.cornersTotalAVG_overallAway,
    },
    {
      label: "Cards avg",
      value: isHome ? dataState.cardsAVG_overallHome : dataState.cardsAVG_overallAway,
    },
    {
      label: "Fouls against avg",
      value: isHome ? dataState.foulsAVG_overallHome : dataState.foulsAVG_overallAway,
    },
    {
      label: "Penalties won avg",
      value: isHome
        ? dataState.penalties_won_per_match_overallHome
        : dataState.penalties_won_per_match_overallAway,
    },
    {
      label: "Penalties in match",
      value: formatPercentValue(
        isHome
          ? dataState.penalty_in_a_match_percentage_overallHome
          : dataState.penalty_in_a_match_percentage_overallAway
      ),
    },
  ];
}

function TeamPage() {
  const [dataState, setData] = useState({});
  const storedFixtureDetails = useSelector(
    (state) => state.data.fixtureDetails
  );
  const storedFixtureDetailsJson = JSON.parse(storedFixtureDetails || "{}");

  const fetchData = async () => {
    try {
      const responseHome = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}team/${storedFixtureDetailsJson.homeId}`
      );
      const resultHome = await responseHome.json();

      const responseAway = await fetch(
        `${process.env.REACT_APP_EXPRESS_SERVER}team/${storedFixtureDetailsJson.awayId}`
      );
      const resultAway = await responseAway.json();

      const indexHome = resultHome.data.findIndex(
        (x) => x.season_format === "Domestic League"
      );
      const indexAway = resultAway.data.findIndex(
        (x) => x.season_format === "Domestic League"
      );

      if (resultHome.data[indexHome].stats.seasonScoredNum_overall) {
        setData((test) => ({
          ...test,
          scoredOverallHome:
            resultHome.data[indexHome].stats.seasonScoredNum_overall,
          playedHomeOnly:
            resultHome.data[indexHome].stats.seasonMatchesPlayed_home,
          scoredOverallHomeOnly:
            resultHome.data[indexHome].stats.seasonScoredNum_home,
          conceededOverallHome:
            resultHome.data[indexHome].stats.seasonConcededNum_overall,
          conceededOverallHomeOnly:
            resultHome.data[indexHome].stats.seasonConcededNum_home,
          PPGOverallHome: resultHome.data[indexHome].stats.seasonPPG_overall,
          PPGOverallHomeOnly: resultHome.data[indexHome].stats.seasonPPG_home,
          leaguePosition_overallHome:
            resultHome.data[indexHome].stats.leaguePosition_overall,
          leaguePosition_HomeOnly:
            resultHome.data[indexHome].stats.leaguePosition_home,
          averageAttendance:
            resultHome.data[indexHome].stats.average_attendance_home,
          BTTSPercentage_overallHome:
            resultHome.data[indexHome].stats.seasonBTTSPercentage_overall,
          BTTSAndWinPercentage_Home:
            resultHome.data[indexHome].stats.BTTS_and_win_percentage_overall,
          BTTSAndLosePercentage_Home:
            resultHome.data[indexHome].stats.BTTS_and_lose_percentage_overall,
          BTTSBothHalvesHome:
            resultHome.data[indexHome].stats
              .BTTS_both_halves_percentage_overall,
          GoalDifferenceHT_overall_Home:
            resultHome.data[indexHome].stats.GoalDifferenceHT_overall,
          GD_2hg_overall_Home: resultHome.data[indexHome].stats.gd_2hg_overall,
          leadingAtHTPercentage_overallHome:
            resultHome.data[indexHome].stats.leadingAtHTPercentage_overall,
          seasonOver15Percentage_overallHome:
            resultHome.data[indexHome].stats.seasonOver15Percentage_overall,
          seasonOver25Percentage_overallHome:
            resultHome.data[indexHome].stats.seasonOver25Percentage_overall,
          seasonOver35Percentage_overallHome:
            resultHome.data[indexHome].stats.seasonOver35Percentage_overall,
          seasonOver45Percentage_overallHome:
            resultHome.data[indexHome].stats.seasonOver45Percentage_overall,
          scoredBothHalvesPercentage_overallHome:
            resultHome.data[indexHome].stats.scoredBothHalvesPercentage_overall,
          shots_on_target_per_goals_scored_overallHome:
            resultHome.data[indexHome].stats.additional_info
              .shots_on_target_per_goals_scored_overall,
          cornersTotalAVG_overallHome:
            resultHome.data[indexHome].stats.cornersTotalAVG_overall,
          cardsAVG_overallHome:
            resultHome.data[indexHome].stats.cardsAVG_overall,
          foulsAVG_overallHome:
            resultHome.data[indexHome].stats.foulsAVG_overall,
          penalties_won_per_match_overallHome:
            resultHome.data[indexHome].stats.additional_info
              .penalties_won_per_match_overall,
          penalty_in_a_match_percentage_overallHome:
            resultHome.data[indexHome].stats.additional_info
              .penalty_in_a_match_percentage_overall,
          scoredOverallAway:
            resultAway.data[indexAway].stats.seasonScoredNum_overall,
          playedAwayOnly:
            resultAway.data[indexAway].stats.seasonMatchesPlayed_away,
          scoredOverallAwayOnly:
            resultAway.data[indexAway].stats.seasonScoredNum_away,
          conceededOverallAway:
            resultAway.data[indexAway].stats.seasonConcededNum_overall,
          conceededOverallAwayOnly:
            resultAway.data[indexAway].stats.seasonConcededNum_away,
          PPGOverallAway: resultAway.data[indexAway].stats.seasonPPG_overall,
          PPGOverallAwayOnly: resultAway.data[indexAway].stats.seasonPPG_away,
          leaguePosition_overallAway:
            resultAway.data[indexAway].stats.leaguePosition_overall,
          leaguePosition_AwayOnly:
            resultAway.data[indexAway].stats.leaguePosition_away,
          BTTSPercentage_overallAway:
            resultAway.data[indexAway].stats.seasonBTTSPercentage_overall,
          BTTSAndWinPercentage_Away:
            resultAway.data[indexAway].stats.BTTS_and_win_percentage_overall,
          BTTSAndLosePercentage_Away:
            resultAway.data[indexAway].stats.BTTS_and_lose_percentage_overall,
          BTTSBothHalvesAway:
            resultAway.data[indexAway].stats
              .BTTS_both_halves_percentage_overall,
          GoalDifferenceHT_overall_Away:
            resultAway.data[indexAway].stats.GoalDifferenceHT_overall,
          GD_2hg_overall_Away: resultAway.data[indexAway].stats.gd_2hg_overall,
          leadingAtHTPercentage_overallAway:
            resultAway.data[indexAway].stats.leadingAtHTPercentage_overall,
          seasonOver15Percentage_overallAway:
            resultAway.data[indexAway].stats.seasonOver15Percentage_overall,
          seasonOver25Percentage_overallAway:
            resultAway.data[indexAway].stats.seasonOver25Percentage_overall,
          seasonOver35Percentage_overallAway:
            resultAway.data[indexAway].stats.seasonOver35Percentage_overall,
          seasonOver45Percentage_overallAway:
            resultAway.data[indexAway].stats.seasonOver45Percentage_overall,
          scoredBothHalvesPercentage_overallAway:
            resultAway.data[indexAway].stats.scoredBothHalvesPercentage_overall,
          shots_on_target_per_goals_scored_overallAway:
            resultAway.data[indexAway].stats.additional_info
              .shots_on_target_per_goals_scored_overall,
          cornersTotalAVG_overallAway:
            resultAway.data[indexAway].stats.cornersTotalAVG_overall,
          cardsAVG_overallAway:
            resultAway.data[indexAway].stats.cardsAVG_overall,
          foulsAVG_overallAway:
            resultAway.data[indexAway].stats.foulsAVG_overall,
          penalties_won_per_match_overallAway:
            resultAway.data[indexAway].stats.additional_info
              .penalties_won_per_match_overall,
          penalty_in_a_match_percentage_overallAway:
            resultAway.data[indexAway].stats.additional_info
              .penalty_in_a_match_percentage_overall,
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (storedFixtureDetailsJson?.homeId && storedFixtureDetailsJson?.awayId) {
      fetchData();
    }
  }, [storedFixtureDetailsJson?.homeId, storedFixtureDetailsJson?.awayId]);

  const theme = useChartTheme();
  const { color, gridColor, tooltipBackground } = getChartColors(theme);

  const storedDataHome = useSelector((state) => state.data.dataHome);
  const jsonDataHome = JSON.parse(storedDataHome || "{}");
  const propertyNamesHome = Object.entries(jsonDataHome);

  const storedDataHomeDef = useSelector((state) => state.data.dataHomeDef);
  const jsonDataHomeDef = JSON.parse(storedDataHomeDef || "{}");
  const propertyNamesHomeDef = Object.entries(jsonDataHomeDef);

  const storedDataallTeamResultsHome = useSelector(
    (state) => state.data.allTeamResultsHome
  );
  const jsonDataallTeamResultsHome = JSON.parse(
    storedDataallTeamResultsHome || "[]"
  );
  const propertyNamesallTeamResultsHome = (
    Array.isArray(jsonDataallTeamResultsHome)
      ? jsonDataallTeamResultsHome
      : Object.values(jsonDataallTeamResultsHome)
  )
    .map(normalizeResultMatch)
    .filter(Boolean);

  const homeDetails = useSelector((state) => state.data.homeDetails);
  const jsonHomeDetails = JSON.parse(homeDetails || "{}");

  const storedDataAway = useSelector((state) => state.data.dataAway);
  const jsonDataAway = JSON.parse(storedDataAway || "{}");
  const propertyNamesAway = Object.entries(jsonDataAway);

  const storedDataAwayDef = useSelector((state) => state.data.dataAwayDef);
  const jsonDataAwayDef = JSON.parse(storedDataAwayDef || "{}");
  const propertyNamesAwayDef = Object.entries(jsonDataAwayDef);

  const storedDataallTeamResultsAway = useSelector(
    (state) => state.data.allTeamResultsAway
  );
  const jsonDataallTeamResultsAway = JSON.parse(
    storedDataallTeamResultsAway || "[]"
  );
  const propertyNamesallTeamResultsAway = (
    Array.isArray(jsonDataallTeamResultsAway)
      ? jsonDataallTeamResultsAway
      : Object.values(jsonDataallTeamResultsAway)
  )
    .map(normalizeResultMatch)
    .filter(Boolean);

  const awayDetails = useSelector((state) => state.data.awayDetails);
  const jsonAwayDetails = JSON.parse(awayDetails || "{}");

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
        data: [
          jsonHomeDetails["Attacking Strength"],
          jsonAwayDetails["Attacking Strength"],
        ],
        label: "Attacking Strength",
        backgroundColor: "#01a501",
      },
      {
        data: [
          jsonHomeDetails["Defensive Strength"],
          jsonAwayDetails["Defensive Strength"],
        ],
        label: "Defensive Strength",
        backgroundColor: "#d71200",
      },
    ],
  };

  const homeSeasonStats = getSeasonStats(dataState, "home");
  const awaySeasonStats = getSeasonStats(dataState, "away");

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
          {dataState.averageAttendance != null && (
            <span className="FixturePage-metaItem">
              Avg attendance: {dataState.averageAttendance}
            </span>
          )}
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

        <PairedStatSection
          title="Attacking"
          homeContent={propertyNamesHome.map(([key, value], index) => (
            <StatRow key={`home-att-${index}`} label={key} value={value} />
          ))}
          awayContent={propertyNamesAway.map(([key, value], index) => (
            <StatRow key={`away-att-${index}`} label={key} value={value} />
          ))}
        />

        <PairedStatSection
          title="Defensive"
          homeContent={propertyNamesHomeDef.map(([key, value], index) => (
            <StatRow key={`home-def-${index}`} label={key} value={value} />
          ))}
          awayContent={propertyNamesAwayDef.map(([key, value], index) => (
            <StatRow key={`away-def-${index}`} label={key} value={value} />
          ))}
        />

        <PairedStatSection
          title="Season Stats"
          homeContent={homeSeasonStats.map((stat) => (
            <StatRow
              key={`home-season-${stat.label}`}
              label={stat.label}
              value={stat.value}
            />
          ))}
          awayContent={awaySeasonStats.map((stat) => (
            <StatRow
              key={`away-season-${stat.label}`}
              label={stat.label}
              value={stat.value}
            />
          ))}
        />
      </div>

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
          <ResultsColumn
            side="home"
            matches={propertyNamesallTeamResultsHome}
          />
          <ResultsColumn
            side="away"
            matches={propertyNamesallTeamResultsAway}
          />
        </div>
      </div>
    </div>
  );
}

export default TeamPage;

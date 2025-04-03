import React, { useState, useEffect } from "react";
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
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function TeamPage() {
  const [dataState, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

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
      // setData(result.data.stadium_name);

      let indexHome = resultHome.data.findIndex(
        (x) => x.season_format === "Domestic League"
      );
      let indexAway = resultAway.data.findIndex(
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

  const storedDataHome = useSelector((state) => state.data.dataHome);
  const jsonDataHome = JSON.parse(storedDataHome);
  const propertyNamesHome = Object.entries(jsonDataHome);

  const storedDataHomeDef = useSelector((state) => state.data.dataHomeDef);
  const jsonDataHomeDef = JSON.parse(storedDataHomeDef);
  const propertyNamesHomeDef = Object.entries(jsonDataHomeDef);

  const storedDataallTeamResultsHome = useSelector(
    (state) => state.data.allTeamResultsHome
  );
  const jsonDataallTeamResultsHome = JSON.parse(storedDataallTeamResultsHome);
  const propertyNamesallTeamResultsHome = Object.values(
    jsonDataallTeamResultsHome
  );

  const homeDetails = useSelector((state) => state.data.homeDetails);
  const jsonHomeDetails = JSON.parse(homeDetails);

  const storedDataAway = useSelector((state) => state.data.dataAway);
  const jsonDataAway = JSON.parse(storedDataAway);
  const propertyNamesAway = Object.entries(jsonDataAway);

  const storedDataAwayDef = useSelector((state) => state.data.dataAwayDef);
  const jsonDataAwayDef = JSON.parse(storedDataAwayDef);
  const propertyNamesAwayDef = Object.entries(jsonDataAwayDef);

  const storedDataallTeamResultsAway = useSelector(
    (state) => state.data.allTeamResultsAway
  );
  const jsonDataallTeamResultsAway = JSON.parse(storedDataallTeamResultsAway);
  const propertyNamesallTeamResultsAway = Object.values(
    jsonDataallTeamResultsAway
  );

  const awayDetails = useSelector((state) => state.data.awayDetails);
  const jsonAwayDetails = JSON.parse(awayDetails);

  const storedFixtureDetails = useSelector(
    (state) => state.data.fixtureDetails
  );
  const storedFixtureDetailsJson = JSON.parse(storedFixtureDetails);
  console.log(jsonAwayDetails);

  const options = {
    plugins: {
      title: {
        display: true,
        text: "Team comparison",
      },
    },
    aspectRatio: 0.5,
    maintainAspectRatio: true,
    responsive: true,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        display: false,
      },
    },
  };
  const labels = [
    storedFixtureDetailsJson.homeTeamName,
    storedFixtureDetailsJson.awayTeamName,
  ];

  const data = {
    labels,
    datasets: [
      {
        data: [
          jsonHomeDetails["Attacking Strength"],
          jsonAwayDetails["Attacking Strength"],
        ],
        label: "Attacking Strength",
        backgroundColor: "#030061",
      },
      {
        data: [
          jsonHomeDetails["Defensive Strength"],
          jsonAwayDetails["Defensive Strength"],
        ],
        label: "Defensive Strength",
        backgroundColor: "#CC3314",
      },
    ],
  };

  return (
    <div className="TeamStatsContainer">
      <div className="FixtureHeadingContiner">
        <CreateBadge
          image={storedFixtureDetailsJson.homeTeamBadge}
          ClassName="HomeTeamBadge"
          alt="Home team badge"
        ></CreateBadge>
        {`${storedFixtureDetailsJson.homeTeamName} v ${storedFixtureDetailsJson.awayTeamName}`}
        <CreateBadge
          image={storedFixtureDetailsJson.awayTeamBadge}
          ClassName="AwayTeamBadge"
          alt="Away team badge"
        ></CreateBadge>
      </div>
      <h3>
        {storedFixtureDetailsJson.stadium} KO: {storedFixtureDetailsJson.time} |
        Average Attendance: {dataState.averageAttendance}
      </h3>
      <h3>
        Soccer Stats Hub Prediction: {storedFixtureDetailsJson.homeGoals} -{" "}
        {storedFixtureDetailsJson.awayGoals}
      </h3>
      <div className="TeamStats">
        <ul className="HomeTeamStats">
          <iframe
            title="HomeTeamStats"
            src={`https://footystats.org/api/club?id=${storedFixtureDetailsJson.homeId}`}
            height="100%"
            width="100%"
            style={{
              height: "420px",
              width: "100%",
              border: "0.1em solid #030061",
            }}
          ></iframe>
          <h3>{storedFixtureDetailsJson.homeTeamName}</h3>
          {propertyNamesHome.map(([key, value], index) => (
            <li key={index}>
              <strong>{key}:</strong>{" "}
              {typeof value === "object" ? JSON.stringify(value) : value}
            </li>
          ))}
          <ul className="HomeTeamStats">
            {propertyNamesHomeDef.map(([key, value], index) => (
              <li key={index}>
                <strong>{key}:</strong>{" "}
                {typeof value === "object" ? JSON.stringify(value) : value}
              </li>
            ))}
          </ul>
          <li>Scored overall: {dataState.scoredOverallHome}</li>
          <li>Conceeded overall: {dataState.conceededOverallHome}</li>
          <li>
            Average scored home only:{" "}
            {(
              dataState.scoredOverallHomeOnly / dataState.playedHomeOnly
            ).toFixed(2)}
          </li>
          <li>
            Average conceeded home only:{" "}
            {(
              dataState.conceededOverallHomeOnly / dataState.playedHomeOnly
            ).toFixed(2)}
          </li>
          <li>PPG overall: {dataState.PPGOverallHome}</li>
          <li>PPG home only: {dataState.PPGOverallHomeOnly}</li>
          <li>League position: {dataState.leaguePosition_overallHome}</li>
          <li>
            League position home only: {dataState.leaguePosition_HomeOnly}
          </li>
          <li>BTTS {dataState.BTTSPercentage_overallHome}%</li>
          <li>BTTS and win: {dataState.BTTSAndWinPercentage_Home}%</li>
          <li>BTTS and lose: {dataState.BTTSAndLosePercentage_Home}%</li>
          <li>BTTS both halves: {dataState.BTTSBothHalvesHome}%</li>
          <li>
            Goal diff 1st half only: {dataState.GoalDifferenceHT_overall_Home}
          </li>
          <li>Goal diff 2nd half only: {dataState.GD_2hg_overall_Home}</li>
          <li>
            Leading at half time: {dataState.leadingAtHTPercentage_overallHome}%
          </li>
          <li>
            Over 1.5 goals in games:{" "}
            {dataState.seasonOver15Percentage_overallHome}%
          </li>
          <li>
            Over 2.5 goals in games:{" "}
            {dataState.seasonOver25Percentage_overallHome}%
          </li>
          <li>
            Over 3.5 goals in games:{" "}
            {dataState.seasonOver35Percentage_overallHome}%
          </li>
          <li>
            Over 4.5 goals in games:{" "}
            {dataState.seasonOver45Percentage_overallHome}%
          </li>
          <li>
            Scored both halves:{" "}
            {dataState.scoredBothHalvesPercentage_overallHome}%
          </li>
          <li>
            SOTs per goal:{" "}
            {dataState.shots_on_target_per_goals_scored_overallHome}
          </li>
          <li>Corners in game avg: {dataState.cornersTotalAVG_overallHome}</li>
          <li>Cards avg: {dataState.cardsAVG_overallHome}</li>
          <li>Fouls against avg: {dataState.foulsAVG_overallHome}</li>
          <li>
            Penalties won avg: {dataState.penalties_won_per_match_overallHome}
          </li>
          <li>
            Penalties in match:{" "}
            {dataState.penalty_in_a_match_percentage_overallHome}%
          </li>
        </ul>
        <ul className="AwayTeamStats">
          <iframe
            title="AwayTeamStats"
            src={`https://footystats.org/api/club?id=${storedFixtureDetailsJson.awayId}`}
            height="100%"
            width="100%"
            style={{
              height: "420px",
              width: "100%",
              color: "#030061",
              border: "0.1em solid #030061",
            }}
          ></iframe>
          <h3>{storedFixtureDetailsJson.awayTeamName}</h3>
          {propertyNamesAway.map(([key, value], index) => (
            <li key={index}>
              <strong>{key}:</strong>{" "}
              {typeof value === "object" ? JSON.stringify(value) : value}
            </li>
          ))}
          <ul className="AwayTeamStats">
            {propertyNamesAwayDef.map(([key, value], index) => (
              <li key={index}>
                <strong>{key}:</strong>{" "}
                {typeof value === "object" ? JSON.stringify(value) : value}
              </li>
            ))}
          </ul>
          <li>Scored overall: {dataState.scoredOverallAway}</li>
          <li>Conceeded overall: {dataState.conceededOverallAway}</li>
          <li>
            Average scored away only:{" "}
            {(
              dataState.scoredOverallAwayOnly / dataState.playedAwayOnly
            ).toFixed(2)}
          </li>
          <li>
            Average conceeded away only:{" "}
            {(
              dataState.conceededOverallAwayOnly / dataState.playedAwayOnly
            ).toFixed(2)}
          </li>
          <li>PPG overall: {dataState.PPGOverallAway}</li>
          <li>PPG away only: {dataState.PPGOverallAwayOnly}</li>
          <li>League position: {dataState.leaguePosition_overallAway}</li>
          <li>
            League position away only: {dataState.leaguePosition_AwayOnly}
          </li>
          <li>BTTS: {dataState.BTTSPercentage_overallAway}%</li>
          <li>BTTS and win: {dataState.BTTSAndWinPercentage_Away}%</li>
          <li>BTTS and lose: {dataState.BTTSAndLosePercentage_Away}%</li>
          <li>BTTS both halves: {dataState.BTTSBothHalvesAway}%</li>
          <li>
            Goal diff 1st half only: {dataState.GoalDifferenceHT_overall_Away}
          </li>
          <li>Goal diff 2nd half only: {dataState.GD_2hg_overall_Away}</li>
          <li>
            Leading at half time: {dataState.leadingAtHTPercentage_overallAway}%
          </li>
          <li>
            Over 1.5 goals in games:{" "}
            {dataState.seasonOver15Percentage_overallAway}%
          </li>
          <li>
            Over 2.5 goals in games:{" "}
            {dataState.seasonOver25Percentage_overallAway}%
          </li>
          <li>
            Over 3.5 goals in games:{" "}
            {dataState.seasonOver35Percentage_overallAway}%
          </li>
          <li>
            Over 4.5 goals in games:{" "}
            {dataState.seasonOver45Percentage_overallAway}%
          </li>
          <li>
            Scored both halves:{" "}
            {dataState.scoredBothHalvesPercentage_overallAway}%
          </li>
          <li>
            SOTs per goal:{" "}
            {dataState.shots_on_target_per_goals_scored_overallAway}
          </li>
          <li>Corners in game avg: {dataState.cornersTotalAVG_overallAway}</li>
          <li>Cards avg: {dataState.cardsAVG_overallAway}</li>
          <li>Fouls against avg: {dataState.foulsAVG_overallAway}</li>
          <li>
            Penalties won avg: {dataState.penalties_won_per_match_overallAway}
          </li>
          <li>
            Penalties in match:{" "}
            {dataState.penalty_in_a_match_percentage_overallAway}%
          </li>
        </ul>
        <div className="ChartContainer">
          <span className="Spacer"></span>
          <Bar options={options} data={data} className="ComparisonBar" />
          <span className="Spacer"></span>
        </div>
        <ul className="HomeTeamResults">
          {propertyNamesallTeamResultsHome.map((match, index) => (
            <>
              <div className="MatchDate">{match.date}</div>
              <div className="ResultRowOverviewSmall">
                <div className="columnOverviewHomeSmall">{match.homeTeam}</div>
                <span className="columnOverviewScoreSmall">
                  {match.homeGoals} : {match.awayGoals}
                </span>
                <div className="columnOverviewAwaySmall">{match.awayTeam}</div>
              </div>
            </>
          ))}
        </ul>
        <ul className="AwayTeamResults">
          {propertyNamesallTeamResultsAway.map((match, index) => (
            <>
              <div className="MatchDate">{match.date}</div>
              <div className="ResultRowOverviewSmall">
                <div className="columnOverviewHomeSmall">{match.homeTeam}</div>
                <span className="columnOverviewScoreSmall">
                  {match.homeGoals} : {match.awayGoals}
                </span>
                <div className="columnOverviewAwaySmall">{match.awayTeam}</div>
              </div>
            </>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TeamPage;

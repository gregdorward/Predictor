import React, { useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Collapsable from "../components/CollapsableElement";
import TeamOfTheWeek from "../components/TeamOfTheWeek";
import TeamOfTheSeason from "../components/TeamOfTheSeason";

export var toggleState = false;
export var setIsOff = false;

const upArrow = "\u{25B2}";

const StyledTableCell2 = withStyles((theme) => ({
  head: {
    // backgroundColor: "rgba(226, 226, 226, 1)",
    // color: "white",
    padding: "0.35em",
    paddingTop: "0.75em",
    paddingBottom: "0.75em",
    textAlign: "left",
    fontSize: "1.9em",
    fontFamily: "inherit",
    // border: "none",
    margin: "none",
  },
  body: {
    fontSize: "1.9em",
    textAlign: "left",
    fontFamily: "inherit",
    padding: "0.5em",
    paddingTop: "0.75em",
    paddingBottom: "0.75em",
    // border: "none",
    margin: "none",
    // color: "#030061",
  },
}))(TableCell);

const StyledTableCell = withStyles((theme) => ({
  head: {
    // backgroundColor: "white",
    // color: "#030061",
    padding: "0.5em",
    paddingTop: "1em",
    paddingBottom: "1em",
    textAlign: "center",
    fontSize: "1.9em",
    fontFamily: "inherit",
    // border: "none",
    margin: "none",
  },
  body: {
    // backgroundColor: "#030061",
    fontSize: "1.9em",
    textAlign: "center",
    fontFamily: "inherit",
    padding: "0.35em",
    paddingTop: "1em",
    paddingBottom: "1em",
    // border: "none",
    margin: "none",
    // color: "#030061",
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      // backgroundColor: "#rgba(226, 226, 226, 0.424)",
      textAlign: "center",
    },
    "&:nth-of-type(even)": {
      // backgroundColor: "#rgba(226, 226, 226, 1)",
      textAlign: "center",
    },
  },
}))(TableRow);

function styleForm(formIndicator) {
  let className;
  if (formIndicator === "W") {
    className = "winLeague";
  } else if (formIndicator === "D") {
    className = "drawLeague";
  } else if (formIndicator === "L") {
    className = "lossLeague";
  }
  return className;
}

export default function LeagueTable(props) {
  [toggleState, setIsOff] = useState(false);

  let rows = props.Teams.map((team, i) => (
    <StyledTableRow key={`${props.Key}row${i}`}>
      <StyledTableCell component="th" scope="row">
        {`${i + 1}`}
      </StyledTableCell>
      <StyledTableCell2 component="th" scope="row" style={{ width: "15em" }}>
        {`${team.Name}`}
      </StyledTableCell2>
      <StyledTableCell component="th" scope="row">
        {`${team.Played}`}
      </StyledTableCell>
      <StyledTableCell component="th" scope="row">
        {`${team.Wins}`}
      </StyledTableCell>
      <StyledTableCell component="th" scope="row">
        {`${team.Draws}`}
      </StyledTableCell>
      <StyledTableCell component="th" scope="row">
        {`${team.Losses}`}
      </StyledTableCell>
      <StyledTableCell component="th" scope="row">
        {`${team.For}`}
      </StyledTableCell>
      <StyledTableCell component="th" scope="row">
        {`${team.Against}`}
      </StyledTableCell>
      <StyledTableCell component="th" scope="row">
        {`${team.GoalDifference}`}
      </StyledTableCell>
      <StyledTableCell component="th" scope="row">
        {`${team.Points}`}
      </StyledTableCell>
      <StyledTableCell
        component="th"
        scope="row"
        style={{ textAlign: "center" }}
      >
        <span className={styleForm(team.Form[0])}>
          {team.Form[0] !== undefined ? team.Form[0] : ""}
        </span>
        <span className={styleForm(team.Form[1])}>
          {team.Form[1] !== undefined ? team.Form[1] : ""}
        </span>
        <span className={styleForm(team.Form[2])}>
          {team.Form[2] !== undefined ? team.Form[2] : ""}
        </span>
        <span className={styleForm(team.Form[3])}>
          {team.Form[3] !== undefined ? team.Form[3] : ""}
        </span>
        <span className={styleForm(team.Form[4])}>
          {team.Form[4] !== undefined ? team.Form[4] : ""}
        </span>
      </StyledTableCell>
    </StyledTableRow>
  ));

  const leagueResults = [];
  let singleResult;
  if (props.Results) {
    props.Results.forEach((result) => {
      singleResult = (
        <div>
          <div className="ResultRow">
            <span className="column">{result.team_a_xg}</span>
            <span className="column">XG</span>
            <span className="column">{result.team_b_xg}</span>
          </div>
          <div className="ResultRow">
            <span className="column">{result.team_a_shots}</span>
            <span className="column">Shots</span>
            <span className="column">{result.team_b_shots}</span>
          </div>
          <div className="ResultRow">
            <span className="column">{result.team_a_shotsOnTarget}</span>
            <span className="column">SOT</span>
            <span className="column">{result.team_b_shotsOnTarget}</span>
          </div>
          <div className="ResultRow">
            <span className="column">{result.team_a_dangerous_attacks}</span>
            <span className="column">Dangerous Attacks</span>
            <span className="column">{result.team_b_dangerous_attacks}</span>
          </div>
          <div className="ResultRow">
            <span className="column">{result.team_a_possession}%</span>
            <span className="column">Possession</span>
            <span className="column">{result.team_b_possession}%</span>
          </div>
          <div className="ResultRow">
            <span className="column">{result.team_a_red_cards}</span>
            <span className="column">Red cards</span>
            <span className="column">{result.team_b_red_cards}</span>
          </div>
          <div className="ResultRow">
            <span className="column">{result.odds_ft_1}</span>
            <span className="column">Odds (pre-match)</span>
            <span className="column">{result.odds_ft_2}</span>
          </div>
        </div>
      );

      leagueResults.push(
        <Collapsable
          classNameButton="ResultButton"
          buttonText={
            <div className="ResultRowOverview">
              <div className="columnOverviewHome">{result.home_name}</div>
              <span className="columnOverviewScore">
                {result.homeGoalCount} : {result.awayGoalCount}
              </span>
              <div className="columnOverviewAway">{result.away_name}</div>
            </div>
          }
          element={singleResult}
        />
      );
    });
  }

  const leagueResultsOlder = [];
  if (props.LastWeeksResults) {
    props.LastWeeksResults.forEach((result) => {
      singleResult = (
        <div>
          <div className="ResultRow">
            <span className="column">{result.team_a_xg}</span>
            <span className="column">XG</span>
            <span className="column">{result.team_b_xg}</span>
          </div>
          <div className="ResultRow">
            <span className="column">{result.team_a_shots}</span>
            <span className="column">Shots</span>
            <span className="column">{result.team_b_shots}</span>
          </div>
          <div className="ResultRow">
            <span className="column">{result.team_a_shotsOnTarget}</span>
            <span className="column">SOT</span>
            <span className="column">{result.team_b_shotsOnTarget}</span>
          </div>
          <div className="ResultRow">
            <span className="column">{result.team_a_dangerous_attacks}</span>
            <span className="column">Dangerous Attacks</span>
            <span className="column">{result.team_b_dangerous_attacks}</span>
          </div>
          <div className="ResultRow">
            <span className="column">{result.team_a_possession}</span>
            <span className="column">Possession</span>
            <span className="column">{result.team_b_possession}</span>
          </div>
          <div className="ResultRow">
            <span className="column">{result.team_a_red_cards}</span>
            <span className="column">Red cards</span>
            <span className="column">{result.team_b_red_cards}</span>
          </div>
          <div className="ResultRow">
            <span className="column">{result.odds_ft_1}</span>
            <span className="column">Odds (pre-match)</span>
            <span className="column">{result.odds_ft_2}</span>
          </div>
        </div>
      );

      leagueResultsOlder.push(
        <Collapsable
          classNameButton="ResultButton"
          buttonText={
            <div className="ResultRowOverview">
              <div className="columnOverviewHome">{result.home_name}</div>
              <span className="columnOverviewScore">
                {result.homeGoalCount} : {result.awayGoalCount}
              </span>
              <div className="columnOverviewAway">{result.away_name}</div>
            </div>
          }
          element={singleResult}
        />
      );
    });
  }

  function getTopScorersTeam(id) {
    let found = props.Teams.find((team) => team.ID === id);
    return found.Name;
  }

  async function sorted(league, value, order) {
    console.log(league)
    console.log(value)
    console.log(order)

    let sortedByForm;
    if (order === "desc") {
      sortedByForm = league.sort((a, b) => b[value] - a[value]);
    } else {
      sortedByForm = league.sort((a, b) => a[value] - b[value]);
    }
    setIsOff(!toggleState);
    console.log(sortedByForm)
    return sortedByForm;
  }

  if (
    // props.GamesPlayed > 3 &&
    props.Teams[0].LeagueID !== 13973 && //MLS
    props.Teams[0].LeagueID !== 12933 && //UKNorth&South
    props.Teams[0].LeagueID !== 12327 && //Europa
    props.Teams[0].LeagueID !== 12321 //ChampionsLeague
  ) {
    for (let i = 0; i < props.Teams.length; i++) {
      return (
        <TableContainer component={Paper} className="StatsTable">
          <Table
            className="Table"
            aria-label="customized table"
            key={props.Key}
            style={{ marginTop: "2em", marginBottom: "1em" }}
          >
            <TableHead>
              <TableRow>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell></StyledTableCell>
                <StyledTableCell>Pld</StyledTableCell>
                <StyledTableCell>W</StyledTableCell>
                <StyledTableCell>D</StyledTableCell>
                <StyledTableCell>L</StyledTableCell>
                <StyledTableCell>GF</StyledTableCell>
                <StyledTableCell>GA</StyledTableCell>
                <StyledTableCell>GD</StyledTableCell>
                <td>
                  <button
                    className="SortedColumn"
                    style={{ textAlign: "center" }}
                    onClick={() => sorted(props.Teams, "Points", "desc")}
                  >
                    Pts {upArrow}
                  </button>
                </td>
                <td>
                  <button
                    className="SortedColumn"
                    style={{ textAlign: "center" }}
                    onClick={() => sorted(props.Teams, "LastXPoints", "desc")}
                  >
                    Last 5 {upArrow}
                  </button>
                </td>
              </TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
          </Table>
          <h5>{`Results from last 2 weeks`}</h5>
          <div className="ResultsList" id="ResultsList">
            <ul>{leagueResults}</ul>
          </div>
          {props.Teams[0].LeagueID === 12325 && <TeamOfTheSeason />}{" "}
          {/* Conditional render */}
          <div className="LeagueStatisticsHeader">League Statistics</div>
          <div className="LeagueStatistics">
            <ul className="LeagueStatsColumn">
              <li>Average home goals: {props.Stats.seasonAVG_home}</li>
              <li>Average away goals: {props.Stats.seasonAVG_away}</li>
              <li>BTTS: {props.Stats.seasonBTTSPercentage}%</li>
              <li>
                Over 0.5 goals: {props.Stats.seasonOver05Percentage_overall}%
              </li>
              <li>
                Over 1.5 goals: {props.Stats.seasonOver15Percentage_overall}%
              </li>
              <li>
                Over 2.5 goals: {props.Stats.seasonOver25Percentage_overall}%
              </li>
              <li>
                Over 3.5 goals: {props.Stats.seasonOver35Percentage_overall}%
              </li>
              <li>
                Over 4.5 goals: {props.Stats.seasonOver45Percentage_overall}%
              </li>
            </ul>
            <ul className="LeagueStatsColumn">
              <li>
                Over 7.5 corners: {props.Stats.over75CornersPercentage_overall}%
              </li>
              <li>
                Over 8.5 corners: {props.Stats.over85CornersPercentage_overall}%
              </li>
              <li>
                Over 9.5 corners: {props.Stats.over95CornersPercentage_overall}%
              </li>
              <li>
                Over 10.5 corners:{" "}
                {props.Stats.over105CornersPercentage_overall}%
              </li>
              <li>
                Over 11.5 corners:{" "}
                {props.Stats.over115CornersPercentage_overall}%
              </li>
              <li>
                Over 12.5 corners:{" "}
                {props.Stats.over125CornersPercentage_overall}%
              </li>
              <li>Corners average: {props.Stats.cornersAVG_overall}</li>
              <li>Cards average: {props.Stats.cardsAVG_overall}</li>
            </ul>
            <ul className="TopScorersColumn">
              <h4>Top scorers</h4>
              <li>
                {props.Stats.top_scorers[0].known_as} (
                {getTopScorersTeam(props.Stats.top_scorers[0].club_team_id)}):{" "}
                {props.Stats.top_scorers[0].goals_overall}
              </li>
              <li>
                {props.Stats.top_scorers[1].known_as} (
                {getTopScorersTeam(props.Stats.top_scorers[1].club_team_id)}):{" "}
                {props.Stats.top_scorers[1].goals_overall}
              </li>
              <li>
                {props.Stats.top_scorers[2].known_as} (
                {getTopScorersTeam(props.Stats.top_scorers[2].club_team_id)}):{" "}
                {props.Stats.top_scorers[2].goals_overall}
              </li>
              <li>
                {props.Stats.top_scorers[3].known_as} (
                {getTopScorersTeam(props.Stats.top_scorers[3].club_team_id)}):{" "}
                {props.Stats.top_scorers[3].goals_overall}
              </li>
              <li>
                {props.Stats.top_scorers[4].known_as} (
                {getTopScorersTeam(props.Stats.top_scorers[4].club_team_id)}):{" "}
                {props.Stats.top_scorers[4].goals_overall}
              </li>
              <li>
                {props.Stats.top_scorers[5].known_as} (
                {getTopScorersTeam(props.Stats.top_scorers[5].club_team_id)}):{" "}
                {props.Stats.top_scorers[5].goals_overall}
              </li>
              <li>
                {props.Stats.top_scorers[6].known_as} (
                {getTopScorersTeam(props.Stats.top_scorers[6].club_team_id)}):{" "}
                {props.Stats.top_scorers[6].goals_overall}
              </li>
              <li>
                {props.Stats.top_scorers[7].known_as} (
                {getTopScorersTeam(props.Stats.top_scorers[7].club_team_id)}):{" "}
                {props.Stats.top_scorers[7].goals_overall}
              </li>
              <li>
                {props.Stats.top_scorers[8].known_as} (
                {getTopScorersTeam(props.Stats.top_scorers[8].club_team_id)}):{" "}
                {props.Stats.top_scorers[8].goals_overall}
              </li>
              <li>
                {props.Stats.top_scorers[9].known_as} (
                {getTopScorersTeam(props.Stats.top_scorers[9].club_team_id)}):{" "}
                {props.Stats.top_scorers[9].goals_overall}
              </li>
            </ul>
          </div>
        </TableContainer>
      );
    }
  } else if (props.Teams[0].LeagueID === 4340) {
    return null;
  } else if (
    props.Teams[0].LeagueID === 13973 || //MLS
    props.Teams[0].LeagueID === 12933 || //UKNorth&South
    props.Teams[0].LeagueID === 12327 || //Europa
    props.Teams[0].LeagueID === 12321 //ChampionsLeague
  ) {

    for (let i = 0; i < props.Teams.length; i++) {
      return (
        <>
          <h2 className="DivisionName">{props.Division}</h2>
          <TableContainer component={Paper} className="StatsTable">
            <Table
              className="Table"
              aria-label="customized table"
              key={props.Key}
              style={{ marginTop: "2em", marginBottom: "1em" }}
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell>Pld</StyledTableCell>
                  <StyledTableCell>W</StyledTableCell>
                  <StyledTableCell>D</StyledTableCell>
                  <StyledTableCell>L</StyledTableCell>
                  <StyledTableCell>GF</StyledTableCell>
                  <StyledTableCell>GA</StyledTableCell>
                  <StyledTableCell>GD</StyledTableCell>
                  <td>
                  <button
                    className="SortedColumn"
                    style={{ textAlign: "center" }}
                    onClick={() => sorted(props.Teams, "Points", "desc")}
                  >
                    Pts {upArrow}
                  </button>
                </td>
                <td>
                  <button
                    className="SortedColumn"
                    style={{ textAlign: "center" }}
                    onClick={() => sorted(props.Teams, "LastXPoints", "desc")}
                  >
                    Last 5 {upArrow}
                  </button>
                </td>
                </TableRow>
              </TableHead>
              <TableBody>{rows}</TableBody>
            </Table>
          </TableContainer>
        </>
      );
    }
  }
}

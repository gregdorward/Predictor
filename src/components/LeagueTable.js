import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: "#172A3A",
    color: theme.palette.common.white,
    padding: "0.35em",
    paddingTop: "0.5em",
    paddingBottom: "0.5em",
    textAlign: "left",
    fontSize: "1.9em",
    fontFamily: "inherit",
    border: "none",
    margin: "none",
  },
  body: {
    fontSize: "1.9em",
    textAlign: "left",
    fontFamily: "inherit",
    padding: "0.35em",
    paddingTop: "0.5em",
    paddingBottom: "0.5em",
    border: "none",
    margin: "none",
    color: "white",
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: "#1D3549",
      textAlign: "center",
    },
    "&:nth-of-type(even)": {
      backgroundColor: "#172B3A",
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
  let rows = props.Teams.map((team, i) => (
    <StyledTableRow key={`${props.Key}row${i}`}>
      <StyledTableCell component="th" scope="row">
        {`${team.Position}`}
      </StyledTableCell>
      <StyledTableCell component="th" scope="row">
        {`${team.Name}`}
      </StyledTableCell>
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
        <span className={styleForm(team.Form[0])}>{team.Form[0]}</span>
        <span className={styleForm(team.Form[1])}>{team.Form[1]}</span>
        <span className={styleForm(team.Form[2])}>{team.Form[2]}</span>
        <span className={styleForm(team.Form[3])}>{team.Form[3]}</span>
        <span className={styleForm(team.Form[4])}>{team.Form[4]}</span>
      </StyledTableCell>
    </StyledTableRow>
  ));

  function getTopScorersTeam(id){
  let found = props.Teams.find(
      (team) =>
        team.ID === id
    )
    return found.Name;
  }

  if(props.Teams[0].LeagueID !== 6083){
    console.log(props.Teams.LeagueID)
    for (let i = 0; i < props.Teams.length; i++) {
      return (
        <TableContainer component={Paper} className="StatsTable">
          <Table className="Table" aria-label="customized table" key={props.Key}>
            <TableHead>
              <TableRow>
                <StyledTableCell>P</StyledTableCell>
                <StyledTableCell>Team</StyledTableCell>
                <StyledTableCell>Pld</StyledTableCell>
                <StyledTableCell>W</StyledTableCell>
                <StyledTableCell>D</StyledTableCell>
                <StyledTableCell>L</StyledTableCell>
                <StyledTableCell>GF</StyledTableCell>
                <StyledTableCell>GA</StyledTableCell>
                <StyledTableCell>GD</StyledTableCell>
                <StyledTableCell>Pts</StyledTableCell>
                <StyledTableCell style={{ textAlign: "center" }}>
                  Form
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
          </Table>
          <div className="LeagueStatisticsHeader">League Statistics</div>
          <div className="LeagueStatistics">
          <ul className="LeagueStatsColumn">
            <li>Average home goals: {props.Stats.seasonAVG_home}</li>
            <li>Average away goals: {props.Stats.seasonAVG_away}</li>
            <li>BTTS: {props.Stats.seasonBTTSPercentage}%</li>
            <li>Over 0.5 goals: {props.Stats.seasonOver05Percentage_overall}%</li>
            <li>Over 1.5 goals: {props.Stats.seasonOver15Percentage_overall}%</li>
            <li>Over 2.5 goals: {props.Stats.seasonOver25Percentage_overall}%</li>
            <li>Over 3.5 goals: {props.Stats.seasonOver35Percentage_overall}%</li>
            <li>Over 4.5 goals: {props.Stats.seasonOver45Percentage_overall}%</li>
            </ul>
            <ul className="LeagueStatsColumn">
            <li>Over 7.5 corners: {props.Stats.over75CornersPercentage_overall}%</li>
            <li>Over 8.5 corners: {props.Stats.over85CornersPercentage_overall}%</li>
            <li>Over 9.5 corners: {props.Stats.over95CornersPercentage_overall}%</li>
            <li>Over 10.5 corners: {props.Stats.over105CornersPercentage_overall}%</li>
            <li>Over 11.5 corners: {props.Stats.over115CornersPercentage_overall}%</li>
            <li>Over 12.5 corners: {props.Stats.over125CornersPercentage_overall}%</li>
            <li>Corners average: {props.Stats.cornersAVG_overall}</li>
            <li>Cards average: {props.Stats.cardsAVG_overall}</li>

            
            </ul>
            <ul className="TopScorersColumn">
            <h4>Top scorers</h4>
            <li>{props.Stats.top_scorers[0].known_as} ({getTopScorersTeam(props.Stats.top_scorers[0].club_team_id)}): {props.Stats.top_scorers[0].goals_overall}</li>
            <li>{props.Stats.top_scorers[1].known_as} ({getTopScorersTeam(props.Stats.top_scorers[1].club_team_id)}): {props.Stats.top_scorers[1].goals_overall}</li>
            <li>{props.Stats.top_scorers[2].known_as} ({getTopScorersTeam(props.Stats.top_scorers[2].club_team_id)}): {props.Stats.top_scorers[2].goals_overall}</li>
            <li>{props.Stats.top_scorers[3].known_as} ({getTopScorersTeam(props.Stats.top_scorers[3].club_team_id)}): {props.Stats.top_scorers[3].goals_overall}</li>
            <li>{props.Stats.top_scorers[4].known_as} ({getTopScorersTeam(props.Stats.top_scorers[4].club_team_id)}): {props.Stats.top_scorers[4].goals_overall}</li>
            <li>{props.Stats.top_scorers[5].known_as} ({getTopScorersTeam(props.Stats.top_scorers[5].club_team_id)}): {props.Stats.top_scorers[5].goals_overall}</li>
            <li>{props.Stats.top_scorers[6].known_as} ({getTopScorersTeam(props.Stats.top_scorers[6].club_team_id)}): {props.Stats.top_scorers[6].goals_overall}</li>
            <li>{props.Stats.top_scorers[7].known_as} ({getTopScorersTeam(props.Stats.top_scorers[7].club_team_id)}): {props.Stats.top_scorers[7].goals_overall}</li>
            <li>{props.Stats.top_scorers[8].known_as} ({getTopScorersTeam(props.Stats.top_scorers[8].club_team_id)}): {props.Stats.top_scorers[8].goals_overall}</li>
            <li>{props.Stats.top_scorers[9].known_as} ({getTopScorersTeam(props.Stats.top_scorers[9].club_team_id)}): {props.Stats.top_scorers[9].goals_overall}</li>
          </ul>
        </div>
        </TableContainer>
      );
    }
  } else {
    for (let i = 0; i < props.Teams.length; i++) {
      return (
        <TableContainer component={Paper} className="StatsTable">
          <Table aria-label="customized table" key={props.Key}>
            <TableHead>
              <TableRow>
                <StyledTableCell>P</StyledTableCell>
                <StyledTableCell>Team</StyledTableCell>
                <StyledTableCell>Pld</StyledTableCell>
                <StyledTableCell>W</StyledTableCell>
                <StyledTableCell>D</StyledTableCell>
                <StyledTableCell>L</StyledTableCell>
                <StyledTableCell>GF</StyledTableCell>
                <StyledTableCell>GA</StyledTableCell>
                <StyledTableCell>GD</StyledTableCell>
                <StyledTableCell>Pts</StyledTableCell>
                <StyledTableCell style={{ textAlign: "center" }}>
                  Form
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>{rows}</TableBody>
          </Table>
        </TableContainer>
      );
    }
  }
 
}

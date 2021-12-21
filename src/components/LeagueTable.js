import React from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
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

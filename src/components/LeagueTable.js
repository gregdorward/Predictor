import { useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import LeagueTableExtras from "./LeagueTableExtras";

export { sofaScoreIds } from "../constants/sofaScoreIds";

export var toggleState = false;
export var setIsOff = false;

const upArrow = "\u{25B2}";

const StyledTableCell2 = withStyles((theme) => ({
  head: {
    padding: "0.35em",
    paddingTop: "0.75em",
    paddingBottom: "0.75em",
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
    padding: "0.5em",
    paddingTop: "0.75em",
    paddingBottom: "0.75em",
    border: "none",
    margin: "none",
  },
}))(TableCell);

const StyledTableCell = withStyles((theme) => ({
  head: {
    padding: "0.5em",
    paddingTop: "1em",
    paddingBottom: "1em",
    textAlign: "center",
    fontSize: "1.9em",
    fontFamily: "inherit",
    border: "none",
    margin: "none",
  },
  body: {
    fontSize: "1.9em",
    textAlign: "center",
    fontFamily: "inherit",
    padding: "0.35em",
    paddingTop: "1em",
    paddingBottom: "1em",
    border: "none",
    margin: "none",
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(odd)": {
      textAlign: "center",
    },
    "&:nth-of-type(even)": {
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

function buildRows(teams, rowKey) {
  return teams.map((team, i) => (
    <StyledTableRow key={`${rowKey}row${i}`}>
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
}

function StandingsTable({ teams, rowKey, tableKey, onSort }) {
  return (
    <Table
      className="Table"
      aria-label="customized table"
      key={tableKey}
      style={{ marginTop: "2em", marginBottom: "0em" }}
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
              onClick={() => onSort(teams, "Points", "desc")}
            >
              Pts {upArrow}
            </button>
          </td>
          <td>
            <button
              className="SortedColumn"
              style={{ textAlign: "center" }}
              onClick={() => onSort(teams, "LastXPoints", "desc")}
            >
              Last 5 {upArrow}
            </button>
          </td>
        </TableRow>
      </TableHead>
      <TableBody>{buildRows(teams, rowKey)}</TableBody>
    </Table>
  );
}

export default function LeagueTable(props) {
  [toggleState, setIsOff] = useState(false);

  async function sorted(league, value, order) {
    let sortedByForm;
    if (order === "desc") {
      sortedByForm = league.sort((a, b) => b[value] - a[value]);
    } else {
      sortedByForm = league.sort((a, b) => a[value] - b[value]);
    }
    setIsOff(!toggleState);
    return sortedByForm;
  }

  if (!props.Teams?.length) {
    return null;
  }

  const leagueId = props.Teams[0].LeagueID;
  const isGroupedLeague = [16504, 15002, 14924, 13964, 16494].includes(leagueId);
  const isStandardLeague =
    leagueId !== 16504 &&
    leagueId !== 12933 &&
    leagueId !== 15002 &&
    leagueId !== 13964 &&
    leagueId !== 16494;

  if (leagueId === 4340) {
    return null;
  }

  if (isStandardLeague) {
    return (
      <TableContainer component={Paper} className="StatsTable">
        <StandingsTable
          teams={props.Teams}
          rowKey={props.Key}
          tableKey={props.Key}
          onSort={sorted}
        />
        {!props.standingsOnly && (
          <LeagueTableExtras
            Stats={props.Stats}
            allTeams={props.allTeams || props.Teams}
            Id={props.Id}
            Results={props.Results}
            Date={props.Date}
            RankingStats={props.RankingStats}
            PlayerRankingStats={props.PlayerRankingStats}
          />
        )}
      </TableContainer>
    );
  }

  if (isGroupedLeague) {
    const groupedData = props.Teams.reduce((acc, team) => {
      const key = team.GroupName || "League Table";
      if (!acc[key]) acc[key] = [];
      acc[key].push(team);
      return acc;
    }, {});

    return (
      <>
        {!props.standingsOnly && props.Division && (
          <h2 className="DivisionName">{props.Division}</h2>
        )}

        {Object.entries(groupedData).map(([groupName, teams]) => (
          <TableContainer
            key={`${props.Key}-${groupName}`}
            component={Paper}
            className="StatsTable"
          >
            {!props.hideGroupHeader && (
              <h3 className="GroupName">{groupName}</h3>
            )}
            <StandingsTable
              teams={teams}
              rowKey={`${props.Key}-${groupName}`}
              tableKey={props.Key}
              onSort={sorted}
            />
          </TableContainer>
        ))}
      </>
    );
  }

  return null;
}

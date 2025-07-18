import React, { Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { useEffect, useState } from "react";
import { getHighestScoringTeams } from "../logic/getStatsInsights";
import Logo from "../components/Logo";
import HamburgerMenu from "./HamburgerMenu";

const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: "var(--accent-color)",
    color: "var(--button-text-color)",
    padding: 2,
    textAlign: "center",
    fontSize: "1em",
    fontFamily: "inherit",
    border: "1px solid black"
  },
  body: {
    fontSize: "1em",
    fontFamily: "inherit",
    padding: 5,
    border: "1px solid black",
    color: "var(--text-color)",
  },
}))(TableCell);

const StyledTableRow = withStyles(() => ({
  root: {
    "&:nth-of-type(odd)": {
      backgroundColor: "var(--secondary-background-color)",
      textAlign: "center",
    },
  },
}))(TableRow);

export default function HighestScoringTeams() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      const data = await getHighestScoringTeams();
      setTeams(data);
    }
    fetchTeams();
  }, []);

  const allowedCountries = [
    "England",
    "Scotland",
    "Italy",
    "Spain",
    "Germany",
    "France",
    "USA",
    "Denmark",
    "Greece",
    "Turkey",
    "Switzerland",
    "Austria",
    "Norway",
    "Mexico",
    "Poland",
    "Brazil",
    "Argentina",
    "Sweden",
    "Netherlands",
    "Portugal",
    "Belgium",
  ];

  // Filter teams based on allowed countries
  const filteredTeams = teams.filter((team) =>
    allowedCountries.includes(team.teamCountry)
  );

  const headers = ["Country", "Team", "Next Match", "Avg Goals", "Over 2.5%"];

  return (
    <Fragment>
      <HamburgerMenu />
      <Logo />
      <h1>Highest Scoring Teams</h1>
      <TableContainer component={Paper} className="O25Table">
        <Table aria-label="highest scoring teams">
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <StyledTableCell key={index} align="center">
                  {header}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTeams.map((team, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell align="center">
                  {team.teamCountry}
                </StyledTableCell>
                <StyledTableCell align="center">{team.team}</StyledTableCell>
                <StyledTableCell align="center">
                  {team.next_match_team}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {team.averageGoals}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {team.over25Percentage}%
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fragment>
  );
}

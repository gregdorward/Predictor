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
import { getHighestScoringLeagues } from "../logic/getStatsInsights";
import Logo from "../components/Logo"


const StyledTableCell = withStyles((theme) => ({
    head: {
      backgroundColor: "#030052",
      color: theme.palette.common.white,
      padding: 2,
      textAlign: "center",
      fontSize: "1em",
      fontFamily: "inherit",
    },
    body: {
      fontSize: "1em",
      fontFamily: "inherit",
      padding: 5,
    },
  }))(TableCell);
  
  const StyledTableRow = withStyles((theme) => ({
    root: {
      "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
        textAlign: "center",
      },
    },
  }))(TableRow);


export default function Over25() {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    async function fetchLeagues() {
      const data = await getHighestScoringLeagues();
      setLeagues(data);
    }
    fetchLeagues();
  }, []);

  const allowedCountries = [
    "England", "Scotland", "Italy", "Spain", "Germany", "France", "USA", "Denmark",
    "Greece", "Turkey", "Switzerland", "Austria", "Norway", "Mexico", "Poland",
    "Brazil", "Argentina", "Sweden", "Netherlands", "Portugal", "Belgium"
  ];

  // Filter leagues based on allowed countries
  const filteredLeagues = leagues.filter(league => allowedCountries.includes(league.leagueCountry) && league.division > 0 && league.domestic_scale < 6);
  console.log(filteredLeagues)

  const headers = ["League", "Country", "Avg Goals", "Over 2.5%"];

  return (
    <Fragment>
    <Logo/>
      <h1>Highest Scoring Leagues</h1>
    <TableContainer component={Paper} className="O25Table">
      <Table aria-label="highest scoring leagues">
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
          {filteredLeagues.map((league, index) => (
            <StyledTableRow key={index}>
              <StyledTableCell align="center">{league.league}</StyledTableCell>
              <StyledTableCell align="center">
                {league.leagueCountry}
              </StyledTableCell>
              <StyledTableCell align="center">
                {league.averageGoals}
              </StyledTableCell>
              <StyledTableCell align="center">
                {league.over25Percentage}%
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Fragment>
  );
}

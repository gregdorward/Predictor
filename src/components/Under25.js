import { Fragment } from "react";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { useEffect, useState } from "react";
import { getLowestScoringLeagues } from "../logic/getStatsInsights";
import Logo from "../components/Logo"
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


export default function Under25() {
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    async function fetchLeagues() {
      const data = await getLowestScoringLeagues();
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
  const filteredLeagues = leagues.filter(league => allowedCountries.includes(league.leagueCountry) && league.division > 0 && league.division < 5);
  console.log(filteredLeagues)

  const headers = ["League", "Country", "Avg Goals", "Under 2.5%"];

  return (
    <Fragment>
      <HamburgerMenu />
      <Logo />
      <a href="https://www.soccerstatshub.com/" className="HomeLink">Home</a>
      <h1>Lowest Scoring Leagues</h1>
      <TableContainer component={Paper} className="O25Table">
        <Table aria-label="Lowest scoring leagues">
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
                  {league.under25Percentage}%
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fragment>
  );
}

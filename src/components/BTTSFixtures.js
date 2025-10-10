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
import { getBTTSFixtures } from "../logic/getStatsInsights";
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

export default function BTTSFixtures() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    async function fetchGames() {
      const data = await getBTTSFixtures();
      setGames(data);
    }
    fetchGames();
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


  // Filter games based on allowed countries
  const filteredGames = games.filter((game) =>
    allowedCountries.includes(game.country) && game.progress > 30 && game.avgGoals > 3
  ).slice(0, 30);

  const headers = ["Fixture", "Date", "Country", "Odds BTTS Yes", "Avg Combined Goals"];

  return (
    <Fragment>
      <HamburgerMenu />
      <Logo />
      <h1>Fixtures With Highest BTTS Potential</h1>
      <TableContainer component={Paper} className="O25Table">
        <Table aria-label="highest scoring games">
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
            {filteredGames.map((team, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell align="center">
                  {team.match}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {team.date}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {team.country}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {team.odds}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {team.avgGoals}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fragment>
  );
}

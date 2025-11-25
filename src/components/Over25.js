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
import { getHighestScoringLeagues } from "../logic/getStatsInsights";
import Logo from "../components/Logo"
import HamburgerMenu from "./HamburgerMenu";
import Canonical from "../components/Canonical";

const ids = [
  15050, //premier league 25 12325
  14930, //championship 25 12451
  14934, //league 1 25 12446
  14935, //league 2 25 12422
  15657, //National league 25 12622
  15845, //National league north 25
  15844, //National league south 25
  14956, //La Liga 25 12316
  15000, //Scottish Prem 25 12455
  14968, //Bundesliga 25 12529
  15068, //Serie A 25 12530
  14932, //French Prem 25 12337
  15115, //Portagul Prem 25 12931
  14936, //Dutch Prem 25 12322
  14937, //Belgian Pro League 25 12137
  16263, //sweden 25
  15055, //Danish Prem 24/25 12132
  16260, //Norway Prem 25
  14923, //Austrian Prem 25 12472
  15163, //Greek Prem 25 12734
  14972, //turkey 25 12641
  15031, //Polish prem 25 12120
  15047, //Swiss prem 25 12326
  15053, //Croatia 25 12121
  14973, //Czecjh 25 12336
  14089, // Finland 25 14089
  13952, //Irish Prem 25
  15066, //Spanish secunda 25 12467
  15632, //Italy serie B 24 12621
  14931, //Bundesliga 2 25 12528
  14954, //French League 2 25 12338
  14987, //Dutch League 2 25
  15061, //Scottish Championship 25 12456
  14943, //Scottish league 1 25 12474
  15209, //Scottish league 2 25 12453
  15478, //Women's prem 25 12827
  13973, //MLS 25,
  13967, // USL Championship 25
  14226, // US Open Cup 25
  14236, //Canada 25
  14231, //Brazil prem 25
  14305, // Brazil Serie B 25
  15746, //Argentina prem 23 15310
  15234, //Mexico prem 25 12136
  12933, //National league North and South 24
  16036, //Australian A league 24/25 13703
  16243, //S Korea 25,
  16242, //Japan 25
  13964, // WC Qual Europe 26,
  10121, // WC Qual SA 26,
  13734, //Nations league 24
  14924, // Champs league 25 12321
  15002, //Europa 25 12327
  14904, //Europa Conference 25 12278
  16261, // Copa Libertadores 25
];

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

  console.log(leagues)
  // Filter leagues based on allowed countries
  const filteredLeagues = leagues.filter(league => allowedCountries.includes(league.leagueCountry) && league.division > 0 && league.division < 5);
  console.log(filteredLeagues)

  const headers = ["League", "Country", "Avg Goals", "Over 2.5%"];

  return (
    <Fragment>
      <Canonical />
      <HamburgerMenu />
      <Logo />
      <a href="https://www.soccerstatshub.com/" className="HomeLink">Home</a>
      <h1>Highest Scoring Leagues</h1>
      <h2>Leagues with the highest average goals</h2>
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

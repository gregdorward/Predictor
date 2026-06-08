import { Fragment, useEffect, useState } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Box, Typography
} from "@material-ui/core";
import { getHighestScoringTeams } from "../logic/getStatsInsights";
import SiteHeader from "./SiteHeader";
import PageMeta from "./PageMeta";

const ids = [
  15050, //premier league 25 12325
  16494, // World cup 2026
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
  16558, //Norway Prem 25
  14923, //Austrian Prem 25 12472
  15163, //Greek Prem 25 12734
  14972, //turkey 25 12641
  15031, //Polish prem 25 12120
  15047, //Swiss prem 25 12326
  15053, //Croatia 25 12121
  14973, //Czecjh 25 12336
  14089, // Finland 25 14089
  16537, //Irish Prem 25
  15066, //Spanish secunda 25 12467
  15632, //Italy serie B 24 12621
  14931, //Bundesliga 2 25 12528
  14954, //French League 2 25 12338
  14987, //Dutch League 2 25
  15061, //Scottish Championship 25 12456
  14943, //Scottish league 1 25 12474
  15209, //Scottish league 2 25 12453
  15478, //Women's prem 25 12827
  16504, //MLS 25,
  13967, // USL Championship 25
  14226, // US Open Cup 25
  // 14236, //Canada 25
  16544, //Brazil prem 25
  14305, // Brazil Serie B 25
  16571, //Argentina prem 26 15310
  15234, //Mexico prem 25 12136
  16614, //Colombia prem 26 11539
  12933, //National league North and South 24
  16036, //Australian A league 24/25 13703
  16627, //S Korea 25,
  16242, //Japan 25
  13964, // WC Qual Europe 26,
  10121, // WC Qual SA 26,
  13734, //Nations league 24
  14924, // Champs league 25 12321
  15002, //Europa 25 12327
  14904, //Europa Conference 25 12278
  16556, // Copa Libertadores 26
];


// Unified Modern Styling consistent with the rest of the application
const useStyles = makeStyles((theme) => ({
  container: {
    maxWidth: 1000,
    width: "100%",
    margin: "40px auto",
    padding: "1em 1em",
    boxSizing: "border-box",
    "& h1": {
      fontSize: "2em",
      fontWeight: 800,
      textAlign: "center",
      marginBottom: 8,
      color: "var(--text-color)",
    },
    "& h2": {
      fontSize: "1.5em",
      fontWeight: 400,
      textAlign: "center",
      marginBottom: 32,
      color: "var(--accent-color)",
      opacity: 0.8,
    },
  },
  tableWrapper: {
    borderRadius: 5,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    overflow: "hidden",
    maxWidth: "100%",
    border: "1px solid rgba(255,255,255,0.05)",
    backgroundColor: "var(--secondary-background-color)",
  },
  homeLink: {
    display: "inline-block",
    marginBottom: 20,
    textDecoration: "none",
    color: "var(--accent-color)",
    fontWeight: 600,
    "&:hover": { textDecoration: "underline" }
  }
}));

const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: "var(--accent-color)",
    color: "var(--button-text-color)",
    fontWeight: 600,
    textTransform: "uppercase",
    fontSize: "1em",
    letterSpacing: "1px",
    borderBottom: "none",
  },
  body: {
    fontSize: "1em",
    padding: "1em 1em",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    color: "var(--text-color)",
  },
}))(TableCell);

const StyledTableRow = withStyles(() => ({
  root: {
    transition: "background-color 0.2s ease",
    "&:nth-of-type(even)": {
      backgroundColor: "rgba(255,255,255,0.02)",
    },
    "&:hover": {
      backgroundColor: "rgba(var(--accent-color-rgb), 0.1)",
      cursor: "default",
    },
  },
}))(TableRow);

export default function HighestScoringTeams() {
  const classes = useStyles();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      const data = await getHighestScoringTeams();
      setTeams(data);
    }
    fetchTeams();
  }, []);

  const allowedCountries = ["England", "Scotland", "Italy", "Spain", "Germany", "France", "USA", "Denmark", "Greece", "Turkey", "Switzerland", "Austria", "Norway", "Mexico", "Poland", "Brazil", "Argentina", "Sweden", "Netherlands", "Portugal", "Belgium"];

  const filteredTeams = teams.filter((team) =>
    allowedCountries.includes(team.teamCountry)
  );

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader />
      
      <Box className={`${classes.container} SubpageContent`}>
        <a href="https://www.soccerstatshub.com/" className={classes.homeLink}>← Back to Home</a>
        
        <Typography variant="h1">Elite Scoring Teams</Typography>
        <Typography variant="h2">Teams with the highest average goals and their upcoming fixture</Typography>
        
        <TableContainer component={Paper} className={`${classes.tableWrapper} SubpageTableScroll`}>
          <Table size="small" aria-label="highest scoring teams table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center" className="SubpageCol--country">Country</StyledTableCell>
                <StyledTableCell align="left">Team</StyledTableCell>
                <StyledTableCell align="center">Next</StyledTableCell>
                <StyledTableCell align="center">Avg</StyledTableCell>
                <StyledTableCell align="center">O2.5%</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTeams.map((team, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell align="center" className="SubpageCol--country">
                    {team.teamCountry}
                  </StyledTableCell>
                  <StyledTableCell align="left" style={{ fontWeight: 600 }}>
                    {team.team}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ opacity: 0.8 }}>
                    {team.next_match_team}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box 
                      style={{ 
                        backgroundColor: "var(--accent-color)", 
                        color: "var(--button-text-color)", 
                        borderRadius: 4, 
                        padding: "2px 8px", 
                        display: "inline-block",
                        fontWeight: 600 
                      }}
                    >
                      {team.averageGoals}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box fontWeight="bold" color="var(--accent-color)">
                      {team.over25Percentage}%
                    </Box>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Fragment>
  );
}
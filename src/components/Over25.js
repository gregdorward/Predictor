import { Fragment, useEffect, useState } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Box, Typography
} from "@material-ui/core";
import { getHighestScoringTeams } from "../logic/getStatsInsights";
import SiteHeader from "./SiteHeader";
import PageMeta from "./PageMeta";
import StatPageSeoContent, { StatPageSeoFaq } from "./StatPageSeoContent";
import { STAT_PAGE_SEO } from "../seo/statPageSeoConfig";

// Ids to be updated for the latest season
const ids = [
  17146, // Premier League 26/27
  16494, // World cup 2026
  17184, // Championship 26/27
  17180, // League One 26/27
  17185, // League Two 26/27
  17279, // National League 26/27
  17263, // National League north 26/27
  15844, // National League south 25/26
  17199, // La Liga 26/27
  17148, // Scottish Prem 26/27
  17210, // Bundesliga 26/27
  17084, // Serie A 26/27
  17102, // Ligue 1 26/27
  17217, // Primeira Liga 26/27
  17097, // Eredivisie 26/27
  17171, // Belgian Pro League 26/27
  16263, // Allsvenskan 2026
  17091, // Danish Superliga 26/27
  16558, // Norway 26
  17181, // Austrian Bundesliga 26/27
  17356, // Greek Super League 26/27
  17265, // Turkish Super Lig 26/27
  17112, // Ekstraklasa 26/27
  17129, // Swiss Super League 26/27
  17087, // Croatia 26/27
  17157, // Czech First League 26/27
  // 14089, // Veikkausliiga - deferred
  16537, // Irish Prem 26
  17269, // Segunda Division 26/27
  15632, // Serie B 25/26
  17212, // Bundesliga 2 26/27
  17117, // Ligue 2 26/27
  17110, // Eerste Divisie 26/27
  17144, // Scottish Championship 26/27
  17147, // Scottish League One 26/27
  17140, // Scottish League Two 26/27
  16504, // MLS 26
  // 13967, // USL - deferred
  16544, // Brazil Serie A 26
  // 14305, // Brazil Serie B - deferred
  16571, // Argentina Primera 26
  17099, // Liga MX 26
  16614, // Colombia 26
  17326, // A-League 26/27
  16627, // K League 26
  17115, // J League 26/27
  12772, // Saudi Pro League 25/26
  16808, // Nations League 26/27
  17128, // Champions League 26/27
  17127, // Europa League 26/27
  17130, // Europa Conference League 26/27
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
      <SiteHeader withFooter>
      <Box className={`${classes.container} SubpageContent`}>
        <a href="/" className={classes.homeLink}>← Back to Home</a>
        
        <Typography variant="h1">Elite Scoring Teams</Typography>
        <Typography variant="h2">Teams with the highest average goals and their upcoming fixture</Typography>

        <StatPageSeoContent {...STAT_PAGE_SEO.o25} />
        
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
        <StatPageSeoFaq faqItems={STAT_PAGE_SEO.o25.faqItems} />
      </Box>
      </SiteHeader>
    </Fragment>
  );
}
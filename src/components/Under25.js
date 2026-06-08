import { Fragment, useEffect, useState } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Box, Typography
} from "@material-ui/core";
import { getLowestScoringLeagues } from "../logic/getStatsInsights";
import SiteHeader from "./SiteHeader";
import PageMeta from "./PageMeta";

// Consistent Modern Styling for the UI
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

export default function Under25() {
  const classes = useStyles();
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

  const filteredLeagues = leagues.filter(league => 
    allowedCountries.includes(league.leagueCountry) && 
    league.division > 0 && 
    league.division < 5
  );

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader />
      
      <Box className={`${classes.container} SubpageContent`}>
        <a href="https://www.soccerstatshub.com/" className={classes.homeLink}>← Back to Home</a>
        
        <Typography variant="h1">Lowest Scoring Leagues</Typography>
        <Typography variant="h2">Leagues with the lowest goals-per-match averages</Typography>
        
        <TableContainer component={Paper} className={`${classes.tableWrapper} SubpageTableScroll`}>
          <Table size="small" aria-label="Lowest scoring leagues table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="left">League</StyledTableCell>
                <StyledTableCell align="center" className="SubpageCol--country">Country</StyledTableCell>
                <StyledTableCell align="center">Avg</StyledTableCell>
                <StyledTableCell align="center">U2.5%</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLeagues.map((league, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell align="left" style={{ fontWeight: 600 }}>
                    {league.league}
                  </StyledTableCell>
                  <StyledTableCell align="center" className="SubpageCol--country">
                    {league.leagueCountry}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ opacity: 0.8 }}>
                    {league.averageGoals}
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
                      {league.under25Percentage}%
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
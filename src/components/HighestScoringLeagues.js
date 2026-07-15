import { Fragment, useEffect, useState } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from "@material-ui/core";
import { getHighestScoringLeagues } from "../logic/getStatsInsights";
import SiteHeader from "./SiteHeader";
import PageMeta from "./PageMeta";
import StatPageSeoContent, { StatPageSeoFaq } from "./StatPageSeoContent";
import { STAT_PAGE_SEO } from "../seo/statPageSeoConfig";

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

const useStyles = makeStyles(() => ({
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
      marginBottom: 16,
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
    "&:hover": { textDecoration: "underline" },
  },
}));

const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: "#030040",
    color: "#ffffff",
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

export default function HighestScoringLeagues() {
  const classes = useStyles();
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    async function fetchLeagues() {
      const data = await getHighestScoringLeagues();
      setLeagues(data);
    }

    fetchLeagues();
  }, []);

  const filteredLeagues = leagues
    .filter(
      (league) =>
        allowedCountries.includes(league.leagueCountry) &&
        league.division > 0 &&
        league.division < 5
    )
    .sort((a, b) => Number(b.averageGoals) - Number(a.averageGoals))
    .slice(0, 50);

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader withFooter>
        <Box className={`${classes.container} SubpageContent`}>
          <a href="/" className={classes.homeLink}>Back to Home</a>

          <Typography variant="h1">Highest Scoring Leagues</Typography>
          <Typography variant="h2">
            Football leagues ranked by average goals and Over 2.5 rate
          </Typography>

          <StatPageSeoContent {...STAT_PAGE_SEO.highestScoringLeagues} />

          <TableContainer
            component={Paper}
            className={`${classes.tableWrapper} SubpageTableScroll`}
          >
            <Table size="small" aria-label="Highest scoring leagues table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">League</StyledTableCell>
                  <StyledTableCell align="center" className="SubpageCol--country">
                    Country
                  </StyledTableCell>
                  <StyledTableCell align="center">Avg</StyledTableCell>
                  <StyledTableCell align="center">O2.5%</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeagues.map((league, index) => (
                  <StyledTableRow key={`${league.leagueId}-${index}`}>
                    <StyledTableCell align="left" style={{ fontWeight: 600 }}>
                      {league.league}
                    </StyledTableCell>
                    <StyledTableCell align="center" className="SubpageCol--country">
                      {league.leagueCountry}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Box
                        style={{
                          backgroundColor: "var(--accent-color)",
                          color: "var(--button-text-color)",
                          borderRadius: 4,
                          padding: "2px 8px",
                          display: "inline-block",
                          fontWeight: 600,
                        }}
                      >
                        {league.averageGoals}
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Box fontWeight="bold" color="var(--accent-color)">
                        {league.over25Percentage}%
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <StatPageSeoFaq faqItems={STAT_PAGE_SEO.highestScoringLeagues.faqItems} />
        </Box>
      </SiteHeader>
    </Fragment>
  );
}

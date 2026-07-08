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
import { getBTTSTeams } from "../logic/getStatsInsights";
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

export default function BTTSNoTeams() {
  const classes = useStyles();
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    async function fetchTeams() {
      const data = await getBTTSTeams();
      setTeams(data);
    }

    fetchTeams();
  }, []);

  const filteredTeams = teams
    .filter((team) => allowedCountries.includes(team.country) && team.played > 10)
    .sort((a, b) => Number(a.bttsPercentage) - Number(b.bttsPercentage))
    .slice(0, 30);

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader withFooter>
        <Box className={`${classes.container} SubpageContent`}>
          <a href="/" className={classes.homeLink}>Back to Home</a>

          <Typography variant="h1">Low BTTS Teams</Typography>
          <Typography variant="h2">
            Teams whose matches are less likely to see both sides score
          </Typography>

          <TableContainer
            component={Paper}
            className={`${classes.tableWrapper} SubpageTableScroll`}
          >
            <Table size="small" aria-label="Low BTTS teams table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="left">Name</StyledTableCell>
                  <StyledTableCell align="center" className="SubpageCol--country">
                    Country
                  </StyledTableCell>
                  <StyledTableCell align="center">BTTS %</StyledTableCell>
                  <StyledTableCell align="center" className="SubpageCol--played">
                    Played
                  </StyledTableCell>
                  <StyledTableCell align="center">Next</StyledTableCell>
                  <StyledTableCell align="center">Odds</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTeams.map((team, index) => (
                  <StyledTableRow key={`${team.name}-${index}`}>
                    <StyledTableCell align="left" style={{ fontWeight: 600 }}>
                      {team.name}
                    </StyledTableCell>
                    <StyledTableCell align="center" className="SubpageCol--country">
                      {team.country}
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
                        {team.bttsPercentage}%
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      className="SubpageCol--played"
                      style={{ opacity: 0.8 }}
                    >
                      {team.played}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Box fontWeight="600">{team.opponent}</Box>
                      <span className="SubpageCellMeta">{team.date}</span>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Box fontWeight="bold" color="var(--accent-color)">
                        {team.odds}
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <StatPageSeoContent {...STAT_PAGE_SEO.bttsNoTeams} />
          <StatPageSeoFaq faqItems={STAT_PAGE_SEO.bttsNoTeams.faqItems} />
        </Box>
      </SiteHeader>
    </Fragment>
  );
}

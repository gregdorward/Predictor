import { Fragment, useEffect, useState } from "react";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Box, Typography
} from "@material-ui/core";
import { getHighestScoringFixtures, getHighestScoringTeams } from "../logic/getStatsInsights";
import SiteHeader from "./SiteHeader";
import PageMeta from "./PageMeta";
import StatPageSeoContent, { StatPageSeoFaq } from "./StatPageSeoContent";
import { STAT_PAGE_SEO, buildFixturesHighIntro } from "../seo/statPageSeoConfig";

const ALLOWED_COUNTRIES = ["England", "Scotland", "Italy", "Spain", "Germany", "France", "USA", "Denmark", "Greece", "Turkey", "Switzerland", "Austria", "Norway", "Mexico", "Poland", "Brazil", "Argentina", "Sweden", "Netherlands", "Portugal", "Belgium"];

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
  },
  tagline: {
    fontSize: "1.5em",
    fontWeight: 400,
    textAlign: "center",
    marginBottom: 32,
    color: "var(--accent-color)",
    opacity: 0.8,
  },
  sectionHeading: {
    fontSize: "1.2em",
    fontWeight: 700,
    textAlign: "left",
    margin: "2rem 0 0.75rem",
    color: "var(--text-color)",
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
    borderBottom: "1px solid var(--button-border-color)",
    color: "var(--text-color)",
  },
}))(TableCell);

const StyledTableRow = withStyles(() => ({
  root: {
    transition: "background-color 0.2s ease",
    "&:nth-of-type(even)": {
      backgroundColor: "var(--alternate-background-color)",
    },
    "&:hover": {
      backgroundColor: "rgba(var(--accent-color-rgb), 0.1)",
      cursor: "default",
    },
  },
}))(TableRow);

function StatPill({ children }) {
  return (
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
      {children}
    </Box>
  );
}

export default function HighestScoringFixtures({
  initialRows = null,
  initialTeamRows = null,
}) {
  const classes = useStyles();
  const [games, setGames] = useState(() =>
    Array.isArray(initialRows) ? initialRows : []
  );
  const [teams, setTeams] = useState(() =>
    Array.isArray(initialTeamRows) ? initialTeamRows : []
  );

  useEffect(() => {
    if (Array.isArray(initialRows) && initialRows.length > 0) return undefined;

    let cancelled = false;
    async function fetchGames() {
      const data = await getHighestScoringFixtures();
      const filtered = data
        .filter((game) => ALLOWED_COUNTRIES.includes(game.country) && game.progress > 50 && game.avgGoals > 2.5)
        .slice(0, 30);
      if (!cancelled) setGames(filtered);
    }
    fetchGames();
    return () => {
      cancelled = true;
    };
  }, [initialRows]);

  useEffect(() => {
    if (Array.isArray(initialTeamRows) && initialTeamRows.length > 0) return undefined;

    let cancelled = false;
    async function fetchTeams() {
      const data = await getHighestScoringTeams();
      const filtered = data.filter((team) =>
        ALLOWED_COUNTRIES.includes(team.teamCountry)
      );
      if (!cancelled) setTeams(filtered);
    }
    fetchTeams();
    return () => {
      cancelled = true;
    };
  }, [initialTeamRows]);

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader withFooter>
      <Box className={`${classes.container} SubpageContent`} id="ssh-content">
        <a href="/" className={classes.homeLink}>← Back to Home</a>
        
        <Typography variant="h1">Goal Potential Insights</Typography>
        <Typography variant="h2" className={classes.tagline}>
          Highest-scoring teams and today’s fixtures with the strongest goal potential
        </Typography>

        <StatPageSeoContent
          {...STAT_PAGE_SEO.fixturesHigh}
          intro={buildFixturesHighIntro(teams)}
        />

        <Typography variant="h2" className={classes.sectionHeading} id="o25-teams">
          Teams with the highest scoring averages
        </Typography>
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
              {teams.map((team, index) => (
                <StyledTableRow key={`${team.team}-${index}`}>
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
                    <StatPill>{team.averageGoals}</StatPill>
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

        <Typography variant="h2" className={classes.sectionHeading} id="o25-fixtures">
          Today’s Over 2.5 fixtures
        </Typography>
        <TableContainer component={Paper} className={`${classes.tableWrapper} SubpageTableScroll`}>
          <Table size="small" aria-label="highest scoring games table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="left">Fixture</StyledTableCell>
                <StyledTableCell align="center" className="SubpageCol--date">Date</StyledTableCell>
                <StyledTableCell align="center" className="SubpageCol--country">Country</StyledTableCell>
                <StyledTableCell align="center">O2.5</StyledTableCell>
                <StyledTableCell align="center">Avg</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {games.map((team, index) => (
                <StyledTableRow key={index}>
                  <StyledTableCell align="left" style={{ fontWeight: 600 }}>
                    {team.match}
                    <span className="SubpageCellMeta">{team.date}</span>
                  </StyledTableCell>
                  <StyledTableCell align="center" className="SubpageCol--date" style={{ opacity: 0.7 }}>
                    {team.date}
                  </StyledTableCell>
                  <StyledTableCell align="center" className="SubpageCol--country">
                    {team.country}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box fontWeight="bold" color="var(--accent-color)">
                      {team.odds}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <StatPill>{team.avgGoals}</StatPill>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <StatPageSeoFaq faqItems={STAT_PAGE_SEO.fixturesHigh.faqItems} />
      </Box>
      </SiteHeader>
    </Fragment>
  );
}

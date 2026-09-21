import { Fragment, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { getHighestScoringFixtures, getHighestScoringTeams } from "../logic/getStatsInsights";
import SiteHeader from "./SiteHeader";
import PageMeta from "./PageMeta";
import StatPageSeoContent, { StatPageSeoFaq } from "./StatPageSeoContent";
import {
  BodyCell,
  HeadCell,
  StatPill,
  SubpageTable,
} from "./SubpageDataTable";
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
      <div className={`${classes.container} SubpageContent`} id="ssh-content">
        <a href="/" className={classes.homeLink}>← Back to Home</a>
        
        <h1>Goal Potential Insights</h1>
        <h2 className={classes.tagline}>
          Highest-scoring teams and today’s fixtures with the strongest goal potential
        </h2>

        <StatPageSeoContent
          {...STAT_PAGE_SEO.fixturesHigh}
          intro={buildFixturesHighIntro(teams)}
        />

        <h2 className={classes.sectionHeading} id="o25-teams">
          Teams with the highest scoring averages
        </h2>
        <SubpageTable
          className={classes.tableWrapper}
          aria-label="highest scoring teams table"
        >
          <thead>
            <tr>
              <HeadCell className="SubpageCol--country">Country</HeadCell>
              <HeadCell align="left">Team</HeadCell>
              <HeadCell>Next</HeadCell>
              <HeadCell>Avg</HeadCell>
              <HeadCell>O2.5%</HeadCell>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={`${team.team}-${index}`}>
                <BodyCell className="SubpageCol--country">
                  {team.teamCountry}
                </BodyCell>
                <BodyCell align="left" style={{ fontWeight: 600 }}>
                  {team.team}
                </BodyCell>
                <BodyCell style={{ opacity: 0.8 }}>
                  {team.next_match_team}
                </BodyCell>
                <BodyCell>
                  <StatPill>{team.averageGoals}</StatPill>
                </BodyCell>
                <BodyCell>
                  <span style={{ fontWeight: "bold", color: "var(--accent-color)" }}>
                    {team.over25Percentage}%
                  </span>
                </BodyCell>
              </tr>
            ))}
          </tbody>
        </SubpageTable>

        <h2 className={classes.sectionHeading} id="o25-fixtures">
          Today’s Over 2.5 fixtures
        </h2>
        <SubpageTable
          className={classes.tableWrapper}
          aria-label="highest scoring games table"
        >
          <thead>
            <tr>
              <HeadCell align="left">Fixture</HeadCell>
              <HeadCell className="SubpageCol--date">Date</HeadCell>
              <HeadCell className="SubpageCol--country">Country</HeadCell>
              <HeadCell>O2.5</HeadCell>
              <HeadCell>Avg</HeadCell>
            </tr>
          </thead>
          <tbody>
            {games.map((team, index) => (
              <tr key={index}>
                <BodyCell align="left" style={{ fontWeight: 600 }}>
                  {team.match}
                  <span className="SubpageCellMeta">{team.date}</span>
                </BodyCell>
                <BodyCell className="SubpageCol--date" style={{ opacity: 0.7 }}>
                  {team.date}
                </BodyCell>
                <BodyCell className="SubpageCol--country">
                  {team.country}
                </BodyCell>
                <BodyCell>
                  <span style={{ fontWeight: "bold", color: "var(--accent-color)" }}>
                    {team.odds}
                  </span>
                </BodyCell>
                <BodyCell>
                  <StatPill>{team.avgGoals}</StatPill>
                </BodyCell>
              </tr>
            ))}
          </tbody>
        </SubpageTable>
        <StatPageSeoFaq faqItems={STAT_PAGE_SEO.fixturesHigh.faqItems} />
      </div>
      </SiteHeader>
    </Fragment>
  );
}

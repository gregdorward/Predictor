import { Fragment, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { getBTTSFixtures, getBTTSTeams } from "../logic/getStatsInsights";
import SiteHeader from "./SiteHeader";
import PageMeta from "./PageMeta";
import StatPageSeoContent, { StatPageSeoFaq } from "./StatPageSeoContent";
import {
  BodyCell,
  HeadCell,
  StatPill,
  SubpageTable,
} from "./SubpageDataTable";
import { STAT_PAGE_SEO, buildBttsFixturesIntro } from "../seo/statPageSeoConfig";

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

function TeamRows({ teams }) {
  return teams.map((team, index) => (
    <tr key={`${team.name}-${index}`}>
      <BodyCell align="left" style={{ fontWeight: 600 }}>
        {team.name}
      </BodyCell>
      <BodyCell className="SubpageCol--country">
        {team.country}
      </BodyCell>
      <BodyCell>
        <StatPill>{team.bttsPercentage}</StatPill>
      </BodyCell>
      <BodyCell className="SubpageCol--played" style={{ opacity: 0.8 }}>
        {team.played}
      </BodyCell>
      <BodyCell>
        <span style={{ fontWeight: 600 }}>{team.opponent}</span>
        <span className="SubpageCellMeta">{team.date}</span>
      </BodyCell>
      <BodyCell>
        <span style={{ fontWeight: "bold", color: "var(--accent-color)" }}>
          {team.odds}
        </span>
      </BodyCell>
    </tr>
  ));
}

export default function BTTSFixtures({
  initialRows = null,
  initialTeamRows = null,
  initialNoTeamRows = null,
}) {
  const classes = useStyles();
  const [games, setGames] = useState(() =>
    Array.isArray(initialRows) ? initialRows : []
  );
  const [teams, setTeams] = useState(() =>
    Array.isArray(initialTeamRows) ? initialTeamRows : []
  );
  const [noTeams, setNoTeams] = useState(() =>
    Array.isArray(initialNoTeamRows) ? initialNoTeamRows : []
  );

  useEffect(() => {
    if (Array.isArray(initialRows) && initialRows.length > 0) return undefined;

    let cancelled = false;
    async function fetchGames() {
      const data = await getBTTSFixtures();
      const filtered = data
        .filter((game) => ALLOWED_COUNTRIES.includes(game.country) && game.progress > 30 && game.avgGoals > 3)
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
      const data = await getBTTSTeams();
      const filtered = data
        .filter((team) => ALLOWED_COUNTRIES.includes(team.country) && team.played > 10)
        .slice(0, 30);
      if (!cancelled) setTeams(filtered);
    }
    fetchTeams();
    return () => {
      cancelled = true;
    };
  }, [initialTeamRows]);

  useEffect(() => {
    if (Array.isArray(initialNoTeamRows) && initialNoTeamRows.length > 0) return undefined;

    let cancelled = false;
    async function fetchNoTeams() {
      const data = await getBTTSTeams();
      const filtered = data
        .filter((team) => ALLOWED_COUNTRIES.includes(team.country) && team.played > 10)
        .sort((a, b) => Number(a.bttsPercentage) - Number(b.bttsPercentage))
        .slice(0, 30);
      if (!cancelled) setNoTeams(filtered);
    }
    fetchNoTeams();
    return () => {
      cancelled = true;
    };
  }, [initialNoTeamRows]);

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader withFooter>
      <div className={`${classes.container} SubpageContent`} id="ssh-content">
        <a href="/" className={classes.homeLink}>← Back to Home</a>

        <h1>BTTS Insights</h1>
        <h2 className={classes.tagline}>
          Teams with the strongest and weakest BTTS records, plus today’s fixtures
        </h2>

        <StatPageSeoContent
          {...STAT_PAGE_SEO.bttsFixtures}
          intro={buildBttsFixturesIntro(teams)}
        />

        <h2 className={classes.sectionHeading} id="btts-teams">
          Teams with the strongest BTTS records
        </h2>
        <SubpageTable
          className={classes.tableWrapper}
          aria-label="BTTS teams table"
        >
          <thead>
            <tr>
              <HeadCell align="left">Name</HeadCell>
              <HeadCell className="SubpageCol--country">Country</HeadCell>
              <HeadCell>BTTS %</HeadCell>
              <HeadCell className="SubpageCol--played">Played</HeadCell>
              <HeadCell>Next</HeadCell>
              <HeadCell>Odds</HeadCell>
            </tr>
          </thead>
          <tbody>
            <TeamRows teams={teams} />
          </tbody>
        </SubpageTable>

        <h2 className={classes.sectionHeading} id="btts-no">
          Teams with the lowest BTTS rates
        </h2>
        <SubpageTable
          className={classes.tableWrapper}
          aria-label="Low BTTS teams table"
        >
          <thead>
            <tr>
              <HeadCell align="left">Name</HeadCell>
              <HeadCell className="SubpageCol--country">Country</HeadCell>
              <HeadCell>BTTS %</HeadCell>
              <HeadCell className="SubpageCol--played">Played</HeadCell>
              <HeadCell>Next</HeadCell>
              <HeadCell>Odds</HeadCell>
            </tr>
          </thead>
          <tbody>
            <TeamRows teams={noTeams} />
          </tbody>
        </SubpageTable>

        <h2 className={classes.sectionHeading} id="btts-fixtures">
          Today’s BTTS fixtures
        </h2>
        <SubpageTable
          className={classes.tableWrapper}
          aria-label="BTTS potential table"
        >
          <thead>
            <tr>
              <HeadCell align="left">Fixture</HeadCell>
              <HeadCell className="SubpageCol--date">Date</HeadCell>
              <HeadCell className="SubpageCol--country">Country</HeadCell>
              <HeadCell>BTTS</HeadCell>
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
        <StatPageSeoFaq faqItems={STAT_PAGE_SEO.bttsFixtures.faqItems} />
      </div>
      </SiteHeader>
    </Fragment>
  );
}

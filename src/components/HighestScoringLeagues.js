import { Fragment, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { getHighestScoringLeagues, getLowestScoringLeagues } from "../logic/getStatsInsights";
import SiteHeader from "./SiteHeader";
import PageMeta from "./PageMeta";
import StatPageSeoContent, { StatPageSeoFaq } from "./StatPageSeoContent";
import {
  BodyCell,
  HeadCell,
  StatPill,
  SubpageTable,
} from "./SubpageDataTable";
import {
  STAT_PAGE_SEO,
  buildHighestScoringLeaguesIntro,
} from "../seo/statPageSeoConfig";

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
  },
  tagline: {
    fontSize: "1.5em",
    fontWeight: 400,
    textAlign: "center",
    marginBottom: 16,
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
    "&:hover": { textDecoration: "underline" },
  },
}));

export default function HighestScoringLeagues({
  initialRows = null,
  initialLowScoringRows = null,
}) {
  const classes = useStyles();
  const [leagues, setLeagues] = useState(() =>
    Array.isArray(initialRows) ? initialRows : []
  );
  const [lowScoringLeagues, setLowScoringLeagues] = useState(() =>
    Array.isArray(initialLowScoringRows) ? initialLowScoringRows : []
  );

  useEffect(() => {
    if (Array.isArray(initialRows) && initialRows.length > 0) return undefined;

    let cancelled = false;
    async function fetchLeagues() {
      const data = await getHighestScoringLeagues();
      const filtered = data
        .filter(
          (league) =>
            allowedCountries.includes(league.leagueCountry) &&
            league.division > 0 &&
            league.division < 5
        )
        .sort((a, b) => Number(b.averageGoals) - Number(a.averageGoals))
        .slice(0, 50);
      if (!cancelled) setLeagues(filtered);
    }

    fetchLeagues();
    return () => {
      cancelled = true;
    };
  }, [initialRows]);

  useEffect(() => {
    if (Array.isArray(initialLowScoringRows) && initialLowScoringRows.length > 0) {
      return undefined;
    }

    let cancelled = false;
    async function fetchLowScoringLeagues() {
      const data = await getLowestScoringLeagues();
      const filtered = data
        .filter(
          (league) =>
            allowedCountries.includes(league.leagueCountry) &&
            league.division > 0 &&
            league.division < 5
        )
        .sort((a, b) => Number(a.averageGoals) - Number(b.averageGoals))
        .slice(0, 50);
      if (!cancelled) setLowScoringLeagues(filtered);
    }

    fetchLowScoringLeagues();
    return () => {
      cancelled = true;
    };
  }, [initialLowScoringRows]);

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader withFooter>
        <div className={`${classes.container} SubpageContent`} id="ssh-content">
          <a href="/" className={classes.homeLink}>Back to Home</a>

          <h1>Highest Scoring Leagues</h1>
          <h2 className={classes.tagline}>
            Highest- and lowest-scoring leagues ranked by goals per match
          </h2>

          <StatPageSeoContent
            {...STAT_PAGE_SEO.highestScoringLeagues}
            intro={buildHighestScoringLeaguesIntro(leagues)}
          />

          <h2 className={classes.sectionHeading} id="highest-scoring">
            Leagues with the highest goals per match
          </h2>
          <SubpageTable
            className={classes.tableWrapper}
            aria-label="Highest scoring leagues table"
          >
            <thead>
              <tr>
                <HeadCell align="left">League</HeadCell>
                <HeadCell className="SubpageCol--country">Country</HeadCell>
                <HeadCell>Avg</HeadCell>
                <HeadCell>O2.5%</HeadCell>
              </tr>
            </thead>
            <tbody>
              {leagues.map((league, index) => (
                <tr key={`${league.leagueId}-${index}`}>
                  <BodyCell align="left" style={{ fontWeight: 600 }}>
                    {league.league}
                  </BodyCell>
                  <BodyCell className="SubpageCol--country">
                    {league.leagueCountry}
                  </BodyCell>
                  <BodyCell>
                    <StatPill>{league.averageGoals}</StatPill>
                  </BodyCell>
                  <BodyCell>
                    <span style={{ fontWeight: "bold", color: "var(--accent-color)" }}>
                      {league.over25Percentage}%
                    </span>
                  </BodyCell>
                </tr>
              ))}
            </tbody>
          </SubpageTable>

          <h2 className={classes.sectionHeading} id="lowest-scoring">
            Leagues with the lowest goals per match
          </h2>
          <SubpageTable
            className={classes.tableWrapper}
            aria-label="Lowest scoring leagues table"
          >
            <thead>
              <tr>
                <HeadCell align="left">League</HeadCell>
                <HeadCell className="SubpageCol--country">Country</HeadCell>
                <HeadCell>Avg</HeadCell>
                <HeadCell>U2.5%</HeadCell>
              </tr>
            </thead>
            <tbody>
              {lowScoringLeagues.map((league, index) => (
                <tr key={`${league.leagueId || league.league}-${index}`}>
                  <BodyCell align="left" style={{ fontWeight: 600 }}>
                    {league.league}
                  </BodyCell>
                  <BodyCell className="SubpageCol--country">
                    {league.leagueCountry}
                  </BodyCell>
                  <BodyCell style={{ opacity: 0.8 }}>
                    {league.averageGoals}
                  </BodyCell>
                  <BodyCell>
                    <StatPill>{league.under25Percentage}%</StatPill>
                  </BodyCell>
                </tr>
              ))}
            </tbody>
          </SubpageTable>
          <StatPageSeoFaq faqItems={STAT_PAGE_SEO.highestScoringLeagues.faqItems} />
        </div>
      </SiteHeader>
    </Fragment>
  );
}

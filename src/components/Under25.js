import { Fragment, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { getLowestScoringLeagues } from "../logic/getStatsInsights";
import SiteHeader from "./SiteHeader";
import PageMeta from "./PageMeta";
import StatPageSeoContent, { StatPageSeoFaq } from "./StatPageSeoContent";
import {
  BodyCell,
  HeadCell,
  StatPill,
  SubpageTable,
} from "./SubpageDataTable";
import { STAT_PAGE_SEO } from "../seo/statPageSeoConfig";

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

export default function Under25({ initialRows = null }) {
  const classes = useStyles();
  const [leagues, setLeagues] = useState(() =>
    Array.isArray(initialRows) ? initialRows : []
  );

  useEffect(() => {
    if (Array.isArray(initialRows) && initialRows.length > 0) return undefined;

    let cancelled = false;
    async function fetchLeagues() {
      const data = await getLowestScoringLeagues();
      const allowedCountries = [
        "England", "Scotland", "Italy", "Spain", "Germany", "France", "USA", "Denmark",
        "Greece", "Turkey", "Switzerland", "Austria", "Norway", "Mexico", "Poland",
        "Brazil", "Argentina", "Sweden", "Netherlands", "Portugal", "Belgium"
      ];
      const filtered = data
        .filter(
          (league) =>
            allowedCountries.includes(league.leagueCountry) &&
            league.division > 0 &&
            league.division < 5
        )
        .sort((a, b) => Number(a.averageGoals) - Number(b.averageGoals))
        .slice(0, 50);
      if (!cancelled) setLeagues(filtered);
    }
    fetchLeagues();
    return () => {
      cancelled = true;
    };
  }, [initialRows]);

  const filteredLeagues = leagues;

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader withFooter>
      <div className={`${classes.container} SubpageContent`} id="ssh-content">
        <a href="/" className={classes.homeLink}>← Back to Home</a>
        
        <h1>Lowest Scoring Leagues in the World</h1>
        <h2>Under 2.5 football leagues ranked by goals per match</h2>

        <StatPageSeoContent {...STAT_PAGE_SEO.u25} />
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
            {filteredLeagues.map((league, index) => (
              <tr key={index}>
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
        <StatPageSeoFaq faqItems={STAT_PAGE_SEO.u25.faqItems} />
      </div>
      </SiteHeader>
    </Fragment>
  );
}
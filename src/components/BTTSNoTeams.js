import { Fragment, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { getBTTSTeams } from "../logic/getStatsInsights";
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

export default function BTTSNoTeams({ initialRows = null }) {
  const classes = useStyles();
  const [teams, setTeams] = useState(() =>
    Array.isArray(initialRows) ? initialRows : []
  );

  useEffect(() => {
    if (Array.isArray(initialRows) && initialRows.length > 0) return undefined;

    let cancelled = false;
    async function fetchTeams() {
      const data = await getBTTSTeams();
      const filtered = data
        .filter((team) => allowedCountries.includes(team.country) && team.played > 10)
        .sort((a, b) => Number(a.bttsPercentage) - Number(b.bttsPercentage))
        .slice(0, 30);
      if (!cancelled) setTeams(filtered);
    }

    fetchTeams();
    return () => {
      cancelled = true;
    };
  }, [initialRows]);

  const filteredTeams = teams;

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader withFooter>
        <div className={`${classes.container} SubpageContent`} id="ssh-content">
          <a href="/" className={classes.homeLink}>Back to Home</a>

          <h1>Low BTTS Teams</h1>
          <h2>
            Teams whose matches are less likely to see both sides score
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
              {filteredTeams.map((team, index) => (
                <tr key={`${team.name}-${index}`}>
                  <BodyCell align="left" style={{ fontWeight: 600 }}>
                    {team.name}
                  </BodyCell>
                  <BodyCell className="SubpageCol--country">
                    {team.country}
                  </BodyCell>
                  <BodyCell>
                    <StatPill>{team.bttsPercentage}%</StatPill>
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
              ))}
            </tbody>
          </SubpageTable>
          <StatPageSeoContent {...STAT_PAGE_SEO.bttsNoTeams} />
          <StatPageSeoFaq faqItems={STAT_PAGE_SEO.bttsNoTeams.faqItems} />
        </div>
      </SiteHeader>
    </Fragment>
  );
}

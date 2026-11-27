import { Fragment, useEffect, useState } from "react";
import { getHighestScoringLeagues, getLowestScoringLeagues } from "../logic/getStatsInsights";
import SiteHeader from "./SiteHeader";
import StatsFooterAd from "./StatsFooterAd";
import DataCitation from "./DataCitation";
import PageMeta from "./PageMeta";
import StatHubLayout, { EmptyHubRow, StatHubHeadLabel } from "./StatHubLayout";
import {
  BodyCell,
  HeadCell,
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

export default function HighestScoringLeagues({
  initialRows = null,
  initialLowScoringRows = null,
  dataAsOf = null,
}) {
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

  const proof = buildHighestScoringLeaguesIntro(leagues);

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader withFooter wide beforeFooter={<StatsFooterAd />}>
        <StatHubLayout
          title="Highest and lowest scoring football leagues 2026/27"
          proof={proof}
          seo={{ ...STAT_PAGE_SEO.highestScoringLeagues, intro: proof }}
          footer={
            <DataCitation
              asOf={dataAsOf}
              pageLabel="the highest- and lowest-scoring leagues tables"
            />
          }
          season={
            <section className="StatHub-section" aria-labelledby="highest-scoring">
              <h2 id="highest-scoring">Leagues with the highest goals per match</h2>
              <SubpageTable className="StatHub-table--leagues" aria-label="Highest scoring leagues table">
                <thead>
                  <tr>
                    <HeadCell align="left">League</HeadCell>
                    <HeadCell className="SubpageCol--country">Country</HeadCell>
                    <HeadCell className="StatHub-col--rate">
                      <StatHubHeadLabel short="O2.5%">Over 2.5%</StatHubHeadLabel>
                    </HeadCell>
                    <HeadCell className="StatHub-col--goals">
                      <StatHubHeadLabel short="Avg G">Avg goals</StatHubHeadLabel>
                    </HeadCell>
                  </tr>
                </thead>
                <tbody>
                  {leagues.length ? (
                    leagues.map((league, index) => (
                      <tr key={`${league.leagueId}-${index}`}>
                        <BodyCell align="left" className="StatHub-name">
                          {league.league}
                          <span className="StatHub-meta">{league.leagueCountry}</span>
                        </BodyCell>
                        <BodyCell className="SubpageCol--country">{league.leagueCountry}</BodyCell>
                        <BodyCell className="StatHub-col--rate">
                          <span className="StatHub-quietNum">{league.over25Percentage}%</span>
                        </BodyCell>
                        <BodyCell className="StatHub-col--goals">
                          <span className="StatHub-fig">{league.averageGoals}</span>
                        </BodyCell>
                      </tr>
                    ))
                  ) : (
                    <EmptyHubRow colSpan={4}>No league averages in this list yet.</EmptyHubRow>
                  )}
                </tbody>
              </SubpageTable>
            </section>
          }
          today={
            <section className="StatHub-section" aria-labelledby="lowest-scoring">
              <h2 id="lowest-scoring">Leagues with the lowest goals per match</h2>
              <SubpageTable className="StatHub-table--leagues" aria-label="Lowest scoring leagues table">
                <thead>
                  <tr>
                    <HeadCell align="left">League</HeadCell>
                    <HeadCell className="SubpageCol--country">Country</HeadCell>
                    <HeadCell className="StatHub-col--rate">
                      <StatHubHeadLabel short="U2.5%">Under 2.5%</StatHubHeadLabel>
                    </HeadCell>
                    <HeadCell className="StatHub-col--goals">
                      <StatHubHeadLabel short="Avg G">Avg goals</StatHubHeadLabel>
                    </HeadCell>
                  </tr>
                </thead>
                <tbody>
                  {lowScoringLeagues.length ? (
                    lowScoringLeagues.map((league, index) => (
                      <tr key={`${league.leagueId || league.league}-${index}`}>
                        <BodyCell align="left" className="StatHub-name">
                          {league.league}
                          <span className="StatHub-meta">{league.leagueCountry}</span>
                        </BodyCell>
                        <BodyCell className="SubpageCol--country">{league.leagueCountry}</BodyCell>
                        <BodyCell className="StatHub-col--rate">
                          <span className="StatHub-quietNum">{league.under25Percentage}%</span>
                        </BodyCell>
                        <BodyCell className="StatHub-col--goals">
                          <span className="StatHub-fig">{league.averageGoals}</span>
                        </BodyCell>
                      </tr>
                    ))
                  ) : (
                    <EmptyHubRow colSpan={4}>No low-scoring leagues in this list yet.</EmptyHubRow>
                  )}
                </tbody>
              </SubpageTable>
            </section>
          }
        />
      </SiteHeader>
    </Fragment>
  );
}

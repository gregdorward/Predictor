import { Fragment, useEffect, useState } from "react";
import { getHighestScoringFixtures, getHighestScoringTeams } from "../logic/getStatsInsights";
import SiteHeader from "./SiteHeader";
import StatsFooterAd from "./StatsFooterAd";
import PageMeta from "./PageMeta";
import StatHubLayout, { EmptyHubRow, HubFixtureLink } from "./StatHubLayout";
import { withCoveredFixtureLinks } from "../seo/statHubFixtureLinks";
import {
  BodyCell,
  HeadCell,
  SubpageTable,
} from "./SubpageDataTable";
import { STAT_PAGE_SEO, buildFixturesHighIntro } from "../seo/statPageSeoConfig";

const ALLOWED_COUNTRIES = ["England", "Scotland", "Italy", "Spain", "Germany", "France", "USA", "Denmark", "Greece", "Turkey", "Switzerland", "Austria", "Norway", "Mexico", "Poland", "Brazil", "Argentina", "Sweden", "Netherlands", "Portugal", "Belgium"];

export default function HighestScoringFixtures({
  initialRows = null,
  initialTeamRows = null,
}) {
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
      const linked = await withCoveredFixtureLinks(filtered);
      if (!cancelled) setGames(linked);
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
      const linked = await withCoveredFixtureLinks(filtered);
      if (!cancelled) setTeams(linked);
    }
    fetchTeams();
    return () => {
      cancelled = true;
    };
  }, [initialTeamRows]);

  const proof = buildFixturesHighIntro(teams);

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader withFooter wide beforeFooter={<StatsFooterAd />}>
        <StatHubLayout
          title="Goal Potential Insights"
          proof={proof}
          switchable
          seasonLabel="Season"
          todayLabel="Today"
          seo={{ ...STAT_PAGE_SEO.fixturesHigh, intro: proof }}
          season={
            <section className="StatHub-section" aria-labelledby="o25-teams">
              <h2 id="o25-teams">Teams with the highest scoring averages</h2>
              <SubpageTable className="StatHub-table--teams" aria-label="highest scoring teams table">
                <thead>
                  <tr>
                    <HeadCell align="left">Team</HeadCell>
                    <HeadCell className="SubpageCol--country">Country</HeadCell>
                    <HeadCell className="StatHub-col--next">Next</HeadCell>
                    <HeadCell className="StatHub-col--rate">Over 2.5%</HeadCell>
                    <HeadCell className="StatHub-col--goals">Avg goals</HeadCell>
                  </tr>
                </thead>
                <tbody>
                  {teams.length ? (
                    teams.map((team, index) => (
                      <tr key={`${team.team}-${index}`}>
                        <BodyCell align="left" className="StatHub-name">
                          {team.team}
                          <span className="StatHub-meta">{team.teamCountry}</span>
                        </BodyCell>
                        <BodyCell className="SubpageCol--country">{team.teamCountry}</BodyCell>
                        <BodyCell className="StatHub-col--next">
                          <HubFixtureLink href={team.href}>
                            <span className="StatHub-quietNum">{team.next_match_team}</span>
                          </HubFixtureLink>
                        </BodyCell>
                        <BodyCell className="StatHub-col--rate">
                          <span className="StatHub-quietNum">{team.over25Percentage}%</span>
                        </BodyCell>
                        <BodyCell className="StatHub-col--goals">
                          <span className="StatHub-fig">{team.averageGoals}</span>
                        </BodyCell>
                      </tr>
                    ))
                  ) : (
                    <EmptyHubRow colSpan={5}>No high-scoring teams with a strong enough sample yet.</EmptyHubRow>
                  )}
                </tbody>
              </SubpageTable>
            </section>
          }
          today={
            <section className="StatHub-section" aria-labelledby="o25-fixtures">
              <h2 id="o25-fixtures">Today’s Over 2.5 fixtures</h2>
              <SubpageTable className="StatHub-table--fixtures" aria-label="highest scoring games table">
                <thead>
                  <tr>
                    <HeadCell align="left">Fixture</HeadCell>
                    <HeadCell className="SubpageCol--date">Date</HeadCell>
                    <HeadCell className="SubpageCol--country">Country</HeadCell>
                    <HeadCell className="StatHub-col--odds">Odds</HeadCell>
                    <HeadCell className="StatHub-col--goals">Avg goals</HeadCell>
                  </tr>
                </thead>
                <tbody>
                  {games.length ? (
                    games.map((team, index) => (
                      <tr key={`${team.match}-${index}`}>
                        <BodyCell align="left" className="StatHub-name">
                          <HubFixtureLink href={team.href}>
                            <span className="StatHub-linkMatch">{team.match}</span>
                            <span className="StatHub-meta">
                              {team.country}
                              {team.date ? ` · ${team.date}` : ""}
                            </span>
                          </HubFixtureLink>
                        </BodyCell>
                        <BodyCell className="SubpageCol--date">{team.date}</BodyCell>
                        <BodyCell className="SubpageCol--country">{team.country}</BodyCell>
                        <BodyCell className="StatHub-col--odds">
                          <span className="StatHub-quietNum">{team.odds}</span>
                        </BodyCell>
                        <BodyCell className="StatHub-col--goals">
                          <span className="StatHub-fig">{team.avgGoals}</span>
                        </BodyCell>
                      </tr>
                    ))
                  ) : (
                    <EmptyHubRow colSpan={5}>No Over 2.5 fixtures in this list yet.</EmptyHubRow>
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

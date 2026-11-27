import { Fragment, useEffect, useState } from "react";
import { getBTTSFixtures, getBTTSTeams } from "../logic/getStatsInsights";
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
import { STAT_PAGE_SEO, buildBttsFixturesIntro } from "../seo/statPageSeoConfig";

const ALLOWED_COUNTRIES = ["England", "Scotland", "Italy", "Spain", "Germany", "France", "USA", "Denmark", "Greece", "Turkey", "Switzerland", "Austria", "Norway", "Mexico", "Poland", "Brazil", "Argentina", "Sweden", "Netherlands", "Portugal", "Belgium"];

function TeamRows({ teams }) {
  return teams.map((team, index) => (
    <tr key={`${team.name}-${index}`}>
      <BodyCell align="left" className="StatHub-name">
        {team.name}
        <span className="StatHub-meta">
          {team.country}
          {team.played != null ? ` · ${team.played} played` : ""}
        </span>
      </BodyCell>
      <BodyCell className="SubpageCol--country">{team.country}</BodyCell>
      <BodyCell className="SubpageCol--played">{team.played}</BodyCell>
      <BodyCell className="StatHub-col--next">
        <HubFixtureLink href={team.href}>
          <span className="StatHub-quietNum">{team.opponent}</span>
          <span className="StatHub-meta">{team.date}</span>
        </HubFixtureLink>
      </BodyCell>
      <BodyCell className="StatHub-col--odds">
        <span className="StatHub-quietNum">{team.odds}</span>
      </BodyCell>
      <BodyCell className="StatHub-col--rate">
        <span className="StatHub-fig">{team.bttsPercentage}%</span>
      </BodyCell>
    </tr>
  ));
}

export default function BTTSFixtures({
  initialRows = null,
  initialTeamRows = null,
  initialNoTeamRows = null,
}) {
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
      const data = await getBTTSTeams();
      const filtered = data
        .filter((team) => ALLOWED_COUNTRIES.includes(team.country) && team.played > 10)
        .slice(0, 30);
      const linked = await withCoveredFixtureLinks(filtered);
      if (!cancelled) setTeams(linked);
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
      const linked = await withCoveredFixtureLinks(filtered);
      if (!cancelled) setNoTeams(linked);
    }
    fetchNoTeams();
    return () => {
      cancelled = true;
    };
  }, [initialNoTeamRows]);

  const proof = buildBttsFixturesIntro(teams);

  return (
    <Fragment>
      <PageMeta />
      <SiteHeader withFooter wide beforeFooter={<StatsFooterAd />}>
        <StatHubLayout
          title="BTTS Insights"
          proof={proof}
          switchable
          seasonLabel="Season"
          todayLabel="Today"
          seo={{ ...STAT_PAGE_SEO.bttsFixtures, intro: proof }}
          season={
            <>
              <section className="StatHub-section" aria-labelledby="btts-teams">
                <h2 id="btts-teams">Teams with the strongest BTTS records</h2>
                <SubpageTable className="StatHub-table--teams" aria-label="BTTS teams table">
                  <thead>
                    <tr>
                      <HeadCell align="left">Name</HeadCell>
                      <HeadCell className="SubpageCol--country">Country</HeadCell>
                      <HeadCell className="SubpageCol--played">Played</HeadCell>
                      <HeadCell className="StatHub-col--next">Next</HeadCell>
                      <HeadCell className="StatHub-col--odds">BTTS odds</HeadCell>
                      <HeadCell className="StatHub-col--rate">BTTS %</HeadCell>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.length ? (
                      <TeamRows teams={teams} />
                    ) : (
                      <EmptyHubRow colSpan={6}>No teams with a strong enough sample yet.</EmptyHubRow>
                    )}
                  </tbody>
                </SubpageTable>
              </section>
              <section className="StatHub-section" aria-labelledby="btts-no">
                <h2 id="btts-no">Teams with the lowest BTTS rates</h2>
                <SubpageTable className="StatHub-table--teams" aria-label="Low BTTS teams table">
                  <thead>
                    <tr>
                      <HeadCell align="left">Name</HeadCell>
                      <HeadCell className="SubpageCol--country">Country</HeadCell>
                      <HeadCell className="SubpageCol--played">Played</HeadCell>
                      <HeadCell className="StatHub-col--next">Next</HeadCell>
                      <HeadCell className="StatHub-col--odds">BTTS odds</HeadCell>
                      <HeadCell className="StatHub-col--rate">BTTS %</HeadCell>
                    </tr>
                  </thead>
                  <tbody>
                    {noTeams.length ? (
                      <TeamRows teams={noTeams} />
                    ) : (
                      <EmptyHubRow colSpan={6}>No low BTTS teams with a strong enough sample yet.</EmptyHubRow>
                    )}
                  </tbody>
                </SubpageTable>
              </section>
            </>
          }
          today={
            <section className="StatHub-section" aria-labelledby="btts-fixtures">
              <h2 id="btts-fixtures">Today’s BTTS fixtures</h2>
              <SubpageTable className="StatHub-table--fixtures" aria-label="BTTS potential table">
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
                    <EmptyHubRow colSpan={5}>No BTTS fixtures in this list yet.</EmptyHubRow>
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

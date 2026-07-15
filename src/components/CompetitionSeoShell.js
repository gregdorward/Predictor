import { getRelatedCompetitionLinks } from "../seo/competitionCatalog";
import { buildCompetitionSeoParagraphs } from "../seo/seoShellCopy";
import { getTeamsList, sortTeamsByField } from "./competition/competitionUtils";

function formatPercent(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return `${Number(value).toFixed(1)}%`;
}

function formatNumber(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return Number(value).toFixed(2);
}

export default function CompetitionSeoShell({
  name,
  country,
  season,
  avgGoals,
  btts,
  over25,
  under25,
  homeWin,
  draw,
  awayWin,
  topOver25Teams = [],
  topBttsTeams = [],
  topUnder25Teams = [],
}) {
  const metaParts = [country, season].filter(Boolean);
  const introParagraphs = buildCompetitionSeoParagraphs({
    name,
    country,
    season,
    avgGoals,
    btts,
    over25,
    under25,
    homeWin,
    draw,
    awayWin,
    topOver25Teams,
    topBttsTeams,
    topUnder25Teams,
  });

  return (
    <section className="Competition Competition--seoShell" aria-label="Competition overview">
      <header className="Competition__hero">
        <h1 className="Competition__title">{name}</h1>
        {metaParts.length > 0 ? (
          <span className="Competition__meta">{metaParts.join(" · ")}</span>
        ) : null}
        {(avgGoals != null || btts != null || over25 != null || under25 != null) && (
          <dl className="Competition__seoStats">
            {avgGoals != null ? (
              <div className="Competition__seoStat">
                <dt>Avg goals</dt>
                <dd>{avgGoals}</dd>
              </div>
            ) : null}
            {btts != null ? (
              <div className="Competition__seoStat">
                <dt>BTTS</dt>
                <dd>{btts}</dd>
              </div>
            ) : null}
            {over25 != null ? (
              <div className="Competition__seoStat">
                <dt>Over 2.5</dt>
                <dd>{over25}</dd>
              </div>
            ) : null}
            {under25 != null ? (
              <div className="Competition__seoStat">
                <dt>Under 2.5</dt>
                <dd>{under25}</dd>
              </div>
            ) : null}
            {homeWin != null && draw != null && awayWin != null ? (
              <div className="Competition__seoStat">
                <dt>H/D/A</dt>
                <dd>{homeWin} / {draw} / {awayWin}</dd>
              </div>
            ) : null}
          </dl>
        )}
        <div className="Competition__seoIntro">
          {introParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
        <div className="Competition__seoHighlights">
          <TeamList title="Top Over 2.5 teams" teams={topOver25Teams} field="seasonOver25Percentage_overall" />
          <TeamList title="Top BTTS teams" teams={topBttsTeams} field="seasonBTTSPercentage_overall" />
          <TeamList title="Top Under 2.5 teams" teams={topUnder25Teams} field="seasonUnder25Percentage_overall" />
        </div>
        <div className="Competition__seoFaq">
          <h2>{name} stats guide</h2>
          <h3>What can I research on this page?</h3>
          <p>
            Soccer Stats Hub tracks league averages, BTTS rates, Over and Under 2.5
            trends, home advantage, standings, corners, cards, team rankings, player
            leaders and related fixture predictions where data is available. The goal is
            to show the evidence behind each market, not just the percentage in isolation.
          </p>
          <h3>How should I use these competition stats?</h3>
          <p>
            Start with the league-wide profile above, then compare team rankings, recent
            form and individual fixtures. A side can look strong on points yet weak on
            xG, or vice versa, so cross-check a few metrics before you settle on a view.
          </p>
          <h3>Where do the numbers come from?</h3>
          <p>
            Season and fixture data are drawn from established football statistics
            providers used across the site. Model outputs and probability views are
            described in our{" "}
            <a href="/methodology/">methodology</a> page. Predictions are illustrative
            research tools, not guarantees of results.
          </p>
          <h3>Responsible use</h3>
          <p>
            Stats support informed judgement; they do not remove match-day risk. If you
            choose to bet, do so responsibly and within your limits. See our{" "}
            <a href="/about/">about page</a> for more on how Soccer Stats Hub is built.
          </p>
        </div>
      </header>
    </section>
  );
}

function TeamList({ title, teams, field }) {
  if (!teams.length) return null;

  return (
    <section>
      <h2>{title}</h2>
      <ol>
        {teams.map((team) => (
          <li key={team.id || team.name}>
            <span>{team.name || team.english_name}</span>
            <strong>{formatPercent(team[field])}</strong>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function buildCompetitionSeoShell(data, catalog) {
  const name = data?.english_name || data?.name || catalog?.name || "Competition";
  const relatedLinks = getRelatedCompetitionLinks(catalog?.slug);
  const teams = getTeamsList(data);
  return {
    name,
    country: data?.country || null,
    season: data?.season || null,
    avgGoals: formatNumber(data?.seasonAVG_overall),
    btts: formatPercent(data?.seasonBTTSPercentage),
    over25: formatPercent(data?.seasonOver25Percentage_overall),
    under25: formatPercent(data?.seasonUnder25Percentage_overall),
    homeWin: formatPercent(data?.homeWinPercentage),
    draw: formatPercent(data?.drawPercentage),
    awayWin: formatPercent(data?.awayWinPercentage),
    topOver25Teams: sortTeamsByField(teams, "seasonOver25Percentage_overall", 5),
    topBttsTeams: sortTeamsByField(teams, "seasonBTTSPercentage_overall", 5),
    topUnder25Teams: sortTeamsByField(teams, "seasonUnder25Percentage_overall", 5),
    relatedLinks,
  };
}

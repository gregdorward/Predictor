import { getRelatedCompetitionLinks } from "../seo/competitionCatalog";
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

  return (
    <section className="Competition Competition--seoShell" aria-label="Competition overview">
      <header className="Competition__hero">
        <h1 className="Competition__title">{name}</h1>
        {metaParts.length > 0 ? (
          <span className="Competition__meta">{metaParts.join(" · ")}</span>
        ) : null}
        <p className="Competition__seoIntro">
          BTTS, Over 2.5, Under 2.5, goals, corners and card stats for {name}.
          Full league tables, charts, form views and team rankings load below.
        </p>
        {(avgGoals != null || btts != null || over25 != null || under25 != null) && (
          <dl className="Competition__seoStats">
            {avgGoals != null ? (
              <>
                <dt>Avg goals</dt>
                <dd>{avgGoals}</dd>
              </>
            ) : null}
            {btts != null ? (
              <>
                <dt>BTTS</dt>
                <dd>{btts}</dd>
              </>
            ) : null}
            {over25 != null ? (
              <>
                <dt>Over 2.5</dt>
                <dd>{over25}</dd>
              </>
            ) : null}
            {under25 != null ? (
              <>
                <dt>Under 2.5</dt>
                <dd>{under25}</dd>
              </>
            ) : null}
            {homeWin != null && draw != null && awayWin != null ? (
              <>
                <dt>H/D/A</dt>
                <dd>{homeWin} / {draw} / {awayWin}</dd>
              </>
            ) : null}
          </dl>
        )}
        <div className="Competition__seoHighlights">
          <TeamList title="Top Over 2.5 teams" teams={topOver25Teams} field="seasonOver25Percentage_overall" />
          <TeamList title="Top BTTS teams" teams={topBttsTeams} field="seasonBTTSPercentage_overall" />
          <TeamList title="Top Under 2.5 teams" teams={topUnder25Teams} field="seasonUnder25Percentage_overall" />
        </div>
        <div className="Competition__seoFaq">
          <h2>{name} stats FAQ</h2>
          <h3>What stats are available for {name}?</h3>
          <p>
            SoccerStatsHub tracks league averages, BTTS rates, Over and Under 2.5
            trends, home advantage, standings, team rankings, player leaders and
            related fixture predictions where data is available.
          </p>
          <h3>How should I use this competition page?</h3>
          <p>
            Start with the league-wide market profile, then compare team rankings,
            form and individual fixtures before making a judgement.
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

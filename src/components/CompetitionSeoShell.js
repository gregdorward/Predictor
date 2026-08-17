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

function readMatchesPlayed(data) {
  const candidates = [
    data?.matches_completed,
    data?.matchesCompleted,
    data?.seasonMatchesPlayed_overall,
    data?.seasonMatchesCompleted,
    data?.games_played,
    data?.clubStats?.seasonMatchesPlayed_overall,
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** Season has not produced usable league averages yet (new / unstarted). */
export function isCompetitionSeasonEmpty(data) {
  if (!data) return true;
  const matchesPlayed = readMatchesPlayed(data);
  if (matchesPlayed === 0) return true;

  const avg = Number(data.seasonAVG_overall);
  const btts = Number(data.seasonBTTSPercentage);
  const over25 = Number(data.seasonOver25Percentage_overall);
  const under25 = Number(data.seasonUnder25Percentage_overall);

  // All-zero market block means the season has not produced usable averages yet
  // (typical right after a catalog season-id rollover).
  return (
    (!Number.isFinite(avg) || avg === 0) &&
    (!Number.isFinite(btts) || btts === 0) &&
    (!Number.isFinite(over25) || over25 === 0) &&
    (!Number.isFinite(under25) || under25 === 0)
  );
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
  seasonStarted = true,
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
    seasonStarted,
  });

  return (
    <section className="Competition Competition--seoShell" aria-label="Competition overview">
      <header className="Competition__hero">
        <h1 className="Competition__title">{name}</h1>
        {metaParts.length > 0 ? (
          <span className="Competition__meta">{metaParts.join(" · ")}</span>
        ) : null}
      </header>
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
            <div className="Competition__seoStat Competition__seoStat--wide">
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
    </section>
  );
}

/** Team lists + FAQ for crawlers / no-JS. Keep outside #ssh-content so Journey
 *  does not treat the extra FAQ paragraphs as the in-content article. */
export function CompetitionSeoExtras({
  name,
  topOver25Teams = [],
  topBttsTeams = [],
  topUnder25Teams = [],
}) {
  return (
    <div className="Competition Competition--seoExtras">
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
    </div>
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

function pickTeamHighlight(team, field) {
  if (!team) return null;
  return {
    id: team.id ?? null,
    name: team.name || team.english_name || null,
    english_name: team.english_name || team.name || null,
    [field]: team[field] ?? null,
  };
}

export function buildCompetitionSeoShell(data, catalog) {
  const name = data?.english_name || data?.name || catalog?.name || "Competition";
  const relatedLinks = getRelatedCompetitionLinks(catalog?.slug);
  const teams = getTeamsList(data);
  const seasonEmpty = isCompetitionSeasonEmpty(data);

  if (seasonEmpty) {
    return {
      name,
      country: data?.country || null,
      season: data?.season || null,
      avgGoals: null,
      btts: null,
      over25: null,
      under25: null,
      homeWin: null,
      draw: null,
      awayWin: null,
      topOver25Teams: [],
      topBttsTeams: [],
      topUnder25Teams: [],
      relatedLinks,
      seasonStarted: false,
    };
  }

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
    topOver25Teams: sortTeamsByField(teams, "seasonOver25Percentage_overall", 5).map(
      (team) => pickTeamHighlight(team, "seasonOver25Percentage_overall")
    ),
    topBttsTeams: sortTeamsByField(teams, "seasonBTTSPercentage_overall", 5).map(
      (team) => pickTeamHighlight(team, "seasonBTTSPercentage_overall")
    ),
    topUnder25Teams: sortTeamsByField(
      teams,
      "seasonUnder25Percentage_overall",
      5
    ).map((team) => pickTeamHighlight(team, "seasonUnder25Percentage_overall")),
    relatedLinks,
    seasonStarted: true,
  };
}

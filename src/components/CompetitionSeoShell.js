import { getRelatedCompetitionLinks } from "../seo/competitionCatalog";
import { isCompetitionSeasonEmpty } from "../seo/competitionSeason";
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

export { isCompetitionSeasonEmpty };

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

/** Unique team market leaders below the interactive competition UI. Kept
 *  outside #ssh-content so Journey does not treat lists as the article body. */
export function CompetitionSeoExtras({
  topOver25Teams = [],
  topBttsTeams = [],
  topUnder25Teams = [],
}) {
  const hasHighlights =
    topOver25Teams.length > 0 ||
    topBttsTeams.length > 0 ||
    topUnder25Teams.length > 0;
  if (!hasHighlights) return null;

  return (
    <div className="Competition Competition--seoExtras">
      <div className="Competition__seoHighlights">
        <TeamList title="Top Over 2.5 teams" teams={topOver25Teams} field="seasonOver25Percentage_overall" />
        <TeamList title="Top BTTS teams" teams={topBttsTeams} field="seasonBTTSPercentage_overall" />
        <TeamList title="Top Under 2.5 teams" teams={topUnder25Teams} field="seasonUnder25Percentage_overall" />
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

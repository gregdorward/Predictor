import { getRelatedCompetitionLinks } from "../seo/competitionCatalog";

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
          BTTS, Over 2.5, goals, corners and card stats for {name}. Full league
          tables, charts and team rankings load below.
        </p>
        {(avgGoals != null || btts != null || over25 != null) && (
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
          </dl>
        )}
      </header>
    </section>
  );
}

export function buildCompetitionSeoShell(data, catalog) {
  const name = data?.english_name || data?.name || catalog?.name || "Competition";
  const relatedLinks = getRelatedCompetitionLinks(catalog?.slug);
  return {
    name,
    country: data?.country || null,
    season: data?.season || null,
    avgGoals: formatNumber(data?.seasonAVG_overall),
    btts: formatPercent(data?.seasonBTTSPercentage),
    over25: formatPercent(data?.seasonOver25Percentage_overall),
    relatedLinks,
  };
}

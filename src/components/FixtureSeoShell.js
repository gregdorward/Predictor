export default function FixtureSeoShell({
  home,
  away,
  league,
  stadium,
  kickOff,
  competitionUrl,
  competitionName,
}) {
  return (
    <>
      <section className="FixturePage FixturePage--seoShell" aria-label="Match overview">
        <header className="FixturePage-header">
          <h1 className="FixturePage-heading">
            {home} vs {away}
          </h1>
          <div className="FixturePage-meta">
            {league ? <span className="FixturePage-metaItem">{league}</span> : null}
            {stadium ? <span className="FixturePage-metaItem">{stadium}</span> : null}
            {kickOff ? <span className="FixturePage-metaItem">KO: {kickOff}</span> : null}
          </div>
          <p className="FixturePage-seoIntro">
            Head-to-head stats, form, BTTS and Over 2.5 analysis for {home} vs {away}
            {league ? ` in ${league}` : ""}. Full predictions and charts load below.
          </p>
          {competitionUrl && competitionName ? (
            <p className="FixturePage-seoIntro">
              View <a href={competitionUrl}>{competitionName} league stats</a>.
            </p>
          ) : null}
        </header>
      </section>
    </>
  );
}

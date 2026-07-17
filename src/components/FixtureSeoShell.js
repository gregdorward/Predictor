import { buildFixtureSeoParagraphs } from "../seo/seoShellCopy";

export function FixtureSeoBody({
  home,
  away,
  league,
  competitionUrl,
  competitionName,
}) {
  const introParagraphs = buildFixtureSeoParagraphs({
    home,
    away,
    league,
    competitionName,
  });

  const competition = league || competitionName;

  return (
    <div className="FixturePage-seoBody">
      <div className="FixturePage-seoIntro">
        {introParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>
      <p className="FixturePage-seoLinks">
        <a href="/fixtures/">Browse upcoming fixtures</a>
        {competitionUrl && competitionName ? (
          <>
            {" "}
            · <a href={competitionUrl}>{competitionName} league stats</a>
          </>
        ) : null}{" "}
        · <a href="/methodology/">Read our methodology</a>
      </p>
      <div className="FixturePage-seoFaq">
        <h2>How to read this match page</h2>
        <h3>What stats are included?</h3>
        <p>
          Each fixture page brings together head-to-head results, recent form, expected
          goals, BTTS and Over or Under 2.5 trends, league-table context and modelled
          scorelines where data allows. Premium users can open deeper player, lineup
          and tactical views on selected matches.
        </p>
        <h3>How are predictions generated?</h3>
        <p>
          Probabilities blend form, home and away performance, attacking and defensive
          metrics and market odds. The full process is outlined on our{" "}
          <a href="/methodology/">methodology</a> page. Treat every output as research,
          not a certainty.
        </p>
        {competition ? (
          <>
            <h3>More {competition} context</h3>
            <p>
              League-wide BTTS, goals and home-advantage trends for {competition} live
              on the competition hub
              {competitionUrl ? (
                <>
                  {" "}
                  (<a href={competitionUrl}>{competitionName || competition}</a>)
                </>
              ) : null}
              . Comparing a fixture with the wider season profile often explains why a
              market looks generous or tight.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function FixtureSeoShell({
  home,
  away,
  league,
  stadium,
  kickOff,
  competitionUrl,
  competitionName,
  ssrOnly = false,
}) {
  return (
    <section
      className={`FixturePage FixturePage--seoShell${
        ssrOnly ? " FixturePage--seoShellSsr" : ""
      }`}
      aria-label="Match overview"
    >
      <header className="FixturePage-header">
        <h1 className="FixturePage-heading">
          {home} vs {away}
        </h1>
        <div className="FixturePage-meta">
          {league ? <span className="FixturePage-metaItem">{league}</span> : null}
          {stadium ? <span className="FixturePage-metaItem">{stadium}</span> : null}
          {kickOff ? <span className="FixturePage-metaItem">KO: {kickOff}</span> : null}
        </div>
      </header>
      <FixtureSeoBody
        home={home}
        away={away}
        league={league}
        competitionUrl={competitionUrl}
        competitionName={competitionName}
      />
    </section>
  );
}

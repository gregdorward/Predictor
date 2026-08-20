import { buildFixtureSeoParagraphs } from "../seo/seoShellCopy";
import { CreateBadge } from "./createBadge";

export function FixtureSeoBody({
  home,
  away,
  league,
  competitionName,
}) {
  const introParagraphs = buildFixtureSeoParagraphs({
    home,
    away,
    league,
    competitionName,
  });

  return (
    <div className="FixturePage-seoBody">
      <div className="FixturePage-seoIntro">
        {introParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
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
  competitionName,
  homeBadge = null,
  awayBadge = null,
}) {
  return (
    <section className="FixturePage FixturePage--seoShell" aria-label="Match overview">
      <header className="FixturePage-header">
        <h1 className="FixturePage-heading">
          <span className="FixturePage-teamLine FixturePage-teamLine--home">
            <CreateBadge
              image={homeBadge || "-"}
              ClassName="FixturePage-badge FixturePage-badge--home"
              alt=""
            />
            <span className="FixturePage-headingTeam FixturePage-headingTeam--home">
              {home}
            </span>
          </span>
          <span className="FixturePage-vs">v</span>
          <span className="FixturePage-teamLine FixturePage-teamLine--away">
            <CreateBadge
              image={awayBadge || "-"}
              ClassName="FixturePage-badge FixturePage-badge--away"
              alt=""
            />
            <span className="FixturePage-headingTeam FixturePage-headingTeam--away">
              {away}
            </span>
          </span>
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
        competitionName={competitionName}
      />
    </section>
  );
}

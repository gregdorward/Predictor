import { useMemo, useState } from "react";
import { groupFixturesByDate } from "../logic/fixturesIndexGroups";

function FixtureIndexRow({ fixture }) {
  return (
    <li>
      <a href={fixture.href} className="FixturesIndex-row">
        <span className="FixturesIndex-rowKickoff">
          {fixture.kickOff ? fixture.kickOff : "TBC"}
        </span>
        <span className="FixturesIndex-rowTeams">{fixture.label}</span>
        <span className="FixturesIndex-rowLeague">{fixture.league || ""}</span>
      </a>
    </li>
  );
}

function FixtureDateGroup({ group }) {
  if (!group.fixtures.length) {
    return null;
  }

  return (
    <section
      id={group.sectionId}
      className="FixturesIndex-group"
      aria-labelledby={`${group.sectionId}-title`}
    >
      <div className="FixturesIndex-groupHeader">
        <h2 id={`${group.sectionId}-title`}>{group.dateLabel}</h2>
        <span className="FixturesIndex-count">{group.fixtures.length}</span>
      </div>
      <ul className="FixturesIndex-list">
        {group.fixtures.map((fixture) => (
          <FixtureIndexRow key={fixture.href} fixture={fixture} />
        ))}
      </ul>
    </section>
  );
}

function matchesFixtureQuery(fixture, query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    fixture.homeTeam?.toLowerCase().includes(q) ||
    fixture.awayTeam?.toLowerCase().includes(q) ||
    fixture.league?.toLowerCase().includes(q) ||
    fixture.label?.toLowerCase().includes(q)
  );
}

export default function FixturesIndexMain({ fixtures = [] }) {
  const [filter, setFilter] = useState("");
  const query = filter.trim();
  const isFiltering = query.length > 0;

  const filtered = useMemo(
    () => fixtures.filter((fixture) => matchesFixtureQuery(fixture, filter)),
    [fixtures, filter]
  );

  const groups = useMemo(() => groupFixturesByDate(filtered), [filtered]);

  const jumpDays = useMemo(
    () =>
      groupFixturesByDate(fixtures).map((group) => ({
        id: group.sectionId,
        label: group.dateLabel,
      })),
    [fixtures]
  );

  return (
    <>
      <header className="FixturesIndex-header">
        <nav className="FixturesIndex-breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">Upcoming fixtures</span>
        </nav>

        <h1>Upcoming fixtures</h1>

        <p className="FixturesIndex-lead">
          Search by team or league, then open a match for stats, BTTS and Over 2.5
          analysis, and modelled scorelines.
        </p>

        <div className="FixturesIndex-toolbar">
          <input
            type="search"
            className="FixturesIndex-search"
            placeholder="Search by team or league…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Search fixtures by team or league"
          />
        </div>

        <div className="FixturesIndex-status">
          <p className="FixturesIndex-meta" role="status">
            {isFiltering
              ? filtered.length === 0
                ? `No matches for "${query}"`
                : `${filtered.length} fixture${filtered.length === 1 ? "" : "s"}`
              : `${fixtures.length} fixtures in the next few days`}
          </p>
          {isFiltering && filtered.length > 0 ? (
            <button
              type="button"
              className="FixturesIndex-clearSearch"
              onClick={() => setFilter("")}
            >
              Clear search
            </button>
          ) : null}
        </div>

        {!isFiltering && jumpDays.length > 1 ? (
          <nav className="FixturesIndex-jump" aria-label="Jump to day">
            {jumpDays.map((day) => (
              <a key={day.id} href={`#${day.id}`} title={day.label}>
                {day.label}
              </a>
            ))}
          </nav>
        ) : null}
      </header>

      <div className="FixturesIndex-groups">
        {isFiltering && filtered.length === 0 ? (
          <p className="FixturesIndex-empty">
            Try another team or league, or{" "}
            <button
              type="button"
              className="FixturesIndex-clearSearch"
              onClick={() => setFilter("")}
            >
              clear search
            </button>
            .
          </p>
        ) : (
          groups.map((group) => <FixtureDateGroup key={group.dateKey} group={group} />)
        )}
      </div>

      <details className="FixturesIndex-context">
        <summary className="FixturesIndex-contextSummary">About this list</summary>
        <div className="FixturesIndex-contextBody">
          <p>
            Each link opens a dedicated preview with head-to-head records, form, BTTS and
            Over 2.5 analysis, plus modelled scorelines where data is available.
          </p>
          <p>
            The <a href="/">homepage</a> provides access to the most in depth stats,
            charts and analysis for every game.
          </p>
          <p>
            For wider league context, open the relevant competition hub from any fixture
            page or start from the <a href="/competitions/">competitions index</a>. Our{" "}
            <a href="/methodology/">methodology</a> page explains how probabilities are
            built.
          </p>
        </div>
      </details>
    </>
  );
}

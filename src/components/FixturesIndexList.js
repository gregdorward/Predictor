import { useState } from "react";

export default function FixturesIndexList({ fixtures = [] }) {
  const [filter, setFilter] = useState("");

  const q = filter.trim().toLowerCase();
  const filtered = q
    ? fixtures.filter(
        (f) =>
          f.homeTeam?.toLowerCase().includes(q) ||
          f.awayTeam?.toLowerCase().includes(q) ||
          f.league?.toLowerCase().includes(q)
      )
    : fixtures;

  return (
    <>
      <input
        type="search"
        className="FixturesIndex-search"
        placeholder="Search by team or league…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        aria-label="Search fixtures by team or league"
      />
      <p className="FixturesIndex-resultCount">
        {q
          ? filtered.length === 0
            ? `No matches for “${filter.trim()}”`
            : `${filtered.length} fixture${filtered.length === 1 ? "" : "s"}`
          : `${fixtures.length} fixtures`}
      </p>
      {filtered.length > 0 && (
        <ul className="FixturesIndex-list">
          {filtered.map((fixture) => (
            <li key={fixture.href}>
              <a href={fixture.href}>
                {fixture.date ? `${fixture.date} · ` : ""}
                {fixture.label}
                {fixture.league ? ` · ${fixture.league}` : ""}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

import { useMemo, useState } from "react";
import JourneyContentBreak from "./JourneyContentBreak";

function CompetitionCard({ competition, featured: isFeatured = false }) {
  return (
    <li>
      <a
        href={`/competition/${competition.slug}/`}
        className={`CompetitionsIndex-card${isFeatured ? " CompetitionsIndex-card--featured" : ""}`}
      >
        <span className="CompetitionsIndex-cardName">{competition.name}</span>
        <span className="CompetitionsIndex-cardArrow" aria-hidden="true">
          →
        </span>
      </a>
    </li>
  );
}

function CompetitionGroup({ id, label, competitions, featured: isFeatured = false }) {
  if (competitions.length === 0) {
    return null;
  }

  return (
    <section
      id={`competitions-${id}`}
      className={`CompetitionsIndex-group${isFeatured ? " CompetitionsIndex-group--featured" : ""}`}
      aria-labelledby={`competitions-${id}-title`}
    >
      <div className="CompetitionsIndex-groupHeader">
        <h2 id={`competitions-${id}-title`}>{label}</h2>
        <span className="CompetitionsIndex-count">{competitions.length}</span>
      </div>
      <ul className="CompetitionsIndex-grid">
        {competitions.map((competition) => (
          <CompetitionCard
            key={competition.slug}
            competition={competition}
            featured={isFeatured}
          />
        ))}
      </ul>
    </section>
  );
}

function matchesQuery(competition, query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return (
    competition.name.toLowerCase().includes(q) ||
    competition.slug.replace(/-/g, " ").includes(q) ||
    competition.slug.includes(q.replace(/\s+/g, "-"))
  );
}

function filterCompetitions(list, query) {
  return list.filter((competition) => matchesQuery(competition, query));
}

export default function CompetitionsIndexMain({ sections }) {
  const { featured, regions, other, total } = sections;
  const [filter, setFilter] = useState("");
  const query = filter.trim();
  const isFiltering = query.length > 0;

  const filteredFeatured = useMemo(
    () => filterCompetitions(featured, filter),
    [featured, filter]
  );
  const filteredRegions = useMemo(
    () =>
      regions
        .map((group) => ({
          ...group,
          competitions: filterCompetitions(group.competitions, filter),
        }))
        .filter((group) => group.competitions.length > 0),
    [regions, filter]
  );
  const filteredOther = useMemo(
    () => filterCompetitions(other, filter),
    [other, filter]
  );

  const visibleCount =
    filteredFeatured.length +
    filteredRegions.reduce((sum, group) => sum + group.competitions.length, 0) +
    filteredOther.length;

  const jumpSections = useMemo(() => {
    const items = [{ id: "featured", label: "Popular" }];
    regions.forEach((group) => {
      items.push({ id: group.id, label: group.label });
    });
    if (other.length > 0) {
      items.push({ id: "more", label: "More" });
    }
    return items;
  }, [regions, other.length]);

  return (
    <>
      <div id="ssh-content" className="CompetitionsIndex-journeyZone">
        <header className="CompetitionsIndex-header">
          <nav className="CompetitionsIndex-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true"> / </span>
            <span aria-current="page">Competitions</span>
          </nav>
          <h1>Football competitions</h1>
          <p className="CompetitionsIndex-intro">
            League-wide football stats for every competition we cover: average goals,
            BTTS rates, corner and card lines, home advantage and team rankings.
          </p>
          <p className="CompetitionsIndex-intro">
            Open any league for live tables, market hit rates and team rankings. Use
            Popular for the big European leagues, or browse by region below.
          </p>

          <div className="CompetitionsIndex-toolbar">
            <input
              type="search"
              className="CompetitionsIndex-search"
              placeholder="Search leagues…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Search football competitions"
            />
            <a href="/competitions/compare/" className="CompetitionsIndex-compareLink">
              Compare leagues
            </a>
          </div>

          <div className="CompetitionsIndex-status">
            <p className="CompetitionsIndex-meta">{total} competitions indexed</p>
            {isFiltering ? (
              <p className="CompetitionsIndex-resultCount" role="status">
                {visibleCount === 0
                  ? `No matches for “${query}”`
                  : `${visibleCount} match${visibleCount === 1 ? "" : "es"}`}
              </p>
            ) : null}
          </div>

          {!isFiltering ? (
            <nav className="CompetitionsIndex-jump" aria-label="Jump to region">
              {jumpSections.map((item) => (
                <a key={item.id} href={`#competitions-${item.id}`} title={item.label}>
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
        </header>

        <JourneyContentBreak>
          Pick a league for standings, BTTS and Over 2.5 stats, or open the cross-league
          comparison tool.
        </JourneyContentBreak>
      </div>

      <div className="CompetitionsIndex-groups">
        {isFiltering && visibleCount === 0 ? (
          <p className="CompetitionsIndex-empty">
            Try another name or{" "}
            <button type="button" className="CompetitionsIndex-clearSearch" onClick={() => setFilter("")}>
              clear search
            </button>
            .
          </p>
        ) : (
          <>
            <CompetitionGroup
              id="featured"
              label="Popular"
              competitions={filteredFeatured}
              featured
            />

            {filteredRegions.map((group) => (
              <CompetitionGroup
                key={group.id}
                id={group.id}
                label={group.label}
                competitions={group.competitions}
              />
            ))}

            {filteredOther.length > 0 ? (
              <CompetitionGroup
                id="more"
                label="More competitions"
                competitions={filteredOther}
              />
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

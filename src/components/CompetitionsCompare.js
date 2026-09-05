import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import SiteHeader from "./SiteHeader";
import {
  COMPARISON_METRICS,
  formatMetricValue,
  isLowSample,
} from "../seo/competitionOverviewData";

const CompetitionCompareCharts = dynamic(
  () => import("./competition/competitionCompareCharts"),
  { ssr: false }
);

const SORTABLE_COLUMNS = [
  { key: "name", label: "League", type: "text" },
  // Matches the stat hub tables, which drop the country column on small screens.
  { key: "country", label: "Country", type: "text", className: "SubpageCol--country" },
  { key: "played", label: "Played", type: "number" },
  ...COMPARISON_METRICS.map((metric) => ({
    key: metric.key,
    label: metric.short,
    title: metric.label,
    type: "number",
    metric,
  })),
];

function formatUpdated(generatedAt) {
  if (!generatedAt) return null;
  const date = new Date(generatedAt);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function compareRows(a, b, column, direction) {
  const factor = direction === "asc" ? 1 : -1;

  if (column.type === "text") {
    return String(a[column.key] || "").localeCompare(String(b[column.key] || "")) * factor;
  }

  const aValue = a[column.key];
  const bValue = b[column.key];
  // Leagues that do not report a metric always sit at the bottom.
  if (aValue === null || aValue === undefined) return 1;
  if (bValue === null || bValue === undefined) return -1;
  return (Number(aValue) - Number(bValue)) * factor;
}

export default function CompetitionsCompare({ overview }) {
  const competitions = overview?.competitions || [];
  const [sort, setSort] = useState({ key: "avgGoals", direction: "desc" });

  const sorted = useMemo(() => {
    const column = SORTABLE_COLUMNS.find((entry) => entry.key === sort.key);
    if (!column) return competitions;
    return [...competitions].sort((a, b) => compareRows(a, b, column, sort.direction));
  }, [competitions, sort]);

  const updated = formatUpdated(overview?.generatedAt);

  function toggleSort(column) {
    setSort((current) =>
      current.key === column.key
        ? {
            key: column.key,
            direction: current.direction === "desc" ? "asc" : "desc",
          }
        : { key: column.key, direction: column.type === "text" ? "asc" : "desc" }
    );
  }

  return (
    <SiteHeader showThemeToggle withFooter>
      <main className="StaticPage CompetitionsCompare" id="ssh-content">
        <header className="CompetitionsCompare-header">
          <nav className="CompetitionsCompare-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true"> / </span>
            <a href="/competitions/">Competitions</a>
            <span aria-hidden="true"> / </span>
            <span>Compare</span>
          </nav>
          <h1>Compare football leagues</h1>
          <p className="CompetitionsCompare-intro">
            Every league we cover, side by side on the markets that actually differ
            between competitions: goals per game, both teams to score, over and
            under 2.5, cards, corners and home advantage.
          </p>
        </header>

        {competitions.length === 0 ? (
          <p className="CompetitionsCompare-empty">
            The comparison data is refreshing. Please check back shortly, or browse{" "}
            <a href="/competitions/">all competitions</a> in the meantime.
          </p>
        ) : (
          <>
            <section className="CompetitionsCompare-notes" aria-label="How to read this page">
              <p className="CompetitionsCompare-methodology">
                Figures cover the current season only and come from the same source
                as our individual competition pages, rebuilt once a day.
              </p>
              {updated ? (
                <p className="CompetitionsCompare-updated">Data updated {updated}.</p>
              ) : null}
            </section>

            <CompetitionCompareCharts competitions={competitions} />

            <section className="CompetitionsCompare-tableSection">
              <h2 id="all-leagues">All leagues compared</h2>
              <p className="CompetitionsCompare-tableHint">
                Select any column heading to re-sort the table.
              </p>
              <div className="CompetitionsCompare-tableScroll SubpageTableScroll">
                <table className="CompetitionsCompare-table">
                  <caption className="CompetitionsCompare-tableCaption">
                    Season averages for {competitions.length} in progress football leagues
                    {updated ? `, updated ${updated}` : ""}
                  </caption>
                  <thead>
                    <tr>
                      {SORTABLE_COLUMNS.map((column) => {
                        const active = sort.key === column.key;
                        return (
                          <th
                            key={column.key}
                            scope="col"
                            className={column.className}
                            aria-sort={
                              active
                                ? sort.direction === "asc"
                                  ? "ascending"
                                  : "descending"
                                : "none"
                            }
                          >
                            <button
                              type="button"
                              onClick={() => toggleSort(column)}
                              title={column.title || column.label}
                              className={`CompetitionsCompare-sortButton${
                                active ? " is-active" : ""
                              }`}
                            >
                              {column.label}
                              {active ? (
                                <span aria-hidden="true">
                                  {sort.direction === "asc" ? " ▲" : " ▼"}
                                </span>
                              ) : null}
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((row) => (
                      <tr key={row.slug}>
                        <th scope="row" className="CompetitionsCompare-leagueCell">
                          <a href={`/competition/${row.slug}/`}>{row.name}</a>
                          {isLowSample(row) ? (
                            <span
                              className="CompetitionsCompare-lowSample"
                              title={`Only ${row.played} matches played so far`}
                            >
                              small sample
                            </span>
                          ) : null}
                        </th>
                        <td className="SubpageCol--country">{row.country}</td>
                        <td>
                          {row.played}
                          {row.total ? (
                            <span className="CompetitionsCompare-ofTotal">
                              /{row.total}
                            </span>
                          ) : null}
                        </td>
                        {COMPARISON_METRICS.map((metric) => (
                          <td key={metric.key}>
                            {formatMetricValue(row[metric.key], metric) || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="CompetitionsCompare-related" aria-label="Related pages">
              <h2>Go deeper</h2>
              <ul>
                <li>
                  <a href="/competitions/">
                    Every competition we cover, grouped by region
                  </a>
                </li>
                <li>
                  <a href="/highest-scoring-leagues/">
                    Highest scoring leagues, ranked by average goals
                  </a>
                </li>
                <li>
                  <a href="/u25/">Lowest scoring leagues and Under 2.5 rates</a>
                </li>
                <li>
                  <a href="/methodology/">How we build these numbers</a>
                </li>
              </ul>
            </section>
          </>
        )}
      </main>
    </SiteHeader>
  );
}

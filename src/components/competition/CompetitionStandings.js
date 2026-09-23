import { Suspense, lazy, useEffect, useState } from "react";
import { apiGetUrl } from "../../utils/apiUrl";
import { buildCompetitionLeagueTableViews } from "./competitionLeagueTable";
import CompetitionClassicLeagueTable from "./CompetitionClassicLeagueTable";

const LazyLeagueTable = lazy(() => import("../LeagueTable"));

function getTablesDateString() {
  return new Date().toISOString().slice(0, 10);
}

function getClassicTableTeams(views) {
  if (views.mode === "divisions") {
    return views.divisions.flatMap((division) => division.teams);
  }
  return views.teams;
}

export default function CompetitionStandings({ seasonId }) {
  const [views, setViews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLayout, setTableLayout] = useState("summary");

  useEffect(() => {
    setTableLayout("summary");
  }, [seasonId]);

  useEffect(() => {
    if (!seasonId) {
      return;
    }

    let cancelled = false;

    async function fetchStandings() {
      setLoading(true);
      setViews(null);

      try {
        const dateStr = getTablesDateString();
        const response = await fetch(
          apiGetUrl(`tables/${seasonId}/${dateStr}`)
        );

        if (!response.ok) {
          return;
        }

        const json = await response.json();
        const tableViews = buildCompetitionLeagueTableViews(seasonId, json);

        if (!cancelled) {
          setViews(tableViews);
        }
      } catch {
        if (!cancelled) {
          setViews(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStandings();

    return () => {
      cancelled = true;
    };
  }, [seasonId]);

  if (loading) {
    return (
      <section className="Competition__section Competition__standings">
        <h2 className="Competition__sectionHeading">Standings</h2>
        <div className="Competition__standingsLoading">Loading table…</div>
      </section>
    );
  }

  if (!views) {
    return null;
  }

  const tableKey = `Competition${seasonId}`;
  const showClassicLayout =
    views.supportsClassicTable && tableLayout === "classic";

  function renderSummaryTable(teams, divisionName, keySuffix = "") {
    return (
      <LazyLeagueTable
        Teams={teams}
        Id={Number(seasonId)}
        Division={divisionName}
        Key={`${tableKey}${keySuffix}`}
        standingsOnly
      />
    );
  }

  return (
    <section className="Competition__section Competition__standings">
      <div className="Competition__standingsHeader">
        <h2 className="Competition__sectionHeading">Standings</h2>
        {views.supportsClassicTable ? (
          <div
            className="Competition__standingsToggle"
            role="tablist"
            aria-label="Table layout"
          >
            <button
              type="button"
              role="tab"
              aria-selected={tableLayout === "summary"}
              className={
                tableLayout === "summary"
                  ? "Competition__standingsToggleBtn Competition__standingsToggleBtn--active"
                  : "Competition__standingsToggleBtn"
              }
              onClick={() => setTableLayout("summary")}
            >
              Summary
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tableLayout === "classic"}
              className={
                tableLayout === "classic"
                  ? "Competition__standingsToggleBtn Competition__standingsToggleBtn--active"
                  : "Competition__standingsToggleBtn"
              }
              onClick={() => setTableLayout("classic")}
            >
              Home &amp; away
            </button>
          </div>
        ) : null}
      </div>
      {showClassicLayout ? (
        <CompetitionClassicLeagueTable teams={getClassicTableTeams(views)} />
      ) : (
        <div className="LeagueTable">
          <Suspense fallback={<div>Loading table…</div>}>
            {views.mode === "standard" && renderSummaryTable(views.teams)}

            {views.mode === "grouped" && renderSummaryTable(views.teams)}

            {views.mode === "divisions" &&
              views.divisions.map((division, index) =>
                renderSummaryTable(
                  division.teams,
                  division.name,
                  `${index}-${division.name}`
                )
              )}
          </Suspense>
        </div>
      )}
    </section>
  );
}

import { Suspense, lazy, useEffect, useState } from "react";
import { apiGetUrl } from "../../utils/apiUrl";
import { buildCompetitionLeagueTableViews } from "./competitionLeagueTable";

const LazyLeagueTable = lazy(() => import("../LeagueTable"));

function getTablesDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default function CompetitionStandings({ seasonId }) {
  const [views, setViews] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="Competition__section Competition__standings">
      <h2 className="Competition__sectionHeading">Standings</h2>
      <div className="LeagueTable">
        <Suspense fallback={<div>Loading table…</div>}>
          {views.mode === "standard" && (
            <LazyLeagueTable
              Teams={views.teams}
              Id={Number(seasonId)}
              Key={tableKey}
              standingsOnly
            />
          )}

          {views.mode === "grouped" && (
            <LazyLeagueTable
              Teams={views.teams}
              Id={Number(seasonId)}
              Key={tableKey}
              standingsOnly
            />
          )}

          {views.mode === "divisions" &&
            views.divisions.map((division, index) => (
              <LazyLeagueTable
                key={`${tableKey}-${division.name}`}
                Teams={division.teams}
                Id={Number(seasonId)}
                Division={division.name}
                Key={`${tableKey}${index}`}
                standingsOnly
              />
            ))}
        </Suspense>
      </div>
    </section>
  );
}

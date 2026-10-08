import { useEffect, useState } from "react";
import { apiGetUrl } from "../../utils/apiUrl";
import {
  buildCompetitionLeagueTableViews,
  CONFERENCE_SCOPE_OVERALL,
  conferenceScopeLabel,
  normaliseMlsConferenceName,
} from "./competitionLeagueTable";
import { sortTeamsByLastFive } from "./competitionFormChartUtils";

function getTablesDateString() {
  return new Date().toISOString().slice(0, 10);
}

function formIndicatorClass(indicator) {
  if (indicator === "W") return "winLeague";
  if (indicator === "D") return "drawLeague";
  if (indicator === "L") return "lossLeague";
  return "Competition__formPill--empty";
}

function groupedTeamSets(teams, scope) {
  const grouped = new Map();
  teams.forEach((team) => {
    const teamScope = normaliseMlsConferenceName(team.GroupName);
    if (scope !== CONFERENCE_SCOPE_OVERALL && teamScope !== scope) {
      return;
    }
    const label = team.GroupName || conferenceScopeLabel(teamScope);
    if (!grouped.has(label)) grouped.set(label, []);
    grouped.get(label).push(team);
  });

  return [...grouped.entries()].map(([label, groupedTeams]) => ({
    label,
    teams: sortTeamsByLastFive(groupedTeams),
  }));
}

function teamSetsFromViews(views, scope = CONFERENCE_SCOPE_OVERALL) {
  if (!views) {
    return [];
  }

  if (views.mode === "divisions") {
    return views.divisions.map((division) => ({
      label: division.name,
      teams: sortTeamsByLastFive(division.teams),
    }));
  }

  if (views.mode === "grouped") {
    if (scope === CONFERENCE_SCOPE_OVERALL) {
      return [
        {
          label: null,
          teams: sortTeamsByLastFive(views.teams),
        },
      ];
    }
    return groupedTeamSets(views.teams, scope);
  }

  return [
    {
      label: null,
      teams: sortTeamsByLastFive(views.teams),
    },
  ];
}

function FormPills({ form }) {
  const sequence =
    form && form !== "N/A" ? form.padEnd(5, " ").slice(0, 5).split("") : [];

  return (
    <div className="Competition__formPills" aria-label={form ? `Form ${form}` : "Form unavailable"}>
      {sequence.map((indicator, index) => {
        const trimmed = indicator.trim();
        if (!trimmed) {
          return (
            <span
              key={index}
              className="Competition__formPill Competition__formPill--empty"
              aria-hidden="true"
            />
          );
        }
        return (
          <span
            key={index}
            className={`Competition__formPill ${formIndicatorClass(trimmed)}`}
          >
            {trimmed}
          </span>
        );
      })}
    </div>
  );
}

function FormChartTable({ teams, caption }) {
  if (!teams.length) {
    return null;
  }

  return (
    <div className="Competition__formChartTableWrap">
      <table className="Competition__formChartTable">
        {caption ? <caption className="Competition__formChartCaption">{caption}</caption> : null}
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Team</th>
            <th scope="col" className="Competition__formChartTablePos">
              Table
            </th>
            <th scope="col">Pts</th>
            <th scope="col">Last 5</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={`${team.ID || team.Name}-${index}`}>
              <td>{index + 1}</td>
              <th scope="row">{team.Name}</th>
              <td className="Competition__formChartTablePos">{team.Position}</td>
              <td>{team.LastXPoints ?? "—"}</td>
              <td>
                <FormPills form={team.Form} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CompetitionFormChart({
  seasonId,
  scope = CONFERENCE_SCOPE_OVERALL,
  tableViews,
}) {
  const [views, setViews] = useState(tableViews ?? null);
  const [loading, setLoading] = useState(tableViews === undefined);

  useEffect(() => {
    if (tableViews !== undefined) {
      setViews(tableViews);
      setLoading(false);
      return undefined;
    }

    if (!seasonId) {
      return undefined;
    }

    let cancelled = false;

    async function fetchTable() {
      setLoading(true);
      setViews(null);

      try {
        const dateStr = getTablesDateString();
        const response = await fetch(apiGetUrl(`tables/${seasonId}/${dateStr}`));

        if (!response.ok) {
          return;
        }

        const json = await response.json();
        const nextViews = buildCompetitionLeagueTableViews(seasonId, json);

        if (!cancelled) {
          setViews(nextViews);
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

    fetchTable();

    return () => {
      cancelled = true;
    };
  }, [seasonId, tableViews]);

  if (loading) {
    return (
      <section className="Competition__section Competition__formChart" aria-labelledby="competition-form-chart">
        <h2 id="competition-form-chart" className="Competition__sectionHeading">
          Form table (last 5 matches)
        </h2>
        <div className="Competition__formChartLoading">Loading form…</div>
      </section>
    );
  }

  if (!views) {
    return null;
  }

  const sets = teamSetsFromViews(views, scope);

  return (
    <section className="Competition__section Competition__formChart" aria-labelledby="competition-form-chart">
      <h2 id="competition-form-chart" className="Competition__sectionHeading">
        Form table (last 5 matches)
      </h2>
      {sets.map((set) => (
        <FormChartTable
          key={set.label || "league"}
          teams={set.teams}
          caption={set.label}
        />
      ))}
    </section>
  );
}

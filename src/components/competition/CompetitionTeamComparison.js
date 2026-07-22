import { useEffect, useMemo, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  ScatterController,
} from "chart.js";
import { Scatter, Bar, Radar } from "react-chartjs-2";
import { apiGetUrl } from "../../utils/apiUrl";
import { useChartTheme, getChartColors } from "../Chart";
import ShareableVisual from "../ShareableVisual";
import { sanitizeImageFilename } from "../../utils/captureElementImage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
  ScatterController
);

/** Custom listbox — native <select> option alignment is OS-controlled and uneven. */
function MetricPicker({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const selected =
    options.find((opt) => opt.key === value) ||
    options.find((opt) => opt.key === "") ||
    options[0];

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="Competition__metricPicker" ref={rootRef}>
      {label ? (
        <span className="Competition__comparisonSelectLabel">{label}</span>
      ) : null}
      <div className="Competition__metricPickerControl">
        <button
          type="button"
          className="Competition__metricPickerTrigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="Competition__metricPickerValue">
            {selected?.label || "Select"}
          </span>
          <span className="Competition__metricPickerCaret" aria-hidden="true">
            ▾
          </span>
        </button>
        {open ? (
          <ul className="Competition__metricPickerMenu" role="listbox">
            {options.map((opt) => {
              const isActive = opt.key === value;
              return (
                <li
                  key={opt.key === "" ? "__empty__" : opt.key}
                  role="option"
                  aria-selected={isActive}
                >
                  <button
                    type="button"
                    className={`Competition__metricPickerOption${
                      isActive ? " Competition__metricPickerOption--active" : ""
                    }`}
                    onClick={() => {
                      onChange(opt.key);
                      setOpen(false);
                    }}
                  >
                    <span
                      className="Competition__metricPickerCheck"
                      aria-hidden="true"
                    >
                      {isActive ? "✓" : ""}
                    </span>
                    <span className="Competition__metricPickerOptionLabel">
                      {opt.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

const METRIC_OPTIONS = [
  {
    key: "attackingStrength",
    label: "Attacking strength",
    decimals: 2,
    fixedRange: [0, 1],
    stepSize: 0.2,
  },
  {
    key: "defensiveStrength",
    label: "Defensive strength",
    decimals: 2,
    fixedRange: [0, 1],
    stepSize: 0.2,
  },
  {
    key: "attackingStrengthLast5",
    label: "Attacking strength (Last 5)",
    decimals: 2,
    fixedRange: [0, 1],
    stepSize: 0.2,
  },
  {
    key: "defensiveStrengthLast5",
    label: "Defensive strength (Last 5)",
    decimals: 2,
    fixedRange: [0, 1],
    stepSize: 0.2,
  },
  { key: "possession", label: "Possession %", decimals: 1, suffix: "%" },
  { key: "possessionLast5", label: "Possession % (Last 5)", decimals: 1, suffix: "%" },
  { key: "shotsFor", label: "Shots for", decimals: 1 },
  { key: "shotsAgainst", label: "Shots against", decimals: 1 },
  { key: "sotFor", label: "Shots on target", decimals: 1 },
  { key: "sotAgainst", label: "SOT against", decimals: 1 },
  { key: "daFor", label: "Dangerous attacks", decimals: 1 },
  { key: "daAgainst", label: "DA against", decimals: 1 },
  { key: "xgFor", label: "xG for", decimals: 2 },
  { key: "xgAgainst", label: "xG against", decimals: 2 },
  { key: "xgDiff", label: "xG difference", decimals: 2 },
  { key: "weightedXgFor", label: "Weighted xG for", decimals: 2 },
  { key: "weightedXgAgainst", label: "Weighted xG against", decimals: 2 },
  { key: "goalsFor", label: "Goals for", decimals: 2 },
  { key: "goalsAgainst", label: "Goals against", decimals: 2 },
  { key: "goalDiff", label: "Goal difference", decimals: 2 },
  { key: "cornersFor", label: "Corners for", decimals: 1 },
  { key: "cornersAgainst", label: "Corners against", decimals: 1 },
  { key: "shotConversionPct", label: "Shot conversion %", decimals: 1, suffix: "%" },
  { key: "sotConversionPct", label: "SOT conversion %", decimals: 1, suffix: "%" },
  { key: "bttsPct", label: "BTTS %", decimals: 1, suffix: "%" },
  { key: "cleanSheetPct", label: "Clean sheet %", decimals: 1, suffix: "%" },
  { key: "winPct", label: "Win %", decimals: 1, suffix: "%" },
  { key: "avgPoints", label: "Avg points", decimals: 2 },
  { key: "xgForLast5", label: "xG for (Last 5)", decimals: 2 },
  { key: "xgAgainstLast5", label: "xG against (Last 5)", decimals: 2 },
  { key: "goalsForLast5", label: "Goals for (Last 5)", decimals: 2 },
  { key: "goalsAgainstLast5", label: "Goals against (Last 5)", decimals: 2 },
  { key: "shotsForLast5", label: "Shots for (Last 5)", decimals: 1 },
  { key: "sotForLast5", label: "SOT for (Last 5)", decimals: 1 },
  { key: "daForLast5", label: "DA for (Last 5)", decimals: 1 },
];

function getMetricMeta(key) {
  return METRIC_OPTIONS.find((m) => m.key === key) || METRIC_OPTIONS[0];
}

function niceStep(rough) {
  if (!Number.isFinite(rough) || rough <= 0) return 1;
  const power = Math.pow(10, Math.floor(Math.log10(rough)));
  const normalized = rough / power;
  if (normalized <= 1) return power;
  if (normalized <= 2) return 2 * power;
  if (normalized <= 5) return 5 * power;
  return 10 * power;
}

/** Auto axis range from team values, with padding and nice ticks. */
function computeAxisRange(values, metric) {
  if (metric?.fixedRange) {
    const [min, max] = metric.fixedRange;
    return {
      min,
      max,
      stepSize: metric.stepSize ?? niceStep((max - min) / 5),
    };
  }

  const nums = (values || []).filter((v) => Number.isFinite(v));
  if (!nums.length) {
    return { min: 0, max: 1, stepSize: 0.2 };
  }

  let min = Math.min(...nums);
  let max = Math.max(...nums);
  if (min === max) {
    const pad = Math.max(Math.abs(min) * 0.1, 0.5);
    min -= pad;
    max += pad;
  } else {
    const pad = (max - min) * 0.08;
    min -= pad;
    max += pad;
  }

  // Keep non-negative floors for rate/% metrics that can't go below 0
  if (
    metric?.suffix === "%" ||
    ["shotsFor", "shotsAgainst", "sotFor", "sotAgainst", "daFor", "daAgainst", "cornersFor", "cornersAgainst", "avgPoints"].includes(
      metric?.key
    )
  ) {
    min = Math.max(0, min);
  }

  const step = niceStep((max - min) / 5);
  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  if (min === max) {
    max = min + step;
  }

  return { min, max, stepSize: step };
}

function formatMetricValue(value, metric) {
  if (!Number.isFinite(Number(value))) return "-";
  const formatted = Number(value).toFixed(metric?.decimals ?? 2);
  return metric?.suffix ? `${formatted}${metric.suffix}` : formatted;
}

const RADAR_AXES = [
  { key: "attackingStrength", label: "Attack", scale: 1 },
  { key: "defensiveStrength", label: "Defence", scale: 1 },
  { key: "xgFor", label: "xG for", scale: 0.4 },
  { key: "daFor", label: "DA", scale: 0.015 },
  { key: "sotFor", label: "SOT", scale: 0.15 },
  { key: "bttsPct", label: "BTTS", scale: 0.01 },
];

const TEAM_COLORS = [
  "#01a501",
  "#f57701",
  "#0644B3",
  "#C22EDC",
  "#d71200",
  "#119F0B",
];

const MAX_RADAR_TEAMS = 4;
const LEAGUE_AVERAGE_NAME = "League average";

function buildLeagueAverageProfile(teams) {
  if (!Array.isArray(teams) || teams.length === 0) return null;

  const profile = {
    name: LEAGUE_AVERAGE_NAME,
    isLeagueAverage: true,
  };

  for (const metric of METRIC_OPTIONS) {
    const values = teams
      .map((team) => Number(team?.[metric.key]))
      .filter((value) => Number.isFinite(value));
    if (!values.length) continue;
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    profile[metric.key] = Number(mean.toFixed(metric.decimals ?? 2));
  }

  return profile;
}

const NAME_SKIP_WORDS = new Set([
  "fc",
  "cf",
  "afc",
  "sc",
  "ac",
  "as",
  "fk",
  "sk",
  "bk",
  "if",
  "cd",
  "ud",
  "sd",
  "rcd",
  "us",
  "ss",
  "calcio",
  "club",
  "de",
  "da",
  "do",
  "del",
  "della",
  "la",
  "el",
  "the",
  "and",
  "of",
  "united", // kept via first meaningful word pairing below when alone isn't enough
]);

/** Compact on-chart label; tooltip still shows the full name. */
function abbreviateTeamName(name) {
  if (!name) return "";
  const words = String(name)
    .replace(/[^a-zA-Z0-9\s'-]/g, " ")
    .split(/[\s'-]+/)
    .filter(Boolean);

  const significant = words.filter(
    (word) => !NAME_SKIP_WORDS.has(word.toLowerCase())
  );
  const pool = significant.length > 0 ? significant : words;

  if (pool.length === 0) return "";
  if (pool.length === 1) {
    return pool[0].slice(0, 3).toUpperCase();
  }
  if (pool.length === 2) {
    const a = pool[0];
    const b = pool[1];
    if (a.length <= 3) {
      return `${a.slice(0, 3)}${b[0]}`.toUpperCase();
    }
    return `${a[0]}${b[0]}${b[1] || ""}`.toUpperCase().slice(0, 3);
  }
  return pool
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function createScatterLabelPlugin(labelColor) {
  return {
    id: "competitionScatterLabels",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      if (!meta?.data?.length) return;

      ctx.save();
      ctx.font = "600 10px 'Open Sans', system-ui, sans-serif";
      ctx.fillStyle = labelColor;
      ctx.textBaseline = "middle";

      meta.data.forEach((element, index) => {
        const raw = chart.data.datasets[0]?.data?.[index];
        const label = raw?.abbr;
        if (!label || !element) return;

        const { x, y } = element.getProps(["x", "y"], true);
        const chartArea = chart.chartArea;
        const textWidth = ctx.measureText(label).width;
        const preferRight = x + 8 + textWidth < chartArea.right - 4;
        const textX = preferRight ? x + 8 : x - 8 - textWidth;

        ctx.globalAlpha = 0.92;
        ctx.fillText(label, textX, y);
      });

      ctx.restore();
    },
  };
}

function isoDateOffset(daysBack = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

async function fetchLeagueComparison(seasonId) {
  for (let daysBack = 0; daysBack <= 3; daysBack += 1) {
    const dateStr = isoDateOffset(daysBack);
    const response = await fetch(
      apiGetUrl(`leagueComparison/${seasonId}/${dateStr}`)
    );
    if (response.ok) {
      return response.json();
    }
  }
  return null;
}

function ChartCard({ title, children, actions, className = "" }) {
  return (
    <div
      className={`Competition__chartCard Competition__comparisonCard${
        className ? ` ${className}` : ""
      }`}
    >
      <div className="Competition__comparisonCardHeader">
        {title ? <h3 className="Competition__chartCardTitle">{title}</h3> : null}
        {actions}
      </div>
      <div className="Competition__chartCardBody">{children}</div>
    </div>
  );
}

export default function CompetitionTeamComparison({ seasonId }) {
  const theme = useChartTheme();
  const { color, gridColor, tooltipBackground } = getChartColors(theme);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metricKey, setMetricKey] = useState("attackingStrength");
  const [scatterXKey, setScatterXKey] = useState("possession");
  const [scatterYKey, setScatterYKey] = useState("sotFor");
  const [scatterTeamA, setScatterTeamA] = useState("");
  const [scatterTeamB, setScatterTeamB] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]);

  useEffect(() => {
    if (!seasonId) return undefined;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setPayload(null);
      setSelectedTeams([]);
      setScatterTeamA("");
      setScatterTeamB("");
      try {
        const data = await fetchLeagueComparison(seasonId);
        if (!cancelled) {
          setPayload(data);
          const top = (data?.teams || [])
            .slice()
            .sort((a, b) => b.attackingStrength - a.attackingStrength)
            .slice(0, 2)
            .map((t) => t.name);
          setSelectedTeams(top);
        }
      } catch {
        if (!cancelled) setPayload(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [seasonId]);

  const teams = payload?.teams || [];
  const leagueAverage = useMemo(
    () => buildLeagueAverageProfile(teams),
    [teams]
  );

  const availableMetrics = useMemo(() => {
    if (!teams.length) return METRIC_OPTIONS;
    return METRIC_OPTIONS.filter((metric) =>
      teams.some((team) => Number.isFinite(Number(team?.[metric.key])))
    );
  }, [teams]);

  useEffect(() => {
    if (!availableMetrics.length) return;
    const keys = new Set(availableMetrics.map((m) => m.key));
    if (!keys.has(scatterXKey)) {
      setScatterXKey(availableMetrics[0].key);
    }
    if (!keys.has(scatterYKey)) {
      setScatterYKey(
        availableMetrics[1]?.key || availableMetrics[0].key
      );
    }
    if (!keys.has(metricKey)) {
      setMetricKey(availableMetrics[0].key);
    }
  }, [availableMetrics, scatterXKey, scatterYKey, metricKey]);

  const scatterXMeta = getMetricMeta(scatterXKey);
  const scatterYMeta = getMetricMeta(scatterYKey);

  const sortedTeamNames = useMemo(
    () =>
      teams
        .map((team) => team.name)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [teams]
  );

  const scatterTeamOptionsA = useMemo(() => {
    const names = sortedTeamNames.filter((name) => name !== scatterTeamB);
    return [
      { key: "", label: "All teams" },
      ...(leagueAverage
        ? [{ key: LEAGUE_AVERAGE_NAME, label: LEAGUE_AVERAGE_NAME }]
        : []),
      ...names.map((name) => ({ key: name, label: name })),
    ];
  }, [sortedTeamNames, scatterTeamB, leagueAverage]);

  const scatterTeamOptionsB = useMemo(() => {
    const names = sortedTeamNames.filter((name) => name !== scatterTeamA);
    return [
      { key: "", label: "None" },
      ...(leagueAverage && scatterTeamA !== LEAGUE_AVERAGE_NAME
        ? [{ key: LEAGUE_AVERAGE_NAME, label: LEAGUE_AVERAGE_NAME }]
        : []),
      ...names.map((name) => ({ key: name, label: name })),
    ];
  }, [sortedTeamNames, scatterTeamA, leagueAverage]);

  const plottableByName = useMemo(() => {
    const map = new Map(teams.map((team) => [team.name, team]));
    if (leagueAverage) {
      map.set(LEAGUE_AVERAGE_NAME, leagueAverage);
    }
    return map;
  }, [teams, leagueAverage]);

  const plottedTeams = useMemo(() => {
    const focus = [scatterTeamA, scatterTeamB].filter(Boolean);
    if (focus.length === 0) return teams;
    return focus
      .map((name) => plottableByName.get(name))
      .filter(Boolean);
  }, [teams, scatterTeamA, scatterTeamB, plottableByName]);

  const scatterLabelPlugin = useMemo(
    () => createScatterLabelPlugin(color),
    [color]
  );

  const scatterData = useMemo(() => {
    const points = plottedTeams
      .map((team) => {
        const x = Number(team[scatterXKey]);
        const y = Number(team[scatterYKey]);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        return {
          x,
          y,
          team: team.name,
          abbr: team.isLeagueAverage ? "AVG" : abbreviateTeamName(team.name),
          isLeagueAverage: Boolean(team.isLeagueAverage),
        };
      })
      .filter(Boolean);

    return {
      datasets: [
        {
          label: "Teams",
          data: points,
          backgroundColor: points.map((point) =>
            point.isLeagueAverage
              ? "rgba(245, 119, 1, 0.9)"
              : "rgba(1, 165, 1, 0.8)"
          ),
          borderColor: points.map((point) =>
            point.isLeagueAverage ? "#f57701" : "#01a501"
          ),
          borderWidth: 1,
          pointRadius: plottedTeams.length <= 2 ? 5 : 4,
          pointHoverRadius: plottedTeams.length <= 2 ? 7 : 6,
        },
      ],
    };
  }, [plottedTeams, scatterXKey, scatterYKey]);

  const scatterAxisRanges = useMemo(() => {
    // Keep league-wide scale so focused teams stay in context
    const leaguePoints = teams
      .map((team) => ({
        x: Number(team[scatterXKey]),
        y: Number(team[scatterYKey]),
      }))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
    return {
      x: computeAxisRange(
        leaguePoints.map((p) => p.x),
        scatterXMeta
      ),
      y: computeAxisRange(
        leaguePoints.map((p) => p.y),
        scatterYMeta
      ),
    };
  }, [teams, scatterXKey, scatterYKey, scatterXMeta, scatterYMeta]);

  const scatterOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipBackground,
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          callbacks: {
            title(items) {
              return items[0]?.raw?.team || "";
            },
            label(context) {
              const { x, y, abbr } = context.raw || {};
              const line = `${scatterXMeta.label} ${formatMetricValue(x, scatterXMeta)} · ${scatterYMeta.label} ${formatMetricValue(y, scatterYMeta)}`;
              return abbr ? [`${abbr}`, line] : line;
            },
          },
        },
      },
      layout: {
        padding: { top: 8, right: 28, bottom: 6, left: 6 },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: scatterXMeta.label,
            color,
            font: { size: 12, weight: "600" },
            padding: { top: 4, bottom: 2 },
          },
          ticks: {
            color,
            font: { size: 10 },
            stepSize: scatterAxisRanges.x.stepSize,
            padding: 4,
          },
          grid: { color: gridColor, drawTicks: false },
          border: { display: false },
          min: scatterAxisRanges.x.min,
          max: scatterAxisRanges.x.max,
        },
        y: {
          title: {
            display: true,
            text: scatterYMeta.label,
            color,
            font: { size: 12, weight: "600" },
            padding: { top: 2, bottom: 4 },
          },
          ticks: {
            color,
            font: { size: 10 },
            stepSize: scatterAxisRanges.y.stepSize,
            padding: 4,
          },
          grid: { color: gridColor, drawTicks: false },
          border: { display: false },
          min: scatterAxisRanges.y.min,
          max: scatterAxisRanges.y.max,
        },
      },
    }),
    [
      color,
      gridColor,
      tooltipBackground,
      scatterXMeta,
      scatterYMeta,
      scatterAxisRanges,
    ]
  );

  const metricMeta = getMetricMeta(metricKey);

  const barSorted = useMemo(() => {
    return [...teams]
      .filter((t) => t?.[metricKey] != null)
      .sort((a, b) => Number(b[metricKey]) - Number(a[metricKey]));
  }, [teams, metricKey]);

  const barData = useMemo(
    () => ({
      labels: barSorted.map((t) => t.name),
      datasets: [
        {
          label: metricMeta.label,
          data: barSorted.map((t) => Number(t[metricKey])),
          backgroundColor: "rgba(6, 68, 179, 0.75)",
          borderRadius: 4,
        },
      ],
    }),
    [barSorted, metricKey, metricMeta.label]
  );

  const barOptions = useMemo(
    () => ({
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: tooltipBackground,
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          callbacks: {
            label(context) {
              const value = Number(context.raw).toFixed(metricMeta.decimals);
              return `${value}${metricMeta.suffix || ""}`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color, font: { size: 9 } },
          grid: { color: gridColor, drawTicks: false },
          border: { display: false },
          beginAtZero: true,
        },
        y: {
          ticks: { color, font: { size: 9 } },
          grid: { display: false },
          border: { display: false },
        },
      },
    }),
    [color, gridColor, tooltipBackground, metricMeta]
  );

  const radarData = useMemo(() => {
    const selected = selectedTeams
      .map((name) => plottableByName.get(name))
      .filter(Boolean);
    return {
      labels: RADAR_AXES.map((a) => a.label),
      datasets: selected.map((team, index) => {
        const colorHex = team.isLeagueAverage
          ? "#f57701"
          : TEAM_COLORS[index % TEAM_COLORS.length];
        return {
          label: team.name,
          data: RADAR_AXES.map((axis) =>
            Math.max(0, Math.min(1, Number(team[axis.key] || 0) * axis.scale))
          ),
          borderColor: colorHex,
          backgroundColor: `${colorHex}33`,
          pointBackgroundColor: colorHex,
          borderWidth: team.isLeagueAverage ? 2.5 : 2,
          borderDash: team.isLeagueAverage ? [4, 3] : undefined,
        };
      }),
    };
  }, [plottableByName, selectedTeams]);

  const radarOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color, boxWidth: 12, font: { size: 10 } },
        },
        tooltip: {
          backgroundColor: tooltipBackground,
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
        },
      },
      scales: {
        r: {
          min: 0,
          max: 1,
          ticks: {
            display: false,
            backdropColor: "transparent",
          },
          pointLabels: { color, font: { size: 10 } },
          grid: { color: gridColor },
          angleLines: { color: gridColor },
        },
      },
    }),
    [color, gridColor, tooltipBackground]
  );

  function toggleTeam(name) {
    setSelectedTeams((prev) => {
      if (prev.includes(name)) {
        return prev.filter((n) => n !== name);
      }
      if (prev.length >= MAX_RADAR_TEAMS) {
        return [...prev.slice(1), name];
      }
      return [...prev, name];
    });
  }

  if (loading) {
    return (
      <section className="Competition__section">
        <h2 className="Competition__sectionHeading">Team comparison</h2>
        <p className="Competition__comparisonEmpty">Loading team profiles…</p>
      </section>
    );
  }

  if (!teams.length) {
    return (
      <section className="Competition__section">
        <h2 className="Competition__sectionHeading">Team comparison</h2>
        <p className="Competition__comparisonEmpty">
          League comparison profiles are not available yet for this competition.
          They are generated from full league results during the daily fixtures
          run.
        </p>
      </section>
    );
  }

  return (
    <section className="Competition__section Competition__teamComparison">
      <h2 className="Competition__sectionHeading">Team comparison</h2>
      <p className="Competition__comparisonIntro">
        Pick any two metrics to see how each team measures up. Choose to compare
        the whole competition or two individual teams.
      </p>

      <div className="Competition__comparisonGrid">
        <ChartCard
          title="Style map"
          className="Competition__comparisonCard--scatter"
        >
          <div className="Competition__comparisonAxisPickers Competition__comparisonAxisPickers--scatter">
            <MetricPicker
              label="X axis"
              value={scatterXKey}
              options={availableMetrics}
              onChange={setScatterXKey}
            />
            <MetricPicker
              label="Y axis"
              value={scatterYKey}
              options={availableMetrics}
              onChange={setScatterYKey}
            />
          </div>
          <div className="Competition__comparisonAxisPickers Competition__comparisonAxisPickers--scatter">
            <MetricPicker
              label="Team 1"
              value={scatterTeamA}
              options={scatterTeamOptionsA}
              onChange={(next) => {
                setScatterTeamA(next);
                if (!next) setScatterTeamB("");
              }}
            />
            <MetricPicker
              label="Team 2"
              value={scatterTeamB}
              options={scatterTeamOptionsB}
              onChange={setScatterTeamB}
            />
          </div>
          <p className="Competition__comparisonHint Competition__comparisonHint--scatter">
            Leave teams on All / None to plot the full league. Pick one or two
            sides — including league average — to declutter.
          </p>
          <ShareableVisual
            className="Competition__shareable"
            filename={sanitizeImageFilename(
              `style-map-${scatterXMeta.label}-vs-${scatterYMeta.label}`
            )}
            shareTitle={`Style map: ${scatterXMeta.label} vs ${scatterYMeta.label}`}
          >
            <div
              data-share-capture
              className="Competition__shareCapture"
            >
              <p className="Competition__shareCaptureTitle">
                Style map
                <span className="Competition__shareCaptureSub">
                  {scatterXMeta.label} vs {scatterYMeta.label}
                  {plottedTeams.length < teams.length
                    ? ` · ${plottedTeams.map((t) => t.name).join(" vs ")}`
                    : " · Full league"}
                </span>
              </p>
              <div className="Competition__comparisonScatterWrap">
                <Scatter
                  data={scatterData}
                  options={scatterOptions}
                  plugins={[scatterLabelPlugin]}
                />
              </div>
            </div>
          </ShareableVisual>
        </ChartCard>

        <ChartCard
          title="Metric rankings"
          className="Competition__comparisonCard--metrics"
          actions={
            <MetricPicker
              label="Metric"
              value={metricKey}
              options={availableMetrics}
              onChange={setMetricKey}
            />
          }
        >
          <ShareableVisual
            className="Competition__shareable"
            filename={sanitizeImageFilename(
              `metric-rankings-${metricMeta.label}`
            )}
            shareTitle={`Metric rankings: ${metricMeta.label}`}
          >
            <div data-share-capture className="Competition__shareCapture">
              <p className="Competition__shareCaptureTitle">
                Metric rankings
                <span className="Competition__shareCaptureSub">
                  {metricMeta.label}
                </span>
              </p>
              <div className="Competition__comparisonBarWrap">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
          </ShareableVisual>
        </ChartCard>
      </div>

      <ChartCard
        title="Compare teams"
        className="Competition__comparisonCard--radar"
      >
        <div className="Competition__comparisonTeamPicker">
          {leagueAverage ? (
            <button
              type="button"
              className={`Competition__comparisonTeamChip Competition__comparisonTeamChip--average${
                selectedTeams.includes(LEAGUE_AVERAGE_NAME)
                  ? " Competition__comparisonTeamChip--active"
                  : ""
              }`}
              onClick={() => toggleTeam(LEAGUE_AVERAGE_NAME)}
              aria-pressed={selectedTeams.includes(LEAGUE_AVERAGE_NAME)}
            >
              {LEAGUE_AVERAGE_NAME}
            </button>
          ) : null}
          {teams.map((team) => {
            const active = selectedTeams.includes(team.name);
            return (
              <button
                key={team.name}
                type="button"
                className={`Competition__comparisonTeamChip${
                  active ? " Competition__comparisonTeamChip--active" : ""
                }`}
                onClick={() => toggleTeam(team.name)}
                aria-pressed={active}
              >
                {team.name}
              </button>
            );
          })}
        </div>
        <p className="Competition__comparisonHint">
          Select up to {MAX_RADAR_TEAMS} sides for the radar overlay, including
          the league average.
        </p>
        {selectedTeams.length > 0 ? (
          <ShareableVisual
            className="Competition__shareable"
            filename={sanitizeImageFilename(
              `team-radar-${selectedTeams.join("-vs-")}`
            )}
            shareTitle={`Team comparison: ${selectedTeams.join(" vs ")}`}
          >
            <div data-share-capture className="Competition__shareCapture">
              <p className="Competition__shareCaptureTitle">
                Compare teams
                <span className="Competition__shareCaptureSub">
                  {selectedTeams.join(" · ")}
                </span>
              </p>
              <div className="Competition__comparisonRadarWrap">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
          </ShareableVisual>
        ) : (
          <p className="Competition__comparisonEmpty">
            Select teams above to compare profiles.
          </p>
        )}
      </ChartCard>
    </section>
  );
}

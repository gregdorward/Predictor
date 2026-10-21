import { useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import "./chartSetup";
import {
  useChartTheme,
  getChartColors,
  tooltipStyle,
  withAlpha,
} from "./chartTheme";
import {
  areaGradient,
  directLabelsPlugin,
  measureDirectLabelPad,
} from "./chartPlugins";
import { progressiveLine } from "./chartMotion";
import LazyChart from "./LazyChart";
import ShareableVisual from "../ShareableVisual";
import { sanitizeImageFilename } from "../../utils/captureElementImage";
import { uniqueTeamAbbreviations } from "../../utils/competitionTeamLabels";

const ASPECT_RATIO = 1.35;
const ROLLING_LABELS = ["Last 10", "Last 6", "Last 5"];

function finiteSeries(values) {
  return (values || []).map((value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  });
}

function formatSigned(value, decimals = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  const text = Math.abs(n).toFixed(decimals);
  if (Number(text) === 0) return "0";
  return `${n > 0 ? "+" : "−"}${text}`;
}

function paceLine(ppg, count, colors) {
  return {
    type: "line",
    xMin: 0,
    xMax: count - 1,
    yMin: ppg,
    yMax: ppg * count,
    borderColor: colors.reference,
    borderWidth: 1,
    borderDash: [3, 4],
    label: {
      display: true,
      content: `${ppg} PPG pace`,
      position: "end",
      backgroundColor: withAlpha(colors.surface, 0.85),
      borderRadius: 4,
      color: colors.faint,
      font: { size: 10, weight: 600 },
      padding: { x: 4, y: 2 },
      yAdjust: -9,
      xAdjust: -4,
      drawTime: "afterDatasetsDraw",
    },
    drawTime: "beforeDatasetsDraw",
  };
}

/**
 * Two-team form line. Variants:
 * - "points": cumulative points with 1 and 2 PPG pace lines
 * - "rolling": points per game over the last 10 / 6 / 5
 * - "difference": cumulative goal (or xG) difference around a zero line
 */
export default function FormLineChart({
  variant = "points",
  title,
  subtitle,
  team1,
  team2,
  series1,
  series2,
  xgSeries1,
  xgSeries2,
  tension = 0,
}) {
  const theme = useChartTheme();
  const colors = getChartColors(theme);
  const hasXg =
    variant === "difference" &&
    (xgSeries1?.length > 0 || xgSeries2?.length > 0);
  const [measure, setMeasure] = useState("goals");
  const showXg = hasXg && measure === "xg";

  const home = finiteSeries(showXg ? xgSeries1 : series1);
  const away = finiteSeries(showXg ? xgSeries2 : series2);
  const count = Math.max(home.length, away.length);

  const abbreviations = useMemo(
    () => uniqueTeamAbbreviations([team1, team2]),
    [team1, team2]
  );
  const abbr1 = abbreviations.get(team1) || team1;
  const abbr2 = abbreviations.get(team2) || team2;

  if (!count) return null;

  const labels =
    variant === "rolling"
      ? ROLLING_LABELS.slice(0, count)
      : Array.from({ length: count }, (_, i) => String(i + 1));

  const decimals = variant === "rolling" || showXg ? 1 : 0;
  const formatTip = (value) =>
    variant === "difference"
      ? formatSigned(value, decimals)
      : Number(value).toFixed(decimals);

  const tipTexts = [
    `${abbr1} ${formatTip(home.at(-1) ?? 0)}`,
    `${abbr2} ${formatTip(away.at(-1) ?? 0)}`,
  ];
  const rightPad = measureDirectLabelPad(tipTexts, 11);

  const all = [...home, ...away].filter((v) => v != null);
  const dataMax = all.length ? Math.max(...all) : 1;
  const dataMin = all.length ? Math.min(...all) : 0;

  let yScale;
  const annotations = {};
  if (variant === "points") {
    yScale = { min: 0, suggestedMax: Math.ceil(Math.max(dataMax, 2 * count) + 1) };
    if (count > 1) {
      annotations.pace1 = paceLine(1, count, colors);
      annotations.pace2 = paceLine(2, count, colors);
    }
  } else if (variant === "rolling") {
    yScale = { min: 0, max: 3 };
  } else {
    const span = Math.max(2, Math.ceil(Math.max(Math.abs(dataMax), Math.abs(dataMin)) + 1));
    yScale = { min: -span, max: span };
    annotations.zero = {
      type: "line",
      yMin: 0,
      yMax: 0,
      borderColor: colors.reference,
      borderWidth: 1,
      label: {
        display: true,
        content: "Level",
        position: "start",
        backgroundColor: withAlpha(colors.surface, 0.85),
        borderRadius: 4,
        color: colors.faint,
        font: { size: 10, weight: 600 },
        padding: { x: 4, y: 2 },
        xAdjust: 14,
        yAdjust: -10,
        drawTime: "afterDatasetsDraw",
      },
      drawTime: "beforeDatasetsDraw",
    };
  }

  const datasetFor = (label, data, color, dashed, tipLabel) => ({
    label,
    data,
    borderColor: color,
    backgroundColor:
      variant === "difference"
        ? withAlpha(color, 0.1)
        : areaGradient(color, { top: 0.22, bottom: 0 }),
    fill: "origin",
    borderWidth: 2.5,
    borderDash: dashed ? [7, 4] : [],
    tension,
    pointRadius: 0,
    pointHoverRadius: 5,
    pointHitRadius: 10,
    pointBackgroundColor: color,
    pointBorderColor: colors.surface,
    pointBorderWidth: 2,
    spanGaps: true,
    directLabelText: tipLabel,
  });

  const data = {
    labels,
    datasets: [
      datasetFor(team1, home, colors.home, false, abbr1),
      datasetFor(team2, away, colors.away, true, abbr2),
    ],
  };

  const measureLabel = showXg ? "xG difference" : "goal difference";

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: ASPECT_RATIO,
    color: colors.color,
    ...progressiveLine({ points: count }),
    interaction: { mode: "index", intersect: false },
    layout: { padding: { top: 8, right: rightPad, left: 2, bottom: 0 } },
    plugins: {
      legend: { display: false },
      title: { display: false },
      directLabels: {
        format: (value, dataset) => `${dataset.directLabelText} ${formatTip(value)}`,
      },
      annotation: { annotations },
      tooltip: {
        ...tooltipStyle(colors),
        callbacks: {
          title(items) {
            const label = items[0]?.label ?? "";
            return variant === "rolling" ? label : `After game ${label}`;
          },
          label(context) {
            const value = context.raw;
            if (value == null) return `${context.dataset.label}: no data`;
            if (variant === "points") return `${context.dataset.label}: ${value} pts`;
            if (variant === "rolling") {
              return `${context.dataset.label}: ${Number(value).toFixed(2)} PPG`;
            }
            return `${context.dataset.label}: ${formatSigned(value, showXg ? 2 : 0)} ${measureLabel}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { color: colors.gridColor },
        title: {
          display: variant !== "rolling",
          text: "Games played",
          color: colors.faint,
          font: { size: 10, weight: 600 },
          padding: { top: 2 },
        },
        ticks: {
          color: colors.faint,
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
          font: { size: 10 },
        },
      },
      y: {
        ...yScale,
        grid: { color: colors.gridColor, drawTicks: false },
        border: { display: false },
        ticks: {
          color: colors.faint,
          padding: 6,
          font: { size: 10 },
          callback:
            variant === "difference"
              ? (value) => formatSigned(value, 0)
              : undefined,
        },
      },
    },
  };

  const resolvedSubtitle =
    subtitle ||
    (variant === "points"
      ? "Cumulative points. Dashed guides show 1 and 2 points-per-game pace."
      : variant === "rolling"
        ? "Points per game across the last 10, 6 and 5 matches"
        : `Running ${measureLabel}. Above the line means more scored than conceded.`);

  const shareTitle = `${team1} vs ${team2} - ${title}`;

  return (
    <ShareableVisual
      filename={sanitizeImageFilename(shareTitle)}
      shareTitle={shareTitle}
      className="ComparisonBarChart-share"
    >
      <div data-share-capture className="ComparisonBarChart ChartPanel">
        <div className="ChartPanel-header">
          <div>
            <p className="ChartPanel-title">{title}</p>
            <p className="ChartPanel-subtitle">{resolvedSubtitle}</p>
          </div>
          {hasXg ? (
            <div className="ChartPanel-toggle" role="group" aria-label="Measure">
              {[
                { id: "goals", label: "Goals" },
                { id: "xg", label: "xG" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`ChartPanel-toggleButton${measure === option.id ? " is-active" : ""}`}
                  aria-pressed={measure === option.id}
                  onClick={() => setMeasure(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <LazyChart aspectRatio={ASPECT_RATIO}>
          <Line
            key={`${theme}-${measure}`}
            data={data}
            options={options}
            plugins={[directLabelsPlugin]}
          />
        </LazyChart>
        <div className="ChartPanel-legend" aria-hidden="true">
          <span className="ChartPanel-legendItem">
            <span className="ChartPanel-legendLine ChartPanel-legendLine--home" />
            {team1}
          </span>
          <span className="ChartPanel-legendItem">
            <span className="ChartPanel-legendLine ChartPanel-legendLine--away" />
            {team2}
          </span>
        </div>
      </div>
    </ShareableVisual>
  );
}

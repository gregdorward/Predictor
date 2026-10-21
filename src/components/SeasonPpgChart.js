import { useMemo } from "react";
import "./charts/chartSetup";
import { Line } from "react-chartjs-2";
import { buildDualSeasonPpgSeries } from "../utils/seasonPpgSeries";
import { useChartTheme, getChartColors, tooltipStyle } from "./charts/chartTheme";
import {
  areaGradient,
  directLabelsPlugin,
  measureDirectLabelPad,
} from "./charts/chartPlugins";
import { progressiveLine } from "./charts/chartMotion";
import LazyChart from "./charts/LazyChart";
import { uniqueTeamAbbreviations } from "../utils/competitionTeamLabels";

function formBand(colors, yMin, yMax, text) {
  return {
    type: "box",
    yMin,
    yMax,
    backgroundColor: colors.band,
    borderWidth: 0,
    drawTime: "beforeDatasetsDraw",
    label: {
      display: true,
      content: text,
      position: { x: "start", y: "start" },
      color: colors.faint,
      font: { size: 10, weight: 600 },
      padding: { x: 6, y: 4 },
    },
  };
}

function lastFinite(values) {
  for (let i = values.length - 1; i >= 0; i -= 1) {
    if (Number.isFinite(values[i])) return values[i];
  }
  return null;
}

// layout.padding.right keeps the end labels on the canvas, but Chart.js also
// insets the title box by that padding, so the heading sits left of centre.
const centerCanvasHeadings = {
  id: "centerCanvasHeadings",
  afterLayout(chart) {
    const width = chart.width;
    for (const box of chart.boxes || []) {
      if (typeof box?.options?.text !== "string" || !box.isHorizontal?.()) continue;
      box.left = 0;
      box.right = width;
      box.width = width;
    }
  },
};

/**
 * Combined season form curve: rolling 5-game PPG for both teams.
 */
export default function SeasonPpgChart({
  homeTeam,
  awayTeam,
  homeResults,
  awayResults,
}) {
  const theme = useChartTheme();
  const colors = getChartColors(theme);
  const { labels, homeRollingPpg, awayRollingPpg } = buildDualSeasonPpgSeries(
    homeResults,
    awayResults
  );
  const abbreviations = useMemo(
    () => uniqueTeamAbbreviations([homeTeam, awayTeam]),
    [homeTeam, awayTeam]
  );

  if (!labels.length) return null;

  const { color, gridColor } = colors;
  const abbrHome = abbreviations.get(homeTeam) || homeTeam;
  const abbrAway = abbreviations.get(awayTeam) || awayTeam;
  const formatTip = (value, dataset) =>
    `${dataset.directLabelText} ${Number(value).toFixed(1)}`;
  const rightPad = measureDirectLabelPad(
    [
      `${abbrHome} ${Number(lastFinite(homeRollingPpg) ?? 0).toFixed(1)}`,
      `${abbrAway} ${Number(lastFinite(awayRollingPpg) ?? 0).toFixed(1)}`,
    ],
    11
  );

  const maxTicks = labels.length > 20 ? 10 : labels.length > 12 ? 8 : undefined;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    ...progressiveLine({ points: labels.length, duration: 1100 }),
    interaction: { mode: "index", intersect: false },
    layout: { padding: { right: rightPad, top: 4 } },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color,
          boxHeight: 3,
          boxWidth: 22,
          padding: 12,
          font: { size: 11, weight: 600 },
        },
      },
      title: {
        display: true,
        text: "Season form curve",
        color,
        font: {
          size: 13,
          weight: 600,
        },
        padding: {
          bottom: 4,
        },
      },
      subtitle: {
        display: true,
        text: "Rolling 5-game points per game by gameweek",
        color,
        font: {
          size: 12,
          weight: 400,
        },
        padding: {
          bottom: 12,
        },
      },
      directLabels: { format: formatTip },
      annotation: {
        annotations: {
          titleForm: formBand(colors, 2, 3, "Title form (2.0+)"),
          struggling: formBand(colors, 0, 1, "Struggling (below 1.0)"),
        },
      },
      tooltip: {
        ...tooltipStyle(colors),
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex;
            return labels[idx] ? `Gameweek ${labels[idx]}` : "";
          },
          label: (context) =>
            context.raw == null
              ? `${context.dataset.label}: no game`
              : `${context.dataset.label}: ${Number(context.raw).toFixed(2)} PPG`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: colors.faint,
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: maxTicks,
          font: { size: 10 },
        },
        grid: { color: gridColor, display: false },
        border: { color: gridColor },
      },
      y: {
        min: 0,
        max: 3,
        ticks: { color: colors.faint, stepSize: 0.5, font: { size: 10 }, padding: 6 },
        grid: { color: gridColor, drawTicks: false },
        border: { display: false },
      },
    },
  };

  const lineStyle = (lineColor, dashed, tipText) => ({
    borderColor: lineColor,
    backgroundColor: areaGradient(lineColor, { top: 0.16, bottom: 0 }),
    fill: "origin",
    borderWidth: 2.5,
    borderDash: dashed ? [7, 4] : [],
    pointRadius: 0,
    pointHoverRadius: 5,
    pointHoverBackgroundColor: lineColor,
    pointHoverBorderColor: colors.surface,
    pointHoverBorderWidth: 2,
    pointHitRadius: 8,
    tension: 0.35,
    spanGaps: false,
    directLabelText: tipText,
  });

  const data = {
    labels,
    datasets: [
      {
        label: homeTeam,
        data: homeRollingPpg,
        ...lineStyle(colors.home, false, abbrHome),
      },
      {
        label: awayTeam,
        data: awayRollingPpg,
        ...lineStyle(colors.away, true, abbrAway),
      },
    ],
  };

  return (
    <div className="SeasonPpgChart">
      <LazyChart fill>
        <Line
          key={theme}
          options={options}
          data={data}
          plugins={[directLabelsPlugin, centerCanvasHeadings]}
        />
      </LazyChart>
    </div>
  );
}

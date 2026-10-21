import "./charts/chartSetup";
import { Line, Radar, Bar } from "react-chartjs-2";
import ShareableVisual from "./ShareableVisual";
import { sanitizeImageFilename } from "../utils/captureElementImage";
import { buildShotStackSeries } from "../utils/shotStackSeries";
import PremiumBlurGate from "./PremiumBlurGate";
import {
  useChartTheme,
  getChartColors,
  tooltipStyle,
  withAlpha,
} from "./charts/chartTheme";
import { areaGradient, focusDatasetOnHover } from "./charts/chartPlugins";
import { growFromZero, radialReveal, staggeredBars } from "./charts/chartMotion";
import LazyChart from "./charts/LazyChart";

const COMPARISON_CHART_FONTS = {
  title: { size: 13, weight: 600 },
  subtitle: { size: 11, weight: 400 },
  axisTick: { size: 10, weight: 600 },
  legend: { size: 11, weight: 600 },
  deltaLabel: "600 11px 'Open Sans', system-ui, sans-serif",
};

const RADAR_LABEL_ABBREVIATIONS = {
  Attack: "Atk",
  Defence: "Def",
  Possession: "Possession",
  Directness: "Directness",
  Precision: "Precision",
  "Attack rating": "Atk",
  "Defence rating": "Def",
  "Ball retention": "Possession",
  "XG For": "XGF",
  "XG Against": "XGA",
  "Attacking precision": "Precision",
  "Dangerous attacks": "D. Attacks",
  "Shots on target": "SOT",
  "Big chances": "B. Chances",
  "Shooting accuracy": "Acc",
  "Shot conversion": "Conv",
  "Shots inside box %": "Shot prox",
  "Shot Proximity": "Shot prox",
  "Goals conceded": "GA",
  "xG conceded": "xGA",
  "SOT against": "SOTA",
  "Clean sheet %": "CS %",
  "Big chances conceded": "B. Chances A",
  "Shots inside box against": "Box shots agst",
  "Pass accuracy": "Pass %",
  "Attacking-half pass %": "Attk pass %",
  "Successful dribbles": "Dribbles",
  "Long-ball %": "LB %",
  "Ball recoveries": "Recoveries",
  "Duels won %": "Duels %",
  "Venue PPG": "H/A PPG",
  "Free-kick goals": "FK goals",
  "Fouls per game": "Fouls",
  "Fouls faced": "Fouls won",
  "Yellow cards / game": "Yellow C",
  "Red cards / game": "Red C",
  "Penalties for": "Pens F",
  "Penalties conceded": "Pens A",
  "Offsides per game": "Offsides",
  "Possession rating": "Poss",
  "XGF rating": "XGF",
  "XGA rating": "XGA",
};

export function RadarChart(props) {
  const {
    title,
    labels,
    data,
    data2,
    team1,
    team2,
    max = 1,
    shareCapture = false,
    locked = false,
    subtitle = "Higher values indicate stronger ratings",
    rawTooltipLabels,
    maintainAspectRatio = true,
    aspectRatio = 1,
    abbreviateLabels = true,
    abbreviateLongLabelsOnly = false,
    abbreviateMaxLength = 10,
    wrapPointLabels = false,
    wrapLabelMaxLength = 11,
    pointLabelFontSize = 9,
    pointLabelPadding = 4,
    layoutPadding = 4,
  } = props;
  const theme = useChartTheme();
  const colors = getChartColors(theme);
  const { color, gridColor } = colors;

  const homeColor = colors.home;
  const homeFill = withAlpha(colors.home, 0.2);
  const awayColor = colors.away;
  const awayFill = withAlpha(colors.away, 0.2);
  const pointBorder = colors.surface;

  const abbreviateRadarLabel = (label) => {
    if (RADAR_LABEL_ABBREVIATIONS[label]) {
      return RADAR_LABEL_ABBREVIATIONS[label];
    }

    if (abbreviateLongLabelsOnly && label.length <= abbreviateMaxLength) {
      return label;
    }

    const words = label.trim().split(/\s+/);
    if (words.length > 1) {
      return words.map((word) => word[0]?.toUpperCase() ?? "").join("");
    }

    if (abbreviateLongLabelsOnly) {
      return label;
    }

    return label.length > 5 ? label.slice(0, 4) : label;
  };

  /** Split long labels onto 2 lines so Chart.js keeps the radar centered. */
  const wrapRadarLabel = (label, maxLineLength = 11) => {
    const text = String(label || "").trim();
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= 1 || text.length <= maxLineLength) {
      return text;
    }
    if (words.length === 2) {
      return words;
    }
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  };

  let displayLabels = abbreviateLabels
    ? labels.map(abbreviateRadarLabel)
    : labels;
  if (wrapPointLabels) {
    displayLabels = displayLabels.map((label) =>
      wrapRadarLabel(label, wrapLabelMaxLength)
    );
  }

  const options = {
    color,
    responsive: true,
    maintainAspectRatio,
    aspectRatio,
    layout: {
      padding: layoutPadding,
    },
    ...radialReveal(),
    onHover: focusDatasetOnHover([
      { border: homeColor, fill: homeFill },
      { border: awayColor, fill: awayFill },
    ]),
    interaction: { mode: "nearest", intersect: false },
    scales: {
      r: {
        min: 0,
        max,
        ticks: {
          stepSize: 0.25,
          display: false,
          backdropColor: "transparent",
        },
        grid: {
          circular: true,
          color: gridColor,
          lineWidth: 1,
        },
        angleLines: {
          color: gridColor,
          lineWidth: 1,
        },
        pointLabels: {
          color,
          font: {
            size: pointLabelFontSize,
            weight: 600,
          },
          padding: pointLabelPadding,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          useBorderRadius: true,
          borderRadius: 3,
          color,
          font: COMPARISON_CHART_FONTS.legend,
          padding: 12,
        },
      },
      tooltip: {
        enabled: true,
        ...tooltipStyle(colors),
        callbacks: {
          title(items) {
            const index = items[0]?.dataIndex;
            return labels[index] ?? items[0]?.label ?? "";
          },
          label(context) {
            const index = context.dataIndex;
            const rawPair = Array.isArray(rawTooltipLabels)
              ? rawTooltipLabels[index]
              : null;
            if (rawPair) {
              const raw =
                context.datasetIndex === 0 ? rawPair.home : rawPair.away;
              return `${context.dataset.label}: ${raw}`;
            }
            return `${context.dataset.label}: ${Number(context.raw).toFixed(2)}`;
          },
        },
      },
      title: {
        display: true,
        text: title,
        color,
        font: COMPARISON_CHART_FONTS.title,
        padding: {
          bottom: 4,
        },
      },
      subtitle: {
        display: Boolean(subtitle),
        text: subtitle || "",
        color,
        font: COMPARISON_CHART_FONTS.subtitle,
        padding: {
          bottom: 12,
        },
      },
    },
  };

  const datasetStyle = (lineColor, fillColor) => ({
    fill: true,
    backgroundColor: fillColor,
    borderColor: lineColor,
    pointBackgroundColor: lineColor,
    pointBorderColor: pointBorder,
    pointHoverBackgroundColor: lineColor,
    pointHoverBorderColor: color,
    pointRadius: 4,
    pointHoverRadius: 6,
    borderWidth: 2.5,
  });

  const chartData = {
    labels: displayLabels,
    datasets: [
      { label: team1, data, ...datasetStyle(homeColor, homeFill) },
      { label: team2, data: data2, ...datasetStyle(awayColor, awayFill) },
    ],
  };

  return (
    <PremiumBlurGate locked={locked}>
      <div
        className={`ComparisonBarChart ComparisonRadarChart${locked ? " blurred" : ""}`}
        {...(shareCapture && !locked ? { "data-share-capture": true } : {})}
      >
        <LazyChart
          fill={!maintainAspectRatio}
          aspectRatio={maintainAspectRatio ? aspectRatio : undefined}
        >
          <Radar
            key={`${theme}-${abbreviateLabels}-${wrapPointLabels}-${pointLabelFontSize}-${JSON.stringify(layoutPadding)}`}
            options={options}
            data={chartData}
          />
        </LazyChart>
      </div>
    </PremiumBlurGate>
  );
}

function buildLinearTrendLine(values = []) {
  const n = values.length;
  if (n === 0) return [];
  if (n === 1) return [values[0]];

  const xs = values.map((_, index) => index);
  const sumX = xs.reduce((total, x) => total + x, 0);
  const sumY = values.reduce((total, value) => total + value, 0);
  const sumXY = xs.reduce((total, x, index) => total + x * values[index], 0);
  const sumXX = xs.reduce((total, x) => total + x * x, 0);
  const denominator = n * sumXX - sumX * sumX;

  if (denominator === 0) {
    const average = sumY / n;
    return values.map(() => average);
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return xs.map((x) => Number((slope * x + intercept).toFixed(2)));
}

const SHOT_SERIES_COLORS = {
  goals: "#01a501",
  sot: "#f57701",
  shots: "#4a90d9",
};

function ShotAreaChart({ teamName, series = [], theme, showSubtitle = true }) {
  const colors = getChartColors(theme);
  const { color, gridColor } = colors;

  if (!series.length) {
    return null;
  }

  const labels = series.map((point) => point.label);
  const goalsColor = colors.home;
  const sotColor = SHOT_SERIES_COLORS.sot;
  const shotsColor = SHOT_SERIES_COLORS.shots;
  const goalsTrend = buildLinearTrendLine(series.map((point) => point.goals));
  const sotTrend = buildLinearTrendLine(series.map((point) => point.sot));
  const shotsTrend = buildLinearTrendLine(series.map((point) => point.shots));

  const trendLineStyle = (lineColor) => ({
    type: "line",
    backgroundColor: "transparent",
    borderColor: withAlpha(lineColor, 0.55),
    borderWidth: 1.5,
    borderDash: [5, 4],
    pointRadius: 0,
    pointHoverRadius: 0,
    fill: false,
    tension: 0,
    order: 0,
  });

  const areaStyle = (fillColor, topAlpha, bottomAlpha) => ({
    borderColor: fillColor,
    backgroundColor: areaGradient(fillColor, { top: topAlpha, bottom: bottomAlpha }),
    fill: true,
    tension: 0.3,
    pointRadius: 0,
    pointHoverRadius: 4,
    pointHoverBackgroundColor: fillColor,
    pointHoverBorderColor: colors.surface,
    pointHoverBorderWidth: 2,
    borderWidth: 1.75,
    stack: "shots",
    order: 2,
  });

  const options = {
    color,
    responsive: true,
    maintainAspectRatio: false,
    ...staggeredBars({ step: 0, duration: 700 }),
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          font: COMPARISON_CHART_FONTS.axisTick,
          color: colors.faint,
        },
        border: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: gridColor,
          drawTicks: false,
        },
        ticks: {
          font: COMPARISON_CHART_FONTS.axisTick,
          color: colors.faint,
          precision: 0,
          padding: 6,
        },
        border: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          useBorderRadius: true,
          borderRadius: 2,
          font: COMPARISON_CHART_FONTS.legend,
          color,
          filter(item) {
            return !String(item.text).toLowerCase().includes("trend");
          },
        },
      },
      tooltip: {
        enabled: true,
        ...tooltipStyle(colors),
        filter(item) {
          return !String(item.dataset.label).toLowerCase().includes("trend");
        },
        callbacks: {
          title(items) {
            return items[0]?.label ?? "";
          },
          label(context) {
            const point = series[context.dataIndex];
            if (!point) return "";

            if (context.dataset.label === "Goals") {
              return `Goals: ${point.goals}`;
            }
            if (context.dataset.label === "Shots on target") {
              return `Shots on target: ${point.sot}`;
            }
            return `Shots: ${point.shots}`;
          },
        },
      },
      title: {
        display: true,
        text: teamName,
        color,
        font: COMPARISON_CHART_FONTS.title,
        padding: {
          bottom: 4,
        },
      },
      subtitle: {
        display: showSubtitle,
        text: "Goals, shots on target and shots per game",
        color,
        font: COMPARISON_CHART_FONTS.subtitle,
        padding: {
          bottom: 12,
        },
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: "Goals",
        data: series.map((point) => point.stackGoals),
        ...areaStyle(goalsColor, 0.9, 0.6),
      },
      {
        label: "Shots on target",
        data: series.map((point) => point.stackSot),
        ...areaStyle(sotColor, 0.75, 0.45),
      },
      {
        label: "Shots",
        data: series.map((point) => point.stackShotsOffTarget),
        ...areaStyle(shotsColor, 0.55, 0.25),
      },
      {
        ...trendLineStyle(color),
        label: "Goals trend",
        data: goalsTrend,
        stack: "goalsTrend",
      },
      {
        ...trendLineStyle(color),
        label: "Shots on target trend",
        data: sotTrend,
        stack: "sotTrend",
      },
      {
        ...trendLineStyle(color),
        label: "Shots trend",
        data: shotsTrend,
        stack: "shotsTrend",
      },
    ],
  };

  return (
    <div className="ComparisonBarChart-areaChart">
      <LazyChart fill>
        <Line key={theme} options={options} data={data} />
      </LazyChart>
    </div>
  );
}

export function ShotAreaChartsShare({
  team1,
  team2,
  shotSeries,
  text = "All Competition Games - Shots over time",
}) {
  const theme = useChartTheme();
  const hasHome = shotSeries?.home?.length;
  const hasAway = shotSeries?.away?.length;

  if (!hasHome && !hasAway) {
    return null;
  }

  const shareFilename = sanitizeImageFilename(`${team1}-vs-${team2}-shots`);
  const shareTitle = `${team1} vs ${team2} - ${text}`;

  return (
    <ShareableVisual
      filename={shareFilename}
      shareTitle={shareTitle}
      className="ShotAreaCharts-share"
    >
      <div data-share-capture className="ComparisonBarChart ShotAreaCharts">
        <div className="ShotAreaCharts-header">
          <p className="ShotAreaCharts-title">{text}</p>
          <p className="ShotAreaCharts-subtitle">
            Stacked per-game goals, shots on target and shots. Dashed lines show each trend.
          </p>
        </div>
        <div className="ComparisonBarChart-areaCharts">
          {hasHome ? (
            <ShotAreaChart
              teamName={team1}
              series={shotSeries.home}
              theme={theme}
              showSubtitle={false}
            />
          ) : null}
          {hasAway ? (
            <ShotAreaChart
              teamName={team2}
              series={shotSeries.away}
              theme={theme}
              showSubtitle={false}
            />
          ) : null}
        </div>
      </div>
    </ShareableVisual>
  );
}

function leadSummary(values, team1, team2) {
  const homeLeads = values.filter((v) => v < 0).length;
  const awayLeads = values.filter((v) => v > 0).length;
  const level = values.length - homeLeads - awayLeads;
  const total = values.length;
  if (homeLeads === awayLeads) {
    return `Honours even: ${homeLeads} metrics each${level ? `, ${level} level` : ""}`;
  }
  const [leader, leaderCount, trailer, trailerCount] =
    homeLeads > awayLeads
      ? [team1, homeLeads, team2, awayLeads]
      : [team2, awayLeads, team1, homeLeads];
  return `${leader} lead ${leaderCount} of ${total} metrics. ${trailer} lead ${trailerCount}${
    level ? `, ${level} level` : ""
  }.`;
}

export function BarChart(props) {
  const {
    data1,
    data2,
    displayDeltas,
    team1 = "Home",
    team2 = "Away",
    locked = false,
  } = props;
  const theme = useChartTheme();
  const colors = getChartColors(theme);
  const { color, gridColor } = colors;

  const homeColor = colors.home;
  const homeColorSoft = withAlpha(colors.home, 0.4);
  const awayColor = colors.away;
  const awayColorSoft = withAlpha(colors.away, 0.4);

  if (!data1 || !data2 || data1.length === 0 || data2.length === 0) {
    return <div style={{ color: color, textAlign: "center" }}>No data available for this chart.</div>;
  }

  const sum = data2.map(function (num, idx) {
    const val1 = data1[idx] ?? 0;
    const val2 = num ?? 0;
    return Number(val2) - Number(val1);
  }).filter(value => !isNaN(value));

  if (sum.length === 0) {
    return <div style={{ color: color, textAlign: "center" }}>Invalid numeric data available for this chart.</div>;
  }

  const max = Math.max(...sum);
  const min = Math.min(...sum);
  const largest = Math.max(Math.abs(max), Math.abs(min)) + 1;

  const getBarFillColor = (value) => (value < 0 ? homeColor : awayColor);

  const getBarGradient = (ctx, bar, value) => {
    const x0 = bar.base;
    const y0 = bar.y;
    const x1 = bar.x;
    const y1 = bar.y;

    if (![x0, y0, x1, y1].every(Number.isFinite) || x0 === x1) {
      return getBarFillColor(value);
    }

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    if (value < 0) {
      gradient.addColorStop(0, homeColorSoft);
      gradient.addColorStop(1, homeColor);
    } else {
      gradient.addColorStop(0, awayColorSoft);
      gradient.addColorStop(1, awayColor);
    }
    return gradient;
  };

  function formatComparisonDelta(value) {
    const absLabel = Math.abs(Number(value));
    if (!Number.isFinite(absLabel)) return null;
    const fixed = absLabel.toFixed(2);
    const display =
      fixed.endsWith(".00") ? String(Math.round(absLabel)) : fixed;
    return `+${display}`;
  }

  const barDeltaLabelPlugin = {
    id: "barDeltaLabelPlugin",
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const dataset = chart.data.datasets[0];
      const meta = chart.getDatasetMeta(0);

      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        if (!value || !Number.isFinite(bar.x) || !Number.isFinite(bar.y)) return;

        const labelValue =
          displayDeltas && displayDeltas[index] !== undefined
            ? displayDeltas[index]
            : value;
        const label = formatComparisonDelta(labelValue);
        if (!label) return;
        ctx.save();
        ctx.fillStyle = getBarFillColor(value);
        ctx.font = COMPARISON_CHART_FONTS.deltaLabel;
        ctx.textAlign = value < 0 ? "right" : "left";
        ctx.textBaseline = "middle";

        const padding = 8;
        const x = value < 0 ? bar.x - padding : bar.x + padding;
        ctx.fillText(label, x, bar.y);
        ctx.restore();
      });
    },
  };

  const options = {
    color: color,
    indexAxis: "y",
    aspectRatio: 1.2,
    layout: {
      padding: {
        top: 16,
        right: 16,
        bottom: 16,
        left: 16,
      },
    },
    ...growFromZero(),
    elements: {
      bar: {
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      },
    },
    scales: {
      x: {
        min: -largest,
        max: largest,
        grid: {
          display: true,
          color: gridColor,
          drawTicks: false,
        },
        ticks: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        afterFit(scale) {
          scale.width = Math.min(scale.width, 100);
        },
        ticks: {
          font: COMPARISON_CHART_FONTS.axisTick,
          color: color,
          padding: 2,
          autoSkip: false,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        ...tooltipStyle(colors),
        displayColors: false,
        callbacks: {
          title(items) {
            return items[0]?.label ?? "";
          },
          label(context) {
            const index = context.dataIndex;
            const delta =
              displayDeltas && displayDeltas[index] !== undefined
                ? Number(displayDeltas[index])
                : Number(context.raw);
            if (!Number.isFinite(delta) || delta === 0) return "Even";
            const leader = delta < 0 ? team1 : team2;
            const formatted = formatComparisonDelta(delta);
            return formatted ? `${leader} ${formatted}` : "Even";
          },
        },
      },
      title: {
        display: true,
        text: props.text,
        color: color,
        font: COMPARISON_CHART_FONTS.title,
        padding: {
          bottom: 4,
        },
      },
      subtitle: {
        display: true,
        text: leadSummary(sum, team1, team2),
        color: color,
        font: COMPARISON_CHART_FONTS.subtitle,
        padding: {
          bottom: 12,
        },
      },
      annotation: {
        annotations: {
          zeroLine: {
            type: "line",
            xMin: 0,
            xMax: 0,
            borderColor: colors.reference,
            borderWidth: 1,
            borderDash: [4, 4],
          },
        },
      },
    },
  };

  const data = {
    labels: props.labels,
    datasets: [
      {
        data: sum,
        barPercentage: 0.72,
        categoryPercentage: 0.82,
        backgroundColor(context) {
          const { chart, dataIndex } = context;
          const value = context.dataset.data[dataIndex];
          const meta = chart.getDatasetMeta(0);
          const bar = meta.data[dataIndex];

          if (!bar) {
            return getBarFillColor(value);
          }

          return getBarGradient(chart.ctx, bar, value);
        },
        hoverBackgroundColor(context) {
          const value = context.dataset.data[context.dataIndex];
          return getBarFillColor(value);
        },
      },
    ],
  };

  const shareFilename = sanitizeImageFilename(
    `${team1}-vs-${team2}-${props.text || "comparison"}`
  );
  const shareTitle = `${team1} vs ${team2} - ${props.text || "comparison"}`;

  return (
    <PremiumBlurGate locked={locked}>
      <ShareableVisual
        filename={shareFilename}
        shareTitle={shareTitle}
        className={`ComparisonBarChart-share${locked ? " ComparisonBarChart-share--locked" : ""}`}
        hideActions={locked}
      >
        <div
          {...(!locked ? { "data-share-capture": true } : {})}
          className={`ComparisonBarChart${locked ? " blurred" : ""}`}
        >
          <LazyChart aspectRatio={1.2}>
            <Bar key={theme} options={options} data={data} plugins={[barDeltaLabelPlugin]} />
          </LazyChart>
          <div className="ComparisonBarChart-legend">
            <span className="ComparisonBarChart-legendItem">
              <span className="ComparisonBarChart-legendSwatch ComparisonBarChart-legendSwatch--home" />
              {team1}
            </span>
            <span className="ComparisonBarChart-legendItem">
              <span className="ComparisonBarChart-legendSwatch ComparisonBarChart-legendSwatch--away" />
              {team2}
            </span>
          </div>
        </div>
      </ShareableVisual>
    </PremiumBlurGate>
  );
}

export { useChartTheme, getChartColors, buildShotStackSeries };

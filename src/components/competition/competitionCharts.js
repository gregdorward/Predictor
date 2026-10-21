import { Bar } from "react-chartjs-2";
import "../charts/chartSetup";
import {
  useChartTheme,
  getChartColors,
  rampColor,
  tooltipStyle,
  withAlpha,
} from "../charts/chartTheme";
import { barValueLabelsPlugin } from "../charts/chartPlugins";
import { staggeredBars } from "../charts/chartMotion";
import LazyChart from "../charts/LazyChart";
import SplitBar from "../charts/SplitBar";

const BAR_PLUGINS = [barValueLabelsPlugin];

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="Competition__chartCard">
      {title ? <h3 className="Competition__chartCardTitle">{title}</h3> : null}
      {subtitle ? (
        <p className="Competition__chartCardSubtitle">{subtitle}</p>
      ) : null}
      <div className="Competition__chartCardBody">{children}</div>
    </div>
  );
}

function ChartSlot({ children }) {
  return <LazyChart className="Competition__chartSlot">{children}</LazyChart>;
}

function formatPercent(value) {
  return `${Math.round(Number(value))}%`;
}

/** Bars shaded on the accent ramp by hit rate; low rates stay legible. */
function rampFills(colors, values) {
  return values.map((value) => rampColor(colors, 0.25 + 0.75 * (value / 100)));
}

function coinFlipLine(colors, valueAxis) {
  return {
    type: "line",
    scaleID: valueAxis,
    value: 50,
    borderColor: colors.reference,
    borderWidth: 1,
    borderDash: [4, 4],
    label: {
      display: true,
      content: "50%",
      position: "end",
      backgroundColor: colors.surface,
      color: colors.faint,
      font: { size: 10, weight: 600 },
      padding: { x: 4, y: 2 },
    },
  };
}

function buildBaseOptions(
  colors,
  indexAxis = "x",
  {
    valueSuffix = "%",
    valueDecimals = 1,
    percentScale = true,
    annotations = {},
    legend = false,
    valueLabelFormat = formatPercent,
    valueLabelColor = null,
  } = {}
) {
  const valueAxis = indexAxis === "y" ? "x" : "y";
  const categoryAxis = indexAxis === "y" ? "y" : "x";

  return {
    color: colors.color,
    indexAxis,
    responsive: true,
    maintainAspectRatio: false,
    ...staggeredBars(),
    layout: {
      padding: indexAxis === "y" ? { right: 36 } : { top: 18 },
    },
    plugins: {
      legend: legend
        ? {
            display: true,
            position: "top",
            align: "end",
            labels: {
              color: colors.color,
              usePointStyle: true,
              pointStyle: "rectRounded",
              boxWidth: 10,
              boxHeight: 10,
              padding: 12,
            },
          }
        : { display: false },
      title: { display: false },
      tooltip: {
        ...tooltipStyle(colors),
        callbacks: {
          label(context) {
            const value = Number(context.raw).toFixed(valueDecimals);
            const name = legend ? context.dataset.label : context.label;
            return valueSuffix ? `${name}: ${value}${valueSuffix}` : `${name}: ${value}`;
          },
        },
      },
      annotation: { annotations },
      barValueLabels: {
        format: valueLabelFormat,
        color: valueLabelColor || colors.color,
        fontSize: 10,
      },
    },
    scales: {
      [categoryAxis]: {
        ticks: { color: colors.color, font: { size: 10, weight: 600 } },
        grid: { display: false },
        border: { display: false },
      },
      [valueAxis]: {
        ticks: {
          color: colors.faint,
          font: { size: 9 },
          maxTicksLimit: 6,
          callback: percentScale ? (value) => `${value}%` : undefined,
        },
        grid: { color: colors.gridColor, drawTicks: false },
        border: { display: false },
        beginAtZero: true,
        ...(percentScale ? { max: 100 } : { grace: "22%" }),
      },
    },
  };
}

function pickValues(data, items) {
  return items
    .map(({ label, key }) => ({ label, value: Number(data?.[key]) }))
    .filter((item) => Number.isFinite(item.value));
}

function LadderChart({ title, subtitle, items, indexAxis = "x" }) {
  const theme = useChartTheme();
  const colors = getChartColors(theme);
  if (!items.length) return null;

  const values = items.map((i) => i.value);
  const valueAxis = indexAxis === "y" ? "x" : "y";
  const chartData = {
    labels: items.map((i) => i.label),
    datasets: [
      {
        data: values,
        backgroundColor: rampFills(colors, values),
        borderRadius: 4,
        maxBarThickness: indexAxis === "y" ? 26 : 44,
        valueLabels: true,
      },
    ],
  };

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ChartSlot>
        <Bar
          key={theme}
          data={chartData}
          plugins={BAR_PLUGINS}
          options={buildBaseOptions(colors, indexAxis, {
            annotations: { coinFlip: coinFlipLine(colors, valueAxis) },
          })}
        />
      </ChartSlot>
    </ChartCard>
  );
}

export function GoalsMarketChart({ data }) {
  const items = pickValues(data, [
    { label: "Over 0.5", key: "seasonOver05Percentage_overall" },
    { label: "Over 1.5", key: "seasonOver15Percentage_overall" },
    { label: "Over 2.5", key: "seasonOver25Percentage_overall" },
    { label: "Over 3.5", key: "seasonOver35Percentage_overall" },
    { label: "Over 4.5", key: "seasonOver45Percentage_overall" },
  ]);

  return (
    <LadderChart
      title="Goals market hit rates"
      subtitle="Share of matches clearing each goal line. Stronger shading lands more often."
      items={items}
      indexAxis="y"
    />
  );
}

export function ResultSplitChart({ data }) {
  const home = Number(data?.homeWinPercentage);
  const draw = Number(data?.drawPercentage);
  const away = Number(data?.awayWinPercentage);
  if (![home, draw, away].every((v) => Number.isFinite(v))) return null;

  const edge = home - away;
  const caption =
    Math.abs(edge) < 1
      ? "Home and away sides win almost equally often."
      : `${edge > 0 ? "Home" : "Away"} sides win ${Math.abs(edge).toFixed(
          1
        )} percentage points more often.`;

  return (
    <ChartCard title="Match result distribution">
      <SplitBar
        segments={[
          { label: "Home win", value: home, tone: "home" },
          { label: "Draw", value: draw, tone: "draw" },
          { label: "Away win", value: away, tone: "away" },
        ]}
        caption={caption}
      />
    </ChartCard>
  );
}

export function BttsMarketChart({ data }) {
  const btts = Number(data?.seasonBTTSPercentage);
  if (!Number.isFinite(btts)) return null;

  const bttsNo = Math.max(0, 100 - btts);
  const caption =
    btts >= 50
      ? `Both teams score in ${Math.round(btts)} of every 100 matches.`
      : `At least one side keeps a clean sheet in ${Math.round(bttsNo)} of every 100 matches.`;

  return (
    <ChartCard title="Both teams to score">
      <SplitBar
        segments={[
          { label: "BTTS yes", value: btts, tone: "accent" },
          { label: "BTTS no", value: bttsNo, tone: "neutral" },
        ]}
        caption={caption}
      />
    </ChartCard>
  );
}

export function CornerLinesChart({ data }) {
  const items = pickValues(data, [
    { label: "Over 7.5", key: "over75CornersPercentage_overall" },
    { label: "Over 8.5", key: "over85CornersPercentage_overall" },
    { label: "Over 9.5", key: "over95CornersPercentage_overall" },
    { label: "Over 10.5", key: "over105CornersPercentage_overall" },
    { label: "Over 11.5", key: "over115CornersPercentage_overall" },
    { label: "Over 12.5", key: "over125CornersPercentage_overall" },
  ]);

  return <LadderChart title="Corner line hit rates" items={items} />;
}

export function CardLinesChart({ data }) {
  const items = pickValues(data, [
    { label: "Over 2.5", key: "over25CardsPercentage_overall" },
    { label: "Over 3.5", key: "over35CardsPercentage_overall" },
    { label: "Over 4.5", key: "over45CardsPercentage_overall" },
  ]);

  return <LadderChart title="Card line hit rates" items={items} />;
}

export function HalfTimeGoalsChart({ data }) {
  const theme = useChartTheme();
  const colors = getChartColors(theme);
  const lines = [
    { label: "Over 0.5", first: "over05_fhg_percentage", second: "over05_2hg_percentage" },
    { label: "Over 1.5", first: "over15_fhg_percentage", second: "over15_2hg_percentage" },
  ]
    .map(({ label, first, second }) => ({
      label,
      first: Number(data?.[first]),
      second: Number(data?.[second]),
    }))
    .filter((line) => Number.isFinite(line.first) || Number.isFinite(line.second));

  if (!lines.length) return null;

  const toValue = (v) => (Number.isFinite(v) ? v : null);
  const chartData = {
    labels: lines.map((l) => l.label),
    datasets: [
      {
        label: "1st half",
        data: lines.map((l) => toValue(l.first)),
        backgroundColor: colors.neutral,
        borderRadius: 4,
        maxBarThickness: 40,
        valueLabels: true,
      },
      {
        label: "2nd half",
        data: lines.map((l) => toValue(l.second)),
        backgroundColor: colors.accent,
        borderRadius: 4,
        maxBarThickness: 40,
        valueLabels: true,
      },
    ],
  };

  return (
    <ChartCard
      title="Half-time goals markets"
      subtitle="How often each half clears the line."
    >
      <ChartSlot>
        <Bar
          key={theme}
          data={chartData}
          plugins={BAR_PLUGINS}
          options={buildBaseOptions(colors, "x", {
            legend: true,
            annotations: { coinFlip: coinFlipLine(colors, "y") },
          })}
        />
      </ChartSlot>
    </ChartCard>
  );
}

const GOAL_TIMING_BUCKETS = [
  { label: "0-10'", key: "goals_min_0_to_10" },
  { label: "11-20'", key: "goals_min_11_to_20" },
  { label: "21-30'", key: "goals_min_21_to_30" },
  { label: "31-40'", key: "goals_min_31_to_40" },
  { label: "41-50'", key: "goals_min_41_to_50" },
  { label: "51-60'", key: "goals_min_51_to_60" },
  { label: "61-70'", key: "goals_min_61_to_70" },
  { label: "71-80'", key: "goals_min_71_to_80" },
  { label: "81-90'", key: "goals_min_81_to_90" },
];

const HALF_TIME_BUCKET = "41-50'";

function halfBand(colors, { xMin, xMax, label, shaded }) {
  return {
    type: "box",
    xMin,
    xMax,
    backgroundColor: shaded ? colors.band : "transparent",
    borderWidth: 0,
    drawTime: "beforeDatasetsDraw",
    label: {
      display: true,
      content: label,
      position: { x: "start", y: "start" },
      color: colors.faint,
      font: { size: 10, weight: 600 },
      padding: 4,
    },
  };
}

export function GoalTimingChart({ data }) {
  const theme = useChartTheme();
  if (data?.goalTimingDisabled === 1) return null;

  const colors = getChartColors(theme);
  const buckets = pickValues(data, GOAL_TIMING_BUCKETS);
  const total = buckets.reduce((sum, b) => sum + b.value, 0);
  if (!buckets.length || total <= 0) return null;

  const peak = buckets.reduce((best, b) => (b.value > best.value ? b : best));
  const peakIndex = buckets.indexOf(peak);
  const peakShare = Math.round((peak.value / total) * 100);
  const halfTimeIndex = buckets.findIndex((b) => b.label === HALF_TIME_BUCKET);

  const annotations = {};
  if (halfTimeIndex > 0) {
    annotations.firstHalf = halfBand(colors, {
      xMin: -0.5,
      xMax: halfTimeIndex,
      label: "1st half",
      shaded: true,
    });
    annotations.secondHalf = halfBand(colors, {
      xMin: halfTimeIndex,
      xMax: buckets.length - 0.5,
      label: "2nd half",
      shaded: false,
    });
    annotations.halfTime = {
      type: "line",
      scaleID: "x",
      value: halfTimeIndex,
      borderColor: colors.reference,
      borderWidth: 1,
      borderDash: [3, 3],
      drawTime: "beforeDatasetsDraw",
    };
  }

  const chartData = {
    labels: buckets.map((b) => b.label),
    datasets: [
      {
        data: buckets.map((b) => b.value),
        backgroundColor: buckets.map((_, index) =>
          index === peakIndex ? colors.accent : withAlpha(colors.accent, 0.38)
        ),
        borderRadius: 4,
        maxBarThickness: 34,
        valueLabels: true,
      },
    ],
  };

  return (
    <ChartCard
      title="Goals by time period"
      subtitle={`Goals peak in the ${peak.label} window: ${Math.round(
        peak.value
      )} goals, ${peakShare}% of the season total.`}
    >
      <ChartSlot>
        <Bar
          key={theme}
          data={chartData}
          plugins={BAR_PLUGINS}
          options={buildBaseOptions(colors, "x", {
            valueSuffix: " goals",
            valueDecimals: 0,
            percentScale: false,
            annotations,
            valueLabelFormat: (value) => String(Math.round(value)),
          })}
        />
      </ChartSlot>
    </ChartCard>
  );
}

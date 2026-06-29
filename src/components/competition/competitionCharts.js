import { Bar, Doughnut } from "react-chartjs-2";
import { useChartTheme, getChartColors } from "../Chart";

const CHART_COLORS = [
  "#01a501",
  "#f57701",
  "#d71200",
  "#0644B3",
  "#C22EDC",
  "#119F0B",
  "#FE0000",
  "#0644B3",
];

function buildBaseOptions(
  theme,
  title,
  indexAxis = "x",
  { valueSuffix = "%", valueDecimals = 1 } = {}
) {
  const { color, gridColor, tooltipBackground } = getChartColors(theme);
  return {
    color,
    indexAxis,
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: indexAxis === "y" ? 1.4 : 1.6,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title,
        color,
        font: { size: 11, weight: "600" },
        padding: { bottom: 8 },
      },
      tooltip: {
        backgroundColor: tooltipBackground,
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        callbacks: {
          label(context) {
            const value = Number(context.raw).toFixed(valueDecimals);
            return valueSuffix
              ? `${context.label}: ${value}${valueSuffix}`
              : `${context.label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color, font: { size: 9 } },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color, font: { size: 9 } },
        grid: { color: gridColor },
        beginAtZero: true,
      },
    },
  };
}

export function GoalsMarketChart({ data }) {
  const theme = useChartTheme();
  const items = [
    { label: "Over 0.5", key: "seasonOver05Percentage_overall" },
    { label: "Over 1.5", key: "seasonOver15Percentage_overall" },
    { label: "Over 2.5", key: "seasonOver25Percentage_overall" },
    { label: "Over 3.5", key: "seasonOver35Percentage_overall" },
    { label: "Over 4.5", key: "seasonOver45Percentage_overall" },
  ]
    .map(({ label, key }) => ({ label, value: Number(data?.[key]) }))
    .filter((item) => Number.isFinite(item.value));

  if (!items.length) return null;

  const chartData = {
    labels: items.map((i) => i.label),
    datasets: [
      {
        data: items.map((i) => i.value),
        backgroundColor: CHART_COLORS.slice(0, items.length),
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="Competition__chartCard">
      <Bar
        data={chartData}
        options={buildBaseOptions(theme, "Goals market hit rates", "y")}
      />
    </div>
  );
}

export function ResultSplitChart({ data }) {
  const theme = useChartTheme();
  const home = Number(data?.homeWinPercentage);
  const draw = Number(data?.drawPercentage);
  const away = Number(data?.awayWinPercentage);
  if (![home, draw, away].every((v) => Number.isFinite(v))) return null;

  const { color, tooltipBackground } = getChartColors(theme);
  const chartData = {
    labels: ["Home win", "Draw", "Away win"],
    datasets: [
      {
        data: [home, draw, away],
        backgroundColor: ["#01a501", "#f57701", "#d71200"],
        borderWidth: 2,
        borderColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
      },
    ],
  };

  return (
    <div className="Competition__chartCard">
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          aspectRatio: 1.4,
          plugins: {
            legend: {
              position: "bottom",
              labels: { color, padding: 10, font: { size: 10 } },
            },
            title: {
              display: true,
              text: "Match result distribution",
              color,
              font: { size: 11, weight: "600" },
            },
            tooltip: {
              backgroundColor: tooltipBackground,
              callbacks: {
                label(context) {
                  return `${context.label}: ${Number(context.raw).toFixed(1)}%`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
}

export function BttsMarketChart({ data }) {
  const theme = useChartTheme();
  const btts = Number(data?.seasonBTTSPercentage);
  if (!Number.isFinite(btts)) return null;

  const bttsNo = Math.max(0, 100 - btts);
  const { color, tooltipBackground } = getChartColors(theme);
  const chartData = {
    labels: ["BTTS", "BTTS No"],
    datasets: [
      {
        data: [btts, bttsNo],
        backgroundColor: ["#01a501", "#d71200"],
        borderWidth: 2,
        borderColor: theme === "dark" ? "#1f1f1f" : "#ffffff",
      },
    ],
  };

  return (
    <div className="Competition__chartCard">
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          aspectRatio: 1.4,
          plugins: {
            legend: {
              position: "bottom",
              labels: { color, padding: 10, font: { size: 10 } },
            },
            title: {
              display: true,
              text: "BTTS vs BTTS No",
              color,
              font: { size: 11, weight: "600" },
            },
            tooltip: {
              backgroundColor: tooltipBackground,
              callbacks: {
                label(context) {
                  return `${context.label}: ${Number(context.raw).toFixed(1)}%`;
                },
              },
            },
          },
        }}
      />
    </div>
  );
}

export function CornerLinesChart({ data }) {
  const theme = useChartTheme();
  const items = [
    { label: "Over 7.5", key: "over75CornersPercentage_overall" },
    { label: "Over 8.5", key: "over85CornersPercentage_overall" },
    { label: "Over 9.5", key: "over95CornersPercentage_overall" },
    { label: "Over 10.5", key: "over105CornersPercentage_overall" },
    { label: "Over 11.5", key: "over115CornersPercentage_overall" },
    { label: "Over 12.5", key: "over125CornersPercentage_overall" },
  ]
    .map(({ label, key }) => ({ label, value: Number(data?.[key]) }))
    .filter((item) => Number.isFinite(item.value));

  if (!items.length) return null;

  const chartData = {
    labels: items.map((i) => i.label),
    datasets: [
      {
        data: items.map((i) => i.value),
        backgroundColor: "#0644B3",
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="Competition__chartCard">
      <Bar
        data={chartData}
        options={buildBaseOptions(theme, "Corner line hit rates")}
      />
    </div>
  );
}

export function CardLinesChart({ data }) {
  const theme = useChartTheme();
  const items = [
    { label: "Over 2.5", key: "over25CardsPercentage_overall" },
    { label: "Over 3.5", key: "over35CardsPercentage_overall" },
    { label: "Over 4.5", key: "over45CardsPercentage_overall" },
  ]
    .map(({ label, key }) => ({ label, value: Number(data?.[key]) }))
    .filter((item) => Number.isFinite(item.value));

  if (!items.length) return null;

  const chartData = {
    labels: items.map((i) => i.label),
    datasets: [
      {
        data: items.map((i) => i.value),
        backgroundColor: "#C22EDC",
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="Competition__chartCard">
      <Bar
        data={chartData}
        options={buildBaseOptions(theme, "Card line hit rates")}
      />
    </div>
  );
}

export function HalfTimeGoalsChart({ data }) {
  const theme = useChartTheme();
  const fhg = [
    { label: "FHG 0.5+", key: "over05_fhg_percentage" },
    { label: "FHG 1.5+", key: "over15_fhg_percentage" },
  ]
    .map(({ label, key }) => ({ label, value: Number(data?.[key]) }))
    .filter((i) => Number.isFinite(i.value));

  const shg = [
    { label: "2HG 0.5+", key: "over05_2hg_percentage" },
    { label: "2HG 1.5+", key: "over15_2hg_percentage" },
  ]
    .map(({ label, key }) => ({ label, value: Number(data?.[key]) }))
    .filter((i) => Number.isFinite(i.value));

  if (!fhg.length && !shg.length) return null;

  const labels = [...fhg, ...shg].map((i) => i.label);
  const values = [...fhg, ...shg].map((i) => i.value);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: labels.map((_, idx) =>
          idx < fhg.length ? "#01a501" : "#d71200"
        ),
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="Competition__chartCard">
      <Bar
        data={chartData}
        options={buildBaseOptions(theme, "Half-time goals markets")}
      />
    </div>
  );
}

export function GoalTimingChart({ data }) {
  if (data?.goalTimingDisabled === 1) return null;

  const theme = useChartTheme();
  const buckets = [
    { label: "0-10'", key: "goals_min_0_to_10" },
    { label: "11-20'", key: "goals_min_11_to_20" },
    { label: "21-30'", key: "goals_min_21_to_30" },
    { label: "31-40'", key: "goals_min_31_to_40" },
    { label: "41-50'", key: "goals_min_41_to_50" },
    { label: "51-60'", key: "goals_min_51_to_60" },
    { label: "61-70'", key: "goals_min_61_to_70" },
    { label: "71-80'", key: "goals_min_71_to_80" },
    { label: "81-90'", key: "goals_min_76_to_90" },
  ]
    .map(({ label, key }) => ({ label, value: Number(data?.[key]) }))
    .filter((i) => Number.isFinite(i.value) && i.value > 0);

  if (!buckets.length) return null;

  const chartData = {
    labels: buckets.map((b) => b.label),
    datasets: [
      {
        data: buckets.map((b) => b.value),
        backgroundColor: "#f57701",
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="Competition__chartCard">
      <Bar
        data={chartData}
        options={buildBaseOptions(theme, "Goals by time period", "x", {
          valueSuffix: "",
          valueDecimals: 0,
        })}
      />
    </div>
  );
}

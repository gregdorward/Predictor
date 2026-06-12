import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { buildDualSeasonPpgSeries } from "../utils/seasonPpgSeries";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function resolveChartTheme() {
  return document.body.classList.contains("dark-mode") ? "dark" : "light";
}

function useChartTheme() {
  const [theme, setTheme] = useState(resolveChartTheme);

  useEffect(() => {
    const sync = () => setTheme(resolveChartTheme());
    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

const HOME_COLOR = "#01a501";
const AWAY_COLOR = "#ae1001";

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
  const { labels, homeRollingPpg, awayRollingPpg } = buildDualSeasonPpgSeries(
    homeResults,
    awayResults
  );

  if (!labels.length) return null;

  const color = theme === "dark" ? "#ffffff" : "#020029";
  const gridColor =
    theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(2,0,41,0.08)";

  const maxTicks = labels.length > 20 ? 10 : labels.length > 12 ? 8 : undefined;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color,
          boxHeight: 8,
          boxWidth: 24,
          padding: 12,
          font: { size: 11, weight: "500" },
        },
      },
      title: {
        display: true,
        text: "Season form curve",
        color,
        font: {
          size: 13,
          weight: "600",
        },
        padding: {
          bottom: 4,
        },
      },
      subtitle: {
        display: true,
        text: "Rolling 5-game PPG by gameweek",
        color,
        font: {
          size: 12,
          weight: "400",
        },
        padding: {
          bottom: 12,
        },
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex;
            return labels[idx] ? `Gameweek ${labels[idx]}` : "";
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color,
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: maxTicks,
          font: { size: 10 },
        },
        grid: { color: gridColor, display: false },
      },
      y: {
        min: 0,
        max: 3,
        ticks: { color, stepSize: 1, font: { size: 10 } },
        grid: { color: gridColor },
      },
    },
  };

  const data = {
    labels,
    datasets: [
      {
        label: homeTeam,
        data: homeRollingPpg,
        borderColor: HOME_COLOR,
        backgroundColor: HOME_COLOR,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 8,
        tension: 0.35,
        spanGaps: false,
      },
      {
        label: awayTeam,
        data: awayRollingPpg,
        borderColor: AWAY_COLOR,
        backgroundColor: AWAY_COLOR,
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 8,
        tension: 0.35,
        spanGaps: false,
      },
    ],
  };

  return (
    <div className="SeasonPpgChart">
      <Line options={options} data={data} />
    </div>
  );
}

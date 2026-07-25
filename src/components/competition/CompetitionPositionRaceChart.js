import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Pause, Play } from "lucide-react";
import { fetchAllLeagueFixturesPages } from "../../logic/leagueResultsLoader";
import { buildLeaguePositionSeries } from "../../utils/leaguePositionSeries";
import { GROUP_STAGE_LEAGUE_IDS } from "../../utils/groupStageTables";
import CompetitionPositionRaceTable from "./CompetitionPositionRaceTable";
import { useChartTheme, getChartColors } from "../Chart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/** MLS conference tables — not a single-table race for v1. */
const SKIP_LEAGUE_IDS = new Set([...GROUP_STAGE_LEAGUE_IDS, 16504]);

/** Duration to morph from one gameweek tip to the next while playing. */
const WEEK_TRANSITION_MS = 700;
/** Narrow viewports use the rankings table instead of the line chart. */
const TABLE_LAYOUT_MQ = "(max-width: 1099px)";
const MIN_TEAMS = 4;
const MIN_WEEKS = 2;

function easeInOutCubic(t) {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function interpolatePosition(from, to, t) {
  if (from == null && to == null) return null;
  if (from == null) return to;
  if (to == null) return from;
  return from + (to - from) * t;
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return undefined;
    }
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

/**
 * Build chart series for a (possibly fractional) week index.
 * Between integers the tip segment lerps vertically so position swaps read clearly.
 */
function buildRaceChartData(series, displayWeek, { tipRadius, borderWidth }) {
  const maxWeek = series.labels.length - 1;
  const week = Math.max(0, Math.min(Number(displayWeek) || 0, maxWeek));
  const floor = Math.floor(week);
  const ceil = Math.min(Math.ceil(week), maxWeek);
  const rawT = week - floor;
  const t = easeInOutCubic(rawT);
  const animating = ceil > floor && rawT > 0.001;
  const labelEnd = animating ? ceil : floor;
  const labels = series.labels.slice(0, labelEnd + 1);

  const datasets = series.teams.map((team) => {
    const full = series.positions[team] || [];
    const data = [];

    for (let i = 0; i < floor; i += 1) {
      data.push(full[i] ?? null);
    }

    if (animating) {
      data.push(full[floor] ?? null);
      data.push(interpolatePosition(full[floor], full[ceil], t));
    } else {
      data.push(full[floor] ?? null);
    }

    const lineColor = hashTeamColor(team);
    const radii = data.map((value, index) =>
      index === data.length - 1 && value != null ? tipRadius : 0
    );

    return {
      label: team,
      data,
      borderColor: lineColor,
      backgroundColor: lineColor,
      borderWidth,
      tension: 0.15,
      spanGaps: false,
      // Allow tip dots near the right edge; name labels are drawn by plugin outside clip.
      clip: false,
      pointRadius: radii,
      pointHoverRadius: radii.map((r) => (r > 0 ? r + 2 : 3)),
      pointHitRadius: 8,
      pointStyle: "circle",
      pointBorderColor: "#ffffff",
      pointBorderWidth: 1.5,
    };
  });

  return { labels, datasets };
}

function hashTeamColor(name) {
  let hash = 0;
  const str = String(name || "");
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 62% 42%)`;
}

function measureLabelPad(teamNames, fontSize = 11) {
  if (typeof document === "undefined") return 120;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return 120;
  ctx.font = `bold ${fontSize}px sans-serif`;
  let max = 0;
  for (const name of teamNames || []) {
    max = Math.max(max, ctx.measureText(String(name)).width);
  }
  // tip gap + pill padding + a little breathing room
  return Math.ceil(max + 8 * 2 + 14);
}

/**
 * Draw full team-name pills to the right of each race tip (outside chartArea clip).
 */
const raceTipLabelPlugin = {
  id: "raceTipLabels",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const fontSize = chart.options?.plugins?.raceTipLabels?.fontSize || 11;
    const padX = 8;
    const padY = 4;
    const gap = 8;

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.hidden || !meta.data?.length) return;

      let tip = null;
      for (let i = meta.data.length - 1; i >= 0; i -= 1) {
        const el = meta.data[i];
        const value = dataset.data[i];
        if (el && value != null && Number.isFinite(el.x) && Number.isFinite(el.y)) {
          tip = el;
          break;
        }
      }
      if (!tip) return;

      const label = String(dataset.label || "");
      const color = dataset.borderColor || "#888";

      ctx.save();
      ctx.font = `bold ${fontSize}px sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const pillW = Math.ceil(textWidth + padX * 2);
      const pillH = Math.ceil(fontSize + padY * 2 + 2);
      const pillX = tip.x + gap;
      const pillY = tip.y - pillH / 2;
      const radius = Math.min(pillH / 2, 8);

      ctx.beginPath();
      ctx.moveTo(pillX + radius, pillY);
      ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, radius);
      ctx.arcTo(pillX + pillW, pillY + pillH, pillX, pillY + pillH, radius);
      ctx.arcTo(pillX, pillY + pillH, pillX, pillY, radius);
      ctx.arcTo(pillX, pillY, pillX + pillW, pillY, radius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, pillX + pillW / 2, tip.y + 0.5);
      ctx.restore();
    });
  },
};

/** Height + tip sizing so each position row has enough vertical room. */
function layoutForTeams(teamCount, teamNames = []) {
  const count = Math.max(teamCount || 0, MIN_TEAMS);
  const pxPerRow = 36;
  const chrome = 80;
  const height = Math.min(1080, Math.max(480, count * pxPerRow + chrome));
  const rowPx = (height - chrome) / count;
  const tipRadius = Math.max(4, Math.min(6, Math.floor(rowPx * 0.22)));
  const fontSize = rowPx >= 34 ? 11 : 10;
  const borderWidth = 1.5;
  const tipLabelPad = measureLabelPad(teamNames, fontSize);

  return { height, tipRadius, fontSize, borderWidth, tipLabelPad };
}

export function isLeaguePositionRaceEligible(seasonId) {
  const id = Number(seasonId);
  return Number.isFinite(id) && !SKIP_LEAGUE_IDS.has(id);
}

export default function CompetitionPositionRaceChart({ seasonId }) {
  const theme = useChartTheme();
  const { color, gridColor, tooltipBackground } = getChartColors(theme);
  const useTableLayout = useMediaQuery(TABLE_LAYOUT_MQ);

  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  /** Fractional week index: integers are settled GWs; fractions animate tip swaps. */
  const [displayWeek, setDisplayWeek] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);

  const eligible = isLeaguePositionRaceEligible(seasonId);
  const maxWeek = series ? series.labels.length - 1 : 0;
  const scrubWeek = Math.min(maxWeek, Math.round(displayWeek));
  const teamCount = series?.teams?.length || 0;
  const layout = useMemo(
    () => layoutForTeams(teamCount, series?.teams || []),
    [teamCount, series?.teams]
  );
  const { tipRadius, borderWidth, height: chartHeight, tipLabelPad, fontSize } =
    layout;

  useEffect(() => {
    if (!eligible || !seasonId) {
      setLoading(false);
      setSeries(null);
      return undefined;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setSeries(null);
      setPlaying(false);

      try {
        const fixtures = await fetchAllLeagueFixturesPages(seasonId);
        if (!fixtures) {
          if (!cancelled) setSeries(null);
          return;
        }
        const built = buildLeaguePositionSeries(fixtures);

        if (
          cancelled ||
          built.labels.length < MIN_WEEKS ||
          built.teams.length < MIN_TEAMS
        ) {
          if (!cancelled) setSeries(null);
          return;
        }

        if (cancelled) return;

        setSeries(built);
        setDisplayWeek(built.labels.length - 1);
      } catch {
        if (!cancelled) setSeries(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [seasonId, eligible]);

  // Table play advances whole weeks; settle fractional chart progress when switching.
  useEffect(() => {
    if (useTableLayout) {
      setDisplayWeek((prev) => Math.min(maxWeek, Math.round(prev)));
    }
  }, [useTableLayout, maxWeek]);

  const stopPlay = useCallback(() => {
    setPlaying(false);
    if (rafRef.current != null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTsRef.current = null;
  }, []);

  useEffect(() => () => stopPlay(), [stopPlay]);

  useEffect(() => {
    if (!playing || !series?.labels?.length) {
      return undefined;
    }

    // Rankings table: step one whole gameweek at a time.
    if (useTableLayout) {
      const timer = window.setInterval(() => {
        setDisplayWeek((prev) => {
          const next = Math.round(prev) + 1;
          if (next >= maxWeek) {
            return maxWeek;
          }
          return next;
        });
      }, WEEK_TRANSITION_MS);

      return () => window.clearInterval(timer);
    }

    const tick = (ts) => {
      if (lastTsRef.current == null) {
        lastTsRef.current = ts;
      }
      const dt = Math.min(64, ts - lastTsRef.current);
      lastTsRef.current = ts;
      const advance = dt / WEEK_TRANSITION_MS;

      setDisplayWeek((prev) => {
        const next = prev + advance;
        if (next >= maxWeek) {
          return maxWeek;
        }
        return next;
      });

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTsRef.current = null;
    };
  }, [playing, series, maxWeek, useTableLayout]);

  useEffect(() => {
    if (!playing || !series?.labels?.length) return;
    if (displayWeek >= maxWeek) {
      stopPlay();
    }
  }, [displayWeek, playing, series, maxWeek, stopPlay]);

  const chartData = useMemo(() => {
    if (!series || useTableLayout) return null;
    return buildRaceChartData(series, displayWeek, {
      tipRadius,
      borderWidth,
    });
  }, [series, displayWeek, tipRadius, borderWidth, useTableLayout]);

  const options = useMemo(() => {
    if (useTableLayout) return null;
    const count = teamCount || 20;
    const tipPad = tipRadius + 8;
    const tickStep = count > 16 ? 2 : 1;
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      transitions: {
        active: { animation: { duration: 0 } },
        resize: { animation: { duration: 0 } },
      },
      interaction: { mode: "nearest", intersect: false },
      layout: {
        padding: {
          top: tipPad,
          bottom: tipPad,
          right: tipLabelPad,
          left: 4,
        },
      },
      plugins: {
        legend: { display: false },
        title: { display: false },
        raceTipLabels: { fontSize },
        tooltip: {
          backgroundColor: tooltipBackground,
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          callbacks: {
            title(items) {
              const idx = items[0]?.dataIndex;
              const label = chartData?.labels?.[idx];
              return label || "";
            },
            label(context) {
              const team = context.dataset.label;
              const pos = context.raw;
              if (pos == null) return `${team}: —`;
              const rounded = Math.round(Number(pos));
              const weekIdx = Math.min(
                scrubWeek,
                (series?.pointsByWeek?.[team]?.length || 1) - 1
              );
              const pts = series?.pointsByWeek?.[team]?.[weekIdx];
              const ptsLabel = pts != null ? ` · ${pts} pts` : "";
              return `${team}: ${rounded}${ptsLabel}`;
            },
          },
        },
      },
      scales: {
        x: {
          offset: true,
          ticks: {
            color,
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 12,
            font: { size: 10 },
          },
          grid: { color: gridColor, display: false },
        },
        y: {
          reverse: true,
          min: 0.55,
          max: count + 0.45,
          ticks: {
            color,
            stepSize: tickStep,
            font: { size: 10 },
            callback(value) {
              const n = Number(value);
              if (!Number.isInteger(n) || n < 1 || n > count) return "";
              if (tickStep > 1 && n !== 1 && n !== count && n % tickStep !== 0) {
                return "";
              }
              return n;
            },
          },
          grid: { color: gridColor },
          title: {
            display: true,
            text: "Position",
            color,
            font: { size: 11, weight: "500" },
          },
        },
      },
    };
  }, [
    series,
    chartData,
    color,
    gridColor,
    tooltipBackground,
    scrubWeek,
    teamCount,
    tipRadius,
    tipLabelPad,
    fontSize,
    useTableLayout,
  ]);

  const handlePlayToggle = () => {
    if (!series) return;
    if (playing) {
      stopPlay();
      // Settle on the nearest completed week when pausing mid-swap.
      setDisplayWeek((prev) => Math.min(maxWeek, Math.round(prev)));
      return;
    }
    if (displayWeek >= maxWeek - 0.001) {
      setDisplayWeek(0);
    }
    setPlaying(true);
  };

  const handleScrub = (event) => {
    stopPlay();
    setDisplayWeek(Number(event.target.value));
  };

  if (!eligible) {
    return null;
  }

  if (loading) {
    return (
      <section className="Competition__section Competition__positionRace">
        <h2 className="Competition__sectionHeading">League position race</h2>
        <div className="Competition__positionRaceLoading">Loading race…</div>
      </section>
    );
  }

  if (!series) {
    return null;
  }

  if (!useTableLayout && !chartData) {
    return null;
  }

  const weekLabel = series.labels[scrubWeek] || "";

  return (
    <section className="Competition__section Competition__positionRace">
      <h2 className="Competition__sectionHeading">League position race</h2>
      <p className="Competition__positionRaceIntro">
        {useTableLayout
          ? "Watch the table change week by week. Arrows show places gained or lost versus three gameweeks earlier (rolling)."
          : "Track how the table unfolded week by week. Press play to animate the season, or scrub to any gameweek."}
      </p>

      <div className="Competition__positionRaceCard">
        {useTableLayout ? (
          <CompetitionPositionRaceTable
            series={series}
            weekIndex={scrubWeek}
          />
        ) : (
          <div
            className="Competition__positionRaceChartWrap"
            style={{ height: `${chartHeight}px` }}
          >
            <Line
              data={chartData}
              options={options}
              height={chartHeight}
              plugins={[raceTipLabelPlugin]}
            />
          </div>
        )}

        <div className="Competition__positionRaceControls">
          <button
            type="button"
            className="Competition__positionRacePlay"
            onClick={handlePlayToggle}
            aria-label={playing ? "Pause race" : "Play race"}
            title={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
            <span>{playing ? "Pause" : "Play"}</span>
          </button>

          <label className="Competition__positionRaceScrub">
            <span className="Competition__positionRaceWeekLabel">
              {weekLabel}
              <span className="Competition__positionRaceWeekMeta">
                {scrubWeek + 1} / {maxWeek + 1}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={maxWeek}
              step={1}
              value={scrubWeek}
              onChange={handleScrub}
              aria-label="Gameweek"
            />
          </label>
        </div>
      </div>
    </section>
  );
}

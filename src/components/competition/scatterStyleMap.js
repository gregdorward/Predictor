import { useEffect, useRef, useState } from "react";
import {
  averageForMetric,
  formatMetricValue as formatComparisonMetricValue,
  getComparisonMetric,
} from "../../seo/competitionOverviewData";

export const SCATTER_AVERAGE_ABBR = "AVG";
export const SCATTER_AVERAGE_COLOR = "#ffd400";
export const SCATTER_AVERAGE_FILL = "rgba(255, 212, 0, 0.9)";

export const CROSS_LEAGUE_AVERAGE_NAME = "Cross-league average";

const NON_NEGATIVE_METRIC_KEYS = new Set([
  "shotsFor",
  "shotsAgainst",
  "sotFor",
  "sotAgainst",
  "daFor",
  "daAgainst",
  "cornersFor",
  "cornersAgainst",
  "avgPoints",
]);

/** Custom listbox — native <select> option alignment is OS-controlled and uneven. */
export function MetricPicker({ label, value, options, onChange }) {
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

export function niceStep(rough) {
  if (!Number.isFinite(rough) || rough <= 0) return 1;
  const power = Math.pow(10, Math.floor(Math.log10(rough)));
  const normalized = rough / power;
  if (normalized <= 1) return power;
  if (normalized <= 2) return 2 * power;
  if (normalized <= 5) return 5 * power;
  return 10 * power;
}

function isPercentMetric(metric) {
  return metric?.suffix === "%" || metric?.unit === "%";
}

/** Auto axis range from plotted values, with padding and nice ticks. */
export function computeAxisRange(values, metric) {
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

  if (isPercentMetric(metric) || NON_NEGATIVE_METRIC_KEYS.has(metric?.key)) {
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

export function comparisonMetricToAxisMeta(metric) {
  if (!metric) return null;
  return {
    key: metric.key,
    label: metric.label,
    decimals: metric.decimals,
    suffix: metric.unit === "%" ? "%" : undefined,
    unit: metric.unit,
  };
}

export function buildCrossLeagueAveragePoint(competitions, xKey, yKey) {
  const x = averageForMetric(competitions, xKey);
  const y = averageForMetric(competitions, yKey);
  if (x === null || y === null) return null;

  const xMetric = getComparisonMetric(xKey);
  const decimals = Math.max(
    xMetric?.decimals ?? 2,
    getComparisonMetric(yKey)?.decimals ?? 2
  );

  return {
    name: CROSS_LEAGUE_AVERAGE_NAME,
    isLeagueAverage: true,
    [xKey]: Number(x.toFixed(decimals)),
    [yKey]: Number(y.toFixed(decimals)),
  };
}

export function createScatterMarkerPlugin({
  labelColor,
  onPositions,
  pluginId = "scatterStyleMapMarkers",
}) {
  return {
    id: pluginId,
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const points = chart.data.datasets[0]?.data || [];
      if (!meta?.data?.length) {
        if (typeof onPositions === "function") {
          requestAnimationFrame(() => onPositions([]));
        }
        return;
      }

      const positions = [];
      ctx.save();
      ctx.font = "600 10px 'Open Sans', system-ui, sans-serif";
      ctx.fillStyle = labelColor;
      ctx.textBaseline = "middle";

      meta.data.forEach((element, index) => {
        const raw = points[index];
        if (!raw || !element) return;

        const { x, y } = element.getProps(["x", "y"], true);
        const markerId = raw.markerId ?? raw.team ?? raw.name;
        positions.push({
          markerId,
          team: raw.team ?? markerId,
          x: Math.round(x),
          y: Math.round(y),
          badgeUrl: raw.badgeUrl || null,
          isLeagueAverage: Boolean(raw.isLeagueAverage),
        });

        if (raw.badgeUrl && !raw.isLeagueAverage) return;

        const label = raw.abbr;
        if (!label) return;

        const chartArea = chart.chartArea;
        const textWidth = ctx.measureText(label).width;
        const preferRight = x + 8 + textWidth < chartArea.right - 4;
        const textX = preferRight ? x + 8 : x - 8 - textWidth;

        ctx.globalAlpha = 0.92;
        ctx.fillText(label, textX, y);
      });

      ctx.restore();
      if (typeof onPositions === "function") {
        const snapshot = positions;
        requestAnimationFrame(() => onPositions(snapshot));
      }
    },
  };
}

export function ScatterBadgeLayer({ markers, size = 20 }) {
  const badges = (markers || []).filter(
    (marker) => marker.badgeUrl && !marker.isLeagueAverage
  );
  if (!badges.length) return null;

  return (
    <div className="Competition__scatterBadgeLayer" aria-hidden="true">
      {badges.map((marker) => {
        const key = marker.markerId ?? marker.team;
        return (
          <img
            key={key}
            src={marker.badgeUrl}
            alt=""
            className="Competition__scatterBadge"
            style={{
              left: marker.x,
              top: marker.y,
              width: size,
              height: size,
            }}
          />
        );
      })}
    </div>
  );
}

export function markersSignature(markers) {
  return (markers || [])
    .map((marker) => {
      const id = marker.markerId ?? marker.team;
      return `${id}:${marker.x}:${marker.y}:${marker.badgeUrl ? "1" : "0"}`;
    })
    .join("|");
}

export function formatScatterAxisValue(value, axisMeta) {
  if (!axisMeta?.unit) {
    if (!Number.isFinite(Number(value))) return "-";
    const formatted = Number(value).toFixed(axisMeta?.decimals ?? 2);
    return axisMeta?.suffix ? `${formatted}${axisMeta.suffix}` : formatted;
  }
  const comparisonMetric = getComparisonMetric(axisMeta.key);
  if (comparisonMetric) {
    return formatComparisonMetricValue(value, comparisonMetric) ?? "-";
  }
  return String(value);
}

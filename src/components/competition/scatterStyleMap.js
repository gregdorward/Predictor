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
          slug: raw.slug ?? raw.row?.slug ?? null,
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

export const SCATTER_CHART_INTERACTION = {
  mode: "nearest",
  intersect: false,
  axis: "xy",
};

/** Base badge size (px) before CSS scale, by number of points on the plot. */
export function scatterPlotCountBadgeSize(count) {
  if (count <= 2) return 28;
  if (count <= 6) return 22;
  if (count <= 12) return 18;
  return 14;
}

export function scatterBadgeHitRadius(scatterBadgeSize) {
  return scatterBadgeSize * 0.9375 + 4;
}

/** Tooltip + interaction defaults for style-map scatter charts. */
export function buildScatterTooltipOptions(tooltipBackground, callbacks = {}) {
  return {
    backgroundColor: tooltipBackground,
    titleColor: "#ffffff",
    bodyColor: "#ffffff",
    mode: "nearest",
    intersect: false,
    displayColors: false,
    callbacks,
  };
}

/** Extra canvas padding when axis titles are rendered outside the chart. */
export const SCATTER_EXTERNAL_AXIS_LAYOUT_PADDING = {
  top: 12,
  right: 18,
  bottom: 6,
  left: 2,
};

/** Axis titles in the margin so the square plot can use the full card width. */
export function ScatterAxisFrame({ xLabel, yLabel, children, className = "" }) {
  if (!xLabel && !yLabel) {
    return children;
  }

  return (
    <div
      className={`Competition__scatterAxisFrame${
        className ? ` ${className}` : ""
      }`}
    >
      {yLabel ? (
        <p className="Competition__scatterAxisTitle Competition__scatterAxisTitle--y">
          {yLabel}
        </p>
      ) : null}
      {children}
      {xLabel ? (
        <p className="Competition__scatterAxisTitle Competition__scatterAxisTitle--x">
          {xLabel}
        </p>
      ) : null}
    </div>
  );
}

/** Compact league multi-select for the compare style map (popover checklist). */
export function StyleMapLeagueSelectionBar({
  plottedCount,
  totalCount,
  leagues,
  selectedSlugs,
  onToggle,
  onSelectTopTen,
  onSelectAll,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

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
    <div
      className="CompetitionsCompare-styleMapLegendBar"
      ref={rootRef}
      data-testid="style-map-league-bar"
    >
      <p className="CompetitionsCompare-styleMapLegendStatus">
        Showing {plottedCount} of {totalCount} leagues on chart
      </p>
      <div
        className="CompetitionsCompare-styleMapLegendActions"
        role="group"
        aria-label="League selection"
      >
        <button
          type="button"
          className="CompetitionsCompare-styleMapLegendAction"
          onClick={onSelectTopTen}
        >
          Top 10
        </button>
        <button
          type="button"
          className="CompetitionsCompare-styleMapLegendAction"
          onClick={onSelectAll}
        >
          All leagues ({totalCount})
        </button>
        <div className="Competition__metricPicker CompetitionsCompare-styleMapLeaguePicker">
          <div className="Competition__metricPickerControl">
            <button
              type="button"
              className="Competition__metricPickerTrigger CompetitionsCompare-styleMapLeaguePickerTrigger"
              aria-haspopup="listbox"
              aria-expanded={open}
              onClick={() => setOpen((prev) => !prev)}
            >
              <span className="Competition__metricPickerValue">Choose leagues</span>
              <span className="Competition__metricPickerCaret" aria-hidden="true">
                ▾
              </span>
            </button>
            {open ? (
              <ul
                className="Competition__metricPickerMenu Competition__styleMapLeaguePickerMenu"
                role="listbox"
                aria-label="Leagues on style map"
                aria-multiselectable="true"
              >
                {leagues.map((league) => {
                  const selected = selectedSlugs.has(league.slug);
                  return (
                    <li key={league.slug} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`Competition__metricPickerOption Competition__styleMapLeaguePickerOption${
                          selected
                            ? " Competition__metricPickerOption--active"
                            : ""
                        }`}
                        onClick={() => onToggle(league.slug)}
                      >
                        <span
                          className="Competition__metricPickerCheck"
                          aria-hidden="true"
                        >
                          {selected ? "✓" : ""}
                        </span>
                        {league.badgeUrl ? (
                          <img
                            src={league.badgeUrl}
                            alt=""
                            className="Competition__styleMapLeaguePickerBadge"
                          />
                        ) : null}
                        <span className="Competition__metricPickerOptionLabel">
                          {league.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function StyleMapLegendEntry({ item }) {
  return (
    <>
      {item.color ? (
        <span
          className={`Competition__radarLegendColor${
            item.dashed ? " Competition__radarLegendColor--dashed" : ""
          }`}
          style={{ background: item.color }}
          aria-hidden="true"
        />
      ) : null}
      {item.badgeUrl ? (
        <img
          src={item.badgeUrl}
          alt=""
          className="Competition__radarLegendBadge"
        />
      ) : null}
      <span className="Competition__radarLegendName">{item.name}</span>
    </>
  );
}

/** Badge + name key for style map / radar share captures. */
export function StyleMapLegend({
  items,
  className = "",
  highlightedSlug = null,
  onHighlightSlug,
}) {
  if (!items?.length) return null;

  const highlightable = typeof onHighlightSlug === "function";
  const listLabel = highlightable
    ? "Chart key — tap a league to highlight on the chart"
    : "Chart key";

  return (
    <ul
      className={`Competition__radarLegend${className ? ` ${className}` : ""}`}
      data-testid="style-map-legend"
      aria-label={listLabel}
    >
      {items.map((item) => {
        const key = item.slug || item.name;
        const isHighlighted =
          highlightable && item.slug && highlightedSlug === item.slug;

        if (highlightable && item.slug) {
          return (
            <li key={key}>
              <button
                type="button"
                className={`Competition__radarLegendItem Competition__radarLegendItem--highlightable${
                  isHighlighted
                    ? " Competition__radarLegendItem--chartHighlight"
                    : ""
                }`}
                aria-pressed={isHighlighted}
                onClick={() =>
                  onHighlightSlug(
                    highlightedSlug === item.slug ? null : item.slug
                  )
                }
              >
                <StyleMapLegendEntry item={item} />
              </button>
            </li>
          );
        }

        return (
          <li key={key} className="Competition__radarLegendItem">
            <StyleMapLegendEntry item={item} />
          </li>
        );
      })}
    </ul>
  );
}

export function ScatterBadgeLayer({
  markers,
  size = 20,
  highlightedSlug = null,
}) {
  const badges = (markers || []).filter(
    (marker) => marker.badgeUrl && !marker.isLeagueAverage
  );
  if (!badges.length) return null;

  return (
    <div className="Competition__scatterBadgeLayer" aria-hidden="true">
      {badges.map((marker) => {
        const key = marker.markerId ?? marker.team;
        const isHighlighted =
          highlightedSlug && marker.slug && marker.slug === highlightedSlug;
        return (
          <img
            key={key}
            src={marker.badgeUrl}
            alt=""
            className={`Competition__scatterBadge${
              isHighlighted ? " Competition__scatterBadge--highlighted" : ""
            }`}
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

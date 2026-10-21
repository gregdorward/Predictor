import { withAlpha } from "./chartTheme";

export const CHART_FONT_FAMILY = "'Open Sans', system-ui, sans-serif";

function font(size, weight = 600) {
  return `${weight} ${size}px ${CHART_FONT_FAMILY}`;
}

function roundedRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Pixels of right padding needed to fit direct-label pills for `texts`. */
export function measureDirectLabelPad(texts, fontSize = 11) {
  if (typeof document === "undefined") return 56;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return 56;
  ctx.font = font(fontSize);
  let max = 0;
  for (const text of texts || []) {
    max = Math.max(max, ctx.measureText(String(text)).width);
  }
  return Math.ceil(max + 8 * 2 + 12);
}

function lastFiniteElement(meta, dataset) {
  for (let i = meta.data.length - 1; i >= 0; i -= 1) {
    const el = meta.data[i];
    const value = dataset.data[i];
    if (el && value != null && Number.isFinite(el.x) && Number.isFinite(el.y)) {
      return { el, value, index: i };
    }
  }
  return null;
}

/**
 * Value pills at the tip of each visible line. Datasets opt out with
 * `directLabel: false`; text comes from `plugins.directLabels.format`.
 */
export const directLabelsPlugin = {
  id: "directLabels",
  defaults: {
    fontSize: 11,
    gap: 8,
    format: (value) => String(value),
  },
  afterDatasetsDraw(chart, _args, opts) {
    if (opts?.display === false) return;
    const { ctx } = chart;
    const fontSize = opts.fontSize;
    const padX = 7;
    const pillH = fontSize + 9;
    const tips = [];

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      if (dataset.directLabel === false) return;
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.hidden || !meta.visible || !meta.data?.length) return;
      const tip = lastFiniteElement(meta, dataset);
      if (!tip) return;
      tips.push({
        x: tip.el.x,
        y: tip.el.y,
        text: opts.format(tip.value, dataset, tip.index),
        color: dataset.directLabelColor || dataset.borderColor || "#888",
      });
    });

    tips.sort((a, b) => a.y - b.y);
    const minGap = pillH + 3;
    for (let i = 1; i < tips.length; i += 1) {
      if (tips[i].y - tips[i - 1].y < minGap) {
        tips[i].y = tips[i - 1].y + minGap;
      }
    }

    ctx.save();
    ctx.font = font(fontSize);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    tips.forEach((tip) => {
      const w = Math.ceil(ctx.measureText(tip.text).width + padX * 2);
      const x = tip.x + opts.gap;
      const y = tip.y - pillH / 2;
      roundedRectPath(ctx, x, y, w, pillH, 6);
      ctx.fillStyle = tip.color;
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(tip.text, x + w / 2, tip.y + 0.5);
    });
    ctx.restore();
  },
};

/**
 * Value text at the end of each bar (outside the bar, on the side it grows
 * towards). Datasets opt in with `valueLabels: true`.
 */
export const barValueLabelsPlugin = {
  id: "barValueLabels",
  defaults: {
    fontSize: 11,
    offset: 6,
    color: null,
    format: (value) => String(value),
  },
  afterDatasetsDraw(chart, _args, opts) {
    if (opts?.display === false) return;
    const { ctx } = chart;
    const horizontal = chart.options.indexAxis === "y";

    ctx.save();
    ctx.font = font(opts.fontSize);
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      if (!dataset.valueLabels) return;
      const meta = chart.getDatasetMeta(datasetIndex);
      if (meta.hidden || !meta.visible || meta.type !== "bar") return;

      meta.data.forEach((bar, index) => {
        const value = dataset.data[index];
        if (value == null || !Number.isFinite(Number(value))) return;
        if (!Number.isFinite(bar.x) || !Number.isFinite(bar.y)) return;
        const text = opts.format(Number(value), index, dataset);
        if (!text) return;

        const negative = horizontal ? bar.x < bar.base : bar.y > bar.base;
        const color =
          typeof opts.color === "function"
            ? opts.color(Number(value), index, dataset)
            : opts.color || chart.options.color;
        ctx.fillStyle = color;

        if (horizontal) {
          ctx.textAlign = negative ? "right" : "left";
          ctx.textBaseline = "middle";
          const x = negative ? bar.x - opts.offset : bar.x + opts.offset;
          ctx.fillText(text, x, bar.y);
        } else {
          ctx.textAlign = "center";
          ctx.textBaseline = negative ? "top" : "bottom";
          const y = negative ? bar.y + opts.offset : bar.y - opts.offset;
          ctx.fillText(text, bar.x, y);
        }
      });
    });
    ctx.restore();
  },
};

/**
 * Scriptable fill that fades from `color` at the top of the chart area to
 * transparent at the bottom.
 */
export function areaGradient(color, { top = 0.28, bottom = 0 } = {}) {
  return (context) => {
    const { chart } = context;
    const area = chart.chartArea;
    if (!area) return withAlpha(color, top / 2);
    const gradient = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
    gradient.addColorStop(0, withAlpha(color, top));
    gradient.addColorStop(1, withAlpha(color, bottom));
    return gradient;
  };
}

/**
 * Scriptable `fill` for a series that crosses zero: `aboveColor` fills the
 * area above the axis and `belowColor` the area beneath, each fading to the
 * zero line.
 */
export function zeroFill(aboveColor, belowColor, { strength = 0.3 } = {}) {
  return (context) => {
    const { chart } = context;
    const area = chart.chartArea;
    const yScale = chart.scales?.y;
    if (!area || !yScale) {
      return {
        target: "origin",
        above: withAlpha(aboveColor, strength / 2),
        below: withAlpha(belowColor, strength / 2),
      };
    }
    const zero = Math.min(
      area.bottom,
      Math.max(area.top, yScale.getPixelForValue(0))
    );
    const above = chart.ctx.createLinearGradient(0, area.top, 0, zero);
    above.addColorStop(0, withAlpha(aboveColor, strength));
    above.addColorStop(1, withAlpha(aboveColor, 0.02));
    const below = chart.ctx.createLinearGradient(0, zero, 0, area.bottom);
    below.addColorStop(0, withAlpha(belowColor, 0.02));
    below.addColorStop(1, withAlpha(belowColor, strength));
    return { target: "origin", above, below };
  };
}

/** Line segments recoloured by sign, for use as `segment.borderColor`. */
export function signedSegmentColor(aboveColor, belowColor) {
  return (ctx) => {
    const a = ctx.p0?.parsed?.y;
    const b = ctx.p1?.parsed?.y;
    if (!Number.isFinite(a) || !Number.isFinite(b)) return undefined;
    return (a + b) / 2 < 0 ? belowColor : aboveColor;
  };
}

/** Dims every dataset except the hovered one; restores on leave. */
export function focusDatasetOnHover(baseColors, { dimAlpha = 0.18 } = {}) {
  return (event, elements, chart) => {
    const hit = event?.type === "mouseout" ? null : elements?.[0];
    const focusIndex = hit ? hit.datasetIndex : null;
    if (chart.$focusIndex === focusIndex) return;
    chart.$focusIndex = focusIndex;
    chart.data.datasets.forEach((dataset, index) => {
      const base = baseColors[index];
      if (!base) return;
      const dim = focusIndex != null && index !== focusIndex;
      dataset.borderColor = dim ? withAlpha(base.border, dimAlpha) : base.border;
      dataset.backgroundColor = dim
        ? withAlpha(base.border, 0.04)
        : base.fill;
      if (dataset.pointBackgroundColor) {
        dataset.pointBackgroundColor = dim
          ? withAlpha(base.border, dimAlpha)
          : base.border;
      }
    });
    chart.update("none");
  };
}

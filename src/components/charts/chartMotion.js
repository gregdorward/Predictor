const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Bars rise one after another. Replays on data changes (mode "default") but
 * not on hover or resize.
 */
export function staggeredBars({ step = 35, duration = 650 } = {}) {
  if (prefersReducedMotion()) return { animation: false };
  return {
    animation: {
      duration,
      easing: "easeOutQuart",
      delay(context) {
        if (context.type !== "data" || context.mode !== "default") return 0;
        return context.dataIndex * step + context.datasetIndex * step * 1.5;
      },
    },
  };
}

/** Diverging bars grow out of the centre line, top row first. */
export function growFromZero({ step = 45, duration = 800 } = {}) {
  if (prefersReducedMotion()) return { animation: false };
  return {
    animation: {
      duration,
      easing: "easeOutCubic",
      delay(context) {
        if (context.type !== "data" || context.mode !== "default") return 0;
        return context.dataIndex * step;
      },
    },
  };
}

/**
 * Lines draw left to right, point by point, as in the Chart.js
 * "progressive line" sample. Each dataset starts slightly after the previous.
 */
export function progressiveLine({
  points = 10,
  duration = 900,
  datasetOffset = 120,
} = {}) {
  if (prefersReducedMotion()) return { animation: false };

  const step = duration / Math.max(1, points);
  const startDelay = (ctx) =>
    ctx.index * step + (ctx.datasetIndex || 0) * datasetOffset;

  const previousY = (ctx) => {
    if (ctx.index === 0) {
      const yScale = ctx.chart.scales.y;
      if (!yScale) return 0;
      const base = Math.min(Math.max(0, yScale.min), yScale.max);
      return yScale.getPixelForValue(base);
    }
    const prev = ctx.chart
      .getDatasetMeta(ctx.datasetIndex)
      .data[ctx.index - 1];
    return prev ? prev.getProps(["y"], true).y : 0;
  };

  return {
    animations: {
      x: {
        type: "number",
        easing: "linear",
        duration: step,
        from: NaN,
        delay(ctx) {
          if (ctx.type !== "data" || ctx.xStarted) return 0;
          ctx.xStarted = true;
          return startDelay(ctx);
        },
      },
      y: {
        type: "number",
        easing: "linear",
        duration: step,
        from: previousY,
        delay(ctx) {
          if (ctx.type !== "data" || ctx.yStarted) return 0;
          ctx.yStarted = true;
          return startDelay(ctx);
        },
      },
    },
  };
}

/** Radar points travel out from the centre, spoke by spoke. */
export function radialReveal({ step = 40, duration = 750 } = {}) {
  if (prefersReducedMotion()) return { animation: false };
  return {
    animation: {
      duration,
      easing: "easeOutQuart",
      delay(context) {
        if (context.type !== "data" || context.mode !== "default") return 0;
        return context.dataIndex * step + context.datasetIndex * 120;
      },
    },
  };
}

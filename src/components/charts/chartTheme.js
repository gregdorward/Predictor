import { useEffect, useState } from "react";

const FALLBACKS = {
  light: {
    color: "#020029",
    faint: "#454545",
    gridColor: "rgba(2, 0, 41, 0.08)",
    tooltipBackground: "#020029",
    home: "#01a501",
    away: "#d71200",
    accent: "#f57701",
    neutral: "#9a9a9a",
    reference: "rgba(2, 0, 41, 0.45)",
    band: "rgba(2, 0, 41, 0.04)",
    rampLow: "#ffd29a",
    rampHigh: "#c45a00",
    surface: "#ffffff",
  },
  dark: {
    color: "#ffffff",
    faint: "#c7c7c7",
    gridColor: "rgba(255, 255, 255, 0.08)",
    tooltipBackground: "#1f1f1f",
    home: "#1fb83a",
    away: "#ec3a28",
    accent: "#f57701",
    neutral: "#7a7a7a",
    reference: "rgba(255, 255, 255, 0.5)",
    band: "rgba(255, 255, 255, 0.05)",
    rampLow: "#5a3204",
    rampHigh: "#ffa340",
    surface: "#000000",
  },
};

const CSS_VARS = {
  color: "--chart-text",
  faint: "--chart-text-faint",
  gridColor: "--chart-grid",
  tooltipBackground: "--chart-tooltip-bg",
  home: "--chart-home",
  away: "--chart-away",
  accent: "--chart-accent",
  neutral: "--chart-neutral",
  reference: "--chart-reference",
  band: "--chart-band",
  rampLow: "--chart-ramp-low",
  rampHigh: "--chart-ramp-high",
  surface: "--background-color",
};

export function resolveChartTheme() {
  if (typeof document === "undefined") return "light";
  return document.body.classList.contains("dark-mode") ? "dark" : "light";
}

export function useChartTheme() {
  const [theme, setTheme] = useState(resolveChartTheme);

  useEffect(() => {
    const syncTheme = () => setTheme(resolveChartTheme());
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return theme;
}

/**
 * Chart palette for the active theme. Values come from the `--chart-*` custom
 * properties in index.css, falling back to the documented defaults when the
 * stylesheet is unavailable (SSR, jsdom).
 */
export function getChartColors(theme = resolveChartTheme()) {
  const fallback = FALLBACKS[theme === "dark" ? "dark" : "light"];
  if (typeof document === "undefined" || typeof window === "undefined") {
    return { ...fallback };
  }

  const styles = window.getComputedStyle(document.body);
  const colors = {};
  for (const [key, cssVar] of Object.entries(CSS_VARS)) {
    const value = styles.getPropertyValue(cssVar).trim();
    colors[key] = value || fallback[key];
  }
  return colors;
}

function parseHex(hex) {
  const value = String(hex || "").trim().replace("#", "");
  if (!/^[0-9a-f]{3,8}$/i.test(value)) return null;
  const full =
    value.length <= 4
      ? value
          .slice(0, 3)
          .split("")
          .map((c) => c + c)
          .join("")
      : value.slice(0, 6);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export function withAlpha(color, alpha) {
  const rgb = parseHex(color);
  if (!rgb) return color;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

/** Interpolate the single-hue accent ramp; `t` is 0 (low) to 1 (high). */
export function rampColor(colors, t) {
  const low = parseHex(colors.rampLow);
  const high = parseHex(colors.rampHigh);
  if (!low || !high) return colors.accent;
  const k = Math.min(1, Math.max(0, Number(t) || 0));
  const mix = low.map((channel, index) =>
    Math.round(channel + (high[index] - channel) * k)
  );
  return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
}

export function tooltipStyle(colors) {
  return {
    backgroundColor: colors.tooltipBackground,
    titleColor: "#ffffff",
    bodyColor: "#ffffff",
    footerColor: "rgba(255, 255, 255, 0.75)",
  };
}

import { useEffect, useMemo, useState } from "react";
import Collapsable from "./CollapsableElement";
import { RadarChart } from "./Chart";
import ShareableVisual from "./ShareableVisual";
import { sanitizeImageFilename } from "../utils/captureElementImage";
import {
  MAX_RADAR_METRICS,
  MIN_RADAR_METRICS,
  RADAR_PRESETS,
  applyPresetKeys,
  buildRadarSeries,
  getAvailableMetrics,
  getAvailableMetricsByCategory,
  toggleMetricSelection,
} from "../logic/customRadarMetrics";

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

function CustomRadarComparison({
  unlocked,
  homeTeam,
  awayTeam,
  homeStats,
  awayStats,
  homeForm,
  awayForm,
}) {
  const isNarrow = useMediaQuery("(max-width: 640px)");

  const availableMetrics = useMemo(
    () => getAvailableMetrics(homeStats, awayStats, homeForm, awayForm),
    [homeStats, awayStats, homeForm, awayForm]
  );

  const availableKeys = useMemo(
    () => availableMetrics.map((m) => m.key),
    [availableMetrics]
  );

  const groupedMetrics = useMemo(
    () =>
      getAvailableMetricsByCategory(homeStats, awayStats, homeForm, awayForm),
    [homeStats, awayStats, homeForm, awayForm]
  );

  const defaultSelection = useMemo(() => {
    const attacking = RADAR_PRESETS.find((p) => p.id === "attacking");
    const fromPreset = applyPresetKeys(attacking?.keys || [], availableKeys);
    if (fromPreset.length >= MIN_RADAR_METRICS) return fromPreset;
    return availableKeys.slice(0, Math.min(MAX_RADAR_METRICS, 6));
  }, [availableKeys]);

  const [selectedKeys, setSelectedKeys] = useState(defaultSelection);
  const [activePreset, setActivePreset] = useState("attacking");

  // Keep selection valid when available metrics change (e.g. SofaScore loads later)
  const resolvedSelection = useMemo(() => {
    const availableSet = new Set(availableKeys);
    const filtered = selectedKeys.filter((key) => availableSet.has(key));
    if (filtered.length > 0) return filtered;
    if (defaultSelection.length >= MIN_RADAR_METRICS) return defaultSelection;
    return availableKeys.slice(
      0,
      Math.min(MAX_RADAR_METRICS, availableKeys.length)
    );
  }, [selectedKeys, availableKeys, defaultSelection]);

  const series = useMemo(
    () =>
      buildRadarSeries(
        resolvedSelection,
        homeStats,
        awayStats,
        homeForm,
        awayForm
      ),
    [resolvedSelection, homeStats, awayStats, homeForm, awayForm]
  );

  const atMax = resolvedSelection.length >= MAX_RADAR_METRICS;
  const canShowChart = resolvedSelection.length >= MIN_RADAR_METRICS;

  const handlePreset = (preset) => {
    const next = applyPresetKeys(preset.keys, availableKeys);
    if (next.length < MIN_RADAR_METRICS) return;
    setSelectedKeys(next);
    setActivePreset(preset.id);
  };

  const handleToggle = (key) => {
    setActivePreset(null);
    setSelectedKeys((prev) => {
      const base =
        prev.filter((k) => availableKeys.includes(k)).length > 0
          ? prev.filter((k) => availableKeys.includes(k))
          : resolvedSelection;
      return toggleMetricSelection(base, key, availableKeys);
    });
  };

  const shareSlug =
    activePreset && RADAR_PRESETS.find((p) => p.id === activePreset)
      ? `${activePreset}-radar`
      : "custom-radar";

  if (!unlocked) {
    return (
      <div className="CustomRadarLocked">
        <Collapsable
          locked
          buttonText={`Build a radar \u{2630}`}
          classNameButton="TeamStylesButton"
          element={<div />}
        />
        <p className="CustomRadarLockedHint">
          Free on the first 5 fixtures of the day
        </p>
      </div>
    );
  }

  return (
    <Collapsable
      buttonText={`Build a radar \u{2630}`}
      classNameButton="TeamStylesButton"
      classNameTwo="CustomRadarPanel"
      element={
        <div className="CustomRadarBuilder">
          <p className="CustomRadarIntro">
            Pick 3–10 metrics to compare {homeTeam} and {awayTeam}. Use a preset
            for a focused view, then tweak the chips.
          </p>

          <div className="CustomRadarPresetGroup">
            <h5 className="CustomRadarGroupTitle">Presets</h5>
            <div className="CustomRadarPresets" role="group" aria-label="Radar presets">
              {RADAR_PRESETS.map((preset) => {
                const keys = applyPresetKeys(preset.keys, availableKeys);
                const disabled = keys.length < MIN_RADAR_METRICS;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`CustomRadarPresetBtn${
                      activePreset === preset.id
                        ? " CustomRadarPresetBtn--active"
                        : ""
                    }`}
                    disabled={disabled}
                    onClick={() => handlePreset(preset)}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="CustomRadarCounter" aria-live="polite">
            {resolvedSelection.length} / {MAX_RADAR_METRICS} selected
          </div>

          <div className="CustomRadarGroups">
            {groupedMetrics.map((group) => (
              <div key={group.id} className="CustomRadarGroup">
                <h5 className="CustomRadarGroupTitle">{group.label}</h5>
                <div className="CustomRadarChips">
                  {group.metrics.map((metric) => {
                    const selected = resolvedSelection.includes(metric.key);
                    const disabled = atMax && !selected;
                    return (
                      <button
                        key={metric.key}
                        type="button"
                        className={`Competition__comparisonTeamChip${
                          selected
                            ? " Competition__comparisonTeamChip--active"
                            : ""
                        }`}
                        aria-pressed={selected}
                        disabled={disabled}
                        onClick={() => handleToggle(metric.key)}
                      >
                        {metric.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!canShowChart ? (
            <p className="CustomRadarHint">Select at least 3 metrics</p>
          ) : (
            <ShareableVisual
              className="CustomRadarShare"
              filename={sanitizeImageFilename(
                `${homeTeam}-vs-${awayTeam}-${shareSlug}`
              )}
              shareTitle={`${homeTeam} vs ${awayTeam} - ${shareSlug.replace(
                /-/g,
                " "
              )}`}
            >
              <div data-share-capture className="CustomRadarCapture">
                <div className="CustomRadarChartWrap">
                  <RadarChart
                    title={`${homeTeam} vs ${awayTeam}`}
                    subtitle="Outward = stronger on each axis"
                    max={1}
                    maintainAspectRatio={false}
                    abbreviateLabels
                    abbreviateLongLabelsOnly
                    abbreviateMaxLength={isNarrow ? 8 : 10}
                    pointLabelFontSize={isNarrow ? 10 : 11}
                    pointLabelPadding={isNarrow ? 6 : 10}
                    layoutPadding={
                      isNarrow
                        ? { top: 4, right: 12, bottom: 16, left: 12 }
                        : 28
                    }
                    labels={series.labels}
                    data={series.homeData}
                    data2={series.awayData}
                    team1={homeTeam}
                    team2={awayTeam}
                    rawTooltipLabels={series.rawLabels}
                  />
                </div>
              </div>
            </ShareableVisual>
          )}
        </div>
      }
    />
  );
}

export default CustomRadarComparison;

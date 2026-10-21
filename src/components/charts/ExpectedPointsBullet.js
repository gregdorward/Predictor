import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import LazyChart from "./LazyChart";

const DEFAULT_MAX_POINTS = 15;

function clampRatio(value, max) {
  const n = Number(value);
  if (!Number.isFinite(n) || max <= 0) return 0;
  return Math.min(1, Math.max(0, n / max));
}

function BulletRow({ team, actual, expected, delta, maxPoints }) {
  const resolvedDelta = Number.isFinite(Number(delta))
    ? Number(delta)
    : Number(actual) - Number(expected);
  const magnitude = Math.abs(resolvedDelta).toFixed(1);
  const level = magnitude === "0.0";
  const over = resolvedDelta > 0;
  let tone = over ? "is-over" : "is-under";
  let Icon = over ? TrendingUp : TrendingDown;
  let label = `${over ? "+" : "−"}${magnitude} pts ${over ? "above" : "below"} the odds`;
  if (level) {
    tone = "is-level";
    Icon = Minus;
    label = "In line with the odds";
  }

  return (
    <div className="PointsBullet-row">
      <div className="PointsBullet-rowHeader">
        <span className="PointsBullet-team">{team}</span>
        <span className={`PointsBullet-delta ${tone}`}>
          <Icon size={14} strokeWidth={2.25} aria-hidden="true" />
          {label}
        </span>
      </div>
      <div
        className="PointsBullet-track"
        role="img"
        aria-label={`${team}: ${actual} points won, ${Number(expected).toFixed(1)} expected from the odds`}
      >
        <span
          className="PointsBullet-bar"
          style={{ "--bullet-scale": clampRatio(actual, maxPoints) }}
        />
        <span
          className="PointsBullet-target"
          style={{ left: `${clampRatio(expected, maxPoints) * 100}%` }}
        />
      </div>
      <div className="PointsBullet-values">
        <span>
          Won <strong>{Number(actual).toFixed(0)}</strong>
        </span>
        <span>
          Expected <strong>{Number(expected).toFixed(1)}</strong>
        </span>
      </div>
    </div>
  );
}

/**
 * Bullet chart: points actually won (bar) against points the bookmakers'
 * implied probabilities expected (tick), one row per team.
 */
export default function ExpectedPointsBullet({
  rows,
  maxPoints = DEFAULT_MAX_POINTS,
}) {
  const validRows = (rows || []).filter(
    (row) =>
      Number.isFinite(Number(row?.actual)) &&
      Number.isFinite(Number(row?.expected))
  );
  if (!validRows.length) return null;

  const ticks = [0, maxPoints / 3, (maxPoints * 2) / 3, maxPoints].map((t) =>
    Math.round(t)
  );

  return (
    <div className="PointsBullet">
      <LazyChart>
        <div className="PointsBullet-rows">
          {validRows.map((row) => (
            <BulletRow key={row.team} maxPoints={maxPoints} {...row} />
          ))}
        </div>
      </LazyChart>
      <div className="PointsBullet-scale" aria-hidden="true">
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
      <div className="PointsBullet-key" aria-hidden="true">
        <span className="PointsBullet-keyItem">
          <span className="PointsBullet-keyBar" />
          Points won
        </span>
        <span className="PointsBullet-keyItem">
          <span className="PointsBullet-keyTick" />
          Expected from the odds
        </span>
      </div>
    </div>
  );
}

import LazyChart from "./LazyChart";

const PIE_FILL = {
  home: "#1fb83a",
  draw: "#8a8a8a",
  away: "#ec3a28",
  accent: "#fe8c00",
  neutral: "#8a8a8a",
};

function pieSlicePath(cx, cy, radius, start, end) {
  const x1 = cx + radius * Math.cos(start);
  const y1 = cy + radius * Math.sin(start);
  const x2 = cx + radius * Math.cos(end);
  const y2 = cy + radius * Math.sin(end);
  const large = end - start > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`;
}

function SplitPie({ segments }) {
  const slices = segments.filter((segment) => segment.share > 0);
  const size = 72;
  const center = size / 2;
  const radius = size / 2 - 0.5;
  let angle = -Math.PI / 2;

  return (
    <svg
      className="FixtureSocialCard-pie"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={segments
        .map((segment) => `${segment.label} ${Number(segment.value).toFixed(1)}%`)
        .join(", ")}
    >
      {slices.map((segment) => {
        const sweep = (segment.share / 100) * Math.PI * 2;
        const start = angle;
        const end = angle + sweep;
        angle = end;
        const fill = PIE_FILL[segment.tone] || PIE_FILL.neutral;
        if (sweep >= Math.PI * 2 - 0.001) {
          return <circle key={segment.label} cx={center} cy={center} r={radius} fill={fill} />;
        }
        return (
          <path
            key={segment.label}
            d={pieSlicePath(center, center, radius, start, end)}
            fill={fill}
          />
        );
      })}
    </svg>
  );
}

/**
 * 100% split bar with large inline percentages. `segments` is a list of
 * `{ label, value, tone }`, where tone is home | draw | away | accent | neutral.
 * `eager` draws the bar immediately. The share card is kept off-screen, so a
 * lazy bar there never mounts.
 */
export default function SplitBar({ segments, caption, eager = false, graphic = "bar" }) {
  const valid = (segments || []).filter((s) => Number.isFinite(Number(s?.value)));
  const total = valid.reduce((sum, s) => sum + Math.max(0, Number(s.value)), 0);
  if (!valid.length || total <= 0) return null;

  const withShare = valid.map((segment) => ({
    ...segment,
    share: (Math.max(0, Number(segment.value)) / total) * 100,
  }));
  const leader = withShare.reduce((best, s) => (s.share > best.share ? s : best));
  const trackLabel = withShare
    .map((segment) => `${segment.label} ${Number(segment.value).toFixed(1)}%`)
    .join(", ");
  const track = (
    <div className="SplitBar-track" role="img" aria-label={trackLabel}>
      {withShare
        .filter((segment) => segment.share > 0)
        .map((segment, index) => (
          <span
            key={segment.label}
            className={`SplitBar-segment SplitBar-segment--${segment.tone}`}
            style={{ flexGrow: segment.share, animationDelay: `${index * 90}ms` }}
          />
        ))}
    </div>
  );

  return (
    <div className="SplitBar">
      <div className="SplitBar-figures">
        {withShare.map((segment) => (
          <div
            key={segment.label}
            className={`SplitBar-figure SplitBar-figure--${segment.tone}${
              segment === leader ? " is-leader" : ""
            }`}
          >
            <span className="SplitBar-value">{Number(segment.value).toFixed(1)}%</span>
            <span className="SplitBar-label" title={segment.label}>
              <span className="SplitBar-labelText">{segment.label}</span>
            </span>
          </div>
        ))}
      </div>
      {graphic === "pie" ? (
        <SplitPie segments={withShare} />
      ) : eager ? (
        track
      ) : (
        <LazyChart height="14px">{track}</LazyChart>
      )}
      {caption ? <p className="SplitBar-caption">{caption}</p> : null}
    </div>
  );
}

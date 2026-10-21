import { CreateBadge } from "./createBadge";
import SplitBar from "./charts/SplitBar";

function TeamSide({ name, badge, align }) {
  return (
    <div className={`FixtureSocialCard-team FixtureSocialCard-team--${align}`}>
      <CreateBadge image={badge || "-"} ClassName="FixtureSocialCard-badge" alt="" />
      <span className="FixtureSocialCard-teamName">{name}</span>
    </div>
  );
}

function marketNumber(value) {
  if (value == null || value === "" || value === "-") return null;
  const number = Number(String(value).replace(/%/g, "").trim());
  return Number.isFinite(number) ? number : null;
}

function clampShare(value) {
  if (value == null) return 0;
  return Math.max(0, Math.min(100, value)) / 100;
}

function annularSector(cx, cy, inner, outer, start, sweep) {
  const a0 = start * Math.PI * 2 - Math.PI / 2;
  const a1 = (start + sweep) * Math.PI * 2 - Math.PI / 2;
  const large = sweep > 0.5 ? 1 : 0;
  const point = (radius, angle) => [
    cx + radius * Math.cos(angle),
    cy + radius * Math.sin(angle),
  ];
  const [x0, y0] = point(outer, a0);
  const [x1, y1] = point(outer, a1);
  const [x2, y2] = point(inner, a1);
  const [x3, y3] = point(inner, a0);
  return `M ${x0} ${y0} A ${outer} ${outer} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${inner} ${inner} 0 ${large} 0 ${x3} ${y3} Z`;
}

function TeamMarketPie({ market, value, tone }) {
  const share = clampShare(marketNumber(value));
  const size = 100;
  const center = size / 2;
  const inner = 32;
  const outer = 46;
  const mid = (inner + outer) / 2;
  const color = tone === "home" ? "#1fb83a" : "#ec3a28";

  return (
    <figure className="FixtureSocialCard-marketPie">
      <div className="FixtureSocialCard-marketPieGraphic">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          role="img"
          aria-label={`${market}, ${tone} ${value}`}
        >
          <circle
            cx={center}
            cy={center}
            r={mid}
            fill="none"
            stroke="rgba(255,255,255,0.14)"
            strokeWidth={outer - inner}
          />
          {share >= 0.999 ? (
            <circle
              cx={center}
              cy={center}
              r={mid}
              fill="none"
              stroke={color}
              strokeWidth={outer - inner}
            />
          ) : share > 0 ? (
            <path
              d={annularSector(center, center, inner, outer, 0, share)}
              fill={color}
            />
          ) : null}
        </svg>
        <span
          className={`FixtureSocialCard-marketPieLabel FixtureSocialCard-marketPieLabel--${tone}`}
        >
          {value}
        </span>
      </div>
    </figure>
  );
}

function MarketPair({ label, homeValue, awayValue }) {
  return (
    <div className="FixtureSocialCard-marketPair">
      <span className="FixtureSocialCard-marketPairLabel">{label}</span>
      <div className="FixtureSocialCard-marketPairPies">
        <TeamMarketPie market={label} value={homeValue} tone="home" />
        <TeamMarketPie market={label} value={awayValue} tone="away" />
      </div>
    </div>
  );
}

function StrengthRow({ label, homeShare, awayShare, homeLabel, awayLabel }) {
  return (
    <div className="FixtureSocialCard-strengthRow">
      <span className="FixtureSocialCard-strengthLabel">{label}</span>
      <span className="FixtureSocialCard-strengthValue">{homeLabel}</span>
      <span className="FixtureSocialCard-strengthTrack" aria-hidden="true">
        <span
          className="FixtureSocialCard-strengthFill FixtureSocialCard-strengthFill--home"
          style={{ width: `${homeShare}%` }}
        />
        <span
          className="FixtureSocialCard-strengthFill FixtureSocialCard-strengthFill--away"
          style={{ width: `${awayShare}%` }}
        />
      </span>
      <span className="FixtureSocialCard-strengthValue">{awayLabel}</span>
    </div>
  );
}

export default function FixtureSocialShareCard({ data }) {
  if (!data?.homeName || !data?.awayName) return null;

  return (
    <article className="FixtureSocialCard" data-share-capture>
      <header className="FixtureSocialCard-header">
        <p className="FixtureSocialCard-league">{data.league || "Football match"}</p>
        {data.kickOff ? <p className="FixtureSocialCard-kickoff">{data.kickOff}</p> : null}
      </header>

      <div className="FixtureSocialCard-matchup">
        <TeamSide name={data.homeName} badge={data.homeBadge} align="home" />
        <div className="FixtureSocialCard-score">
          {data.predictedScore ? (
            <>
              <span className="FixtureSocialCard-scoreValue">
                {data.predictedScore.home}
                <span className="FixtureSocialCard-scoreDash">-</span>
                {data.predictedScore.away}
              </span>
              <span className="FixtureSocialCard-scoreLabel">Predicted score</span>
            </>
          ) : (
            <span className="FixtureSocialCard-vs">v</span>
          )}
        </div>
        <TeamSide name={data.awayName} badge={data.awayBadge} align="away" />
      </div>

      <div className="FixtureSocialCard-grid">
        {data.model ? (
          <section className="FixtureSocialCard-panel">
            <h3 className="FixtureSocialCard-panelTitle">Model</h3>
            <SplitBar
              graphic="pie"
              segments={[
                { label: data.homeName, value: data.model.homeWin, tone: "home" },
                { label: "Draw", value: data.model.draw, tone: "draw" },
                { label: data.awayName, value: data.model.awayWin, tone: "away" },
              ]}
              caption={data.model.caption}
            />
          </section>
        ) : null}

        {data.strengths ? (
          <section className="FixtureSocialCard-panel">
            <h3 className="FixtureSocialCard-panelTitle">Strength</h3>
            <StrengthRow
              label="Attack"
              homeShare={data.strengths.homeAttackShare}
              awayShare={data.strengths.awayAttackShare}
              homeLabel={data.strengths.homeAttackLabel}
              awayLabel={data.strengths.awayAttackLabel}
            />
            <StrengthRow
              label="Defence"
              homeShare={data.strengths.homeDefenceShare}
              awayShare={data.strengths.awayDefenceShare}
              homeLabel={data.strengths.homeDefenceLabel}
              awayLabel={data.strengths.awayDefenceLabel}
            />
            {data.strengths.caption ? (
              <p className="FixtureSocialCard-note">{data.strengths.caption}</p>
            ) : null}
          </section>
        ) : null}

        {data.markets?.length ? (
          <section className="FixtureSocialCard-panel">
            <h3 className="FixtureSocialCard-panelTitle">Recent markets</h3>
            <div className="FixtureSocialCard-marketPies">
              {data.markets.map((row) => (
                <MarketPair
                  key={row.label}
                  label={row.label === "Over 2.5" ? "O2.5" : row.label}
                  homeValue={row.homeValue}
                  awayValue={row.awayValue}
                />
              ))}
            </div>
          </section>
        ) : null}

        {data.headToHead ? (
          <section className="FixtureSocialCard-panel FixtureSocialCard-panel--wide">
            <h3 className="FixtureSocialCard-panelTitle">Head to head</h3>
            <SplitBar
              eager
              segments={[
                { label: data.homeName, value: data.headToHead.home, tone: "home" },
                { label: "Draws", value: data.headToHead.draw, tone: "draw" },
                { label: data.awayName, value: data.headToHead.away, tone: "away" },
              ]}
              caption={data.headToHead.caption}
            />
          </section>
        ) : null}
      </div>

      <footer className="FixtureSocialCard-brand">
        <span className="FixtureSocialCard-brandMark" aria-hidden="true" />
        <span className="FixtureSocialCard-brandMeta">
          <span className="FixtureSocialCard-brandName">Soccer Stats Hub</span>
          <span className="FixtureSocialCard-brandUrl">soccerstatshub.com</span>
        </span>
      </footer>
    </article>
  );
}

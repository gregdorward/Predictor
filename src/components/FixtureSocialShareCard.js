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

function marketShares(homeValue, awayValue) {
  const home = marketNumber(homeValue);
  const away = marketNumber(awayValue);
  if (home == null || away == null) return null;
  const homeBar = Math.max(0, home);
  const awayBar = Math.max(0, away);
  const total = homeBar + awayBar;
  if (total <= 0) return [50, 50];
  return [(homeBar / total) * 100, (awayBar / total) * 100];
}

function StrengthRow({ label, homeShare, awayShare, homeLabel, awayLabel, wideLabel = false }) {
  return (
    <div className="FixtureSocialCard-strengthRow">
      <span
        className={`FixtureSocialCard-strengthLabel${
          wideLabel ? " FixtureSocialCard-strengthLabel--wide" : ""
        }`}
      >
        {label}
      </span>
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
            {data.markets.map((row) => {
              const shares = marketShares(row.homeValue, row.awayValue);
              return (
                <StrengthRow
                  key={row.label}
                  wideLabel
                  label={row.label}
                  homeShare={shares ? shares[0] : 0}
                  awayShare={shares ? shares[1] : 0}
                  homeLabel={row.homeValue}
                  awayLabel={row.awayValue}
                />
              );
            })}
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

import { useEffect, useState } from "react";
import bracketData from "../data/worldcup2026/predicted-bracket.json";

/** Collapse to list view on narrow screens where the tree layout is unusable. */
function usePreferListBracketView() {
  const [preferList, setPreferList] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 599px)");
    const update = () => setPreferList(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return preferList;
}

function BracketMatchRow({ match, isFinal }) {
  const winnerIsHome = match.winner === match.home;
  const winnerIsAway = match.winner === match.away;

  return (
    <div
      className={`WC26__bracketMatch${isFinal ? " WC26__bracketMatch--final" : ""}`}
      data-match-id={match.id}
    >
      <div
        className={`WC26__bracketTeam${winnerIsHome ? " WC26__bracketTeam--winner" : ""}`}
      >
        {match.home}
      </div>
      <div
        className={`WC26__bracketTeam${winnerIsAway ? " WC26__bracketTeam--winner" : ""}`}
      >
        {match.away}
      </div>
    </div>
  );
}

/** Mobile-friendly round-by-round list (default on small screens). */
function BracketListView({ rounds, champion, championFlag }) {
  return (
    <div className="WC26__bracketList">
      {rounds.map((round) => (
        <section key={round.id} className="WC26__bracketRoundSection">
          <h3 className="WC26__bracketRoundTitle">{round.label}</h3>
          <div className="WC26__bracketRoundMatches">
            {round.matches.map((match) => (
              <BracketMatchRow
                key={match.id}
                match={match}
                isFinal={round.id === "final"}
              />
            ))}
          </div>
        </section>
      ))}
      <div className="WC26__bracketChampion">
        <span className="WC26__bracketChampionLabel">Predicted champion</span>
        <span className="WC26__flag WC26__flag--large">{championFlag}</span>
        <strong>{champion}</strong>
      </div>
    </div>
  );
}

/** Horizontal bracket columns — best on desktop; scrollable on smaller widths. */
function BracketTreeView({ rounds }) {
  return (
    <div className="WC26__bracketTreeScroll" aria-label="Predicted knockout bracket">
      <div className="WC26__bracketTree">
        {rounds.map((round) => (
          <div key={round.id} className="WC26__bracketColumn">
            <h3 className="WC26__bracketColumnTitle">{round.label}</h3>
            <div className="WC26__bracketColumnMatches">
              {round.matches.map((match) => (
                <BracketMatchRow
                  key={match.id}
                  match={match}
                  isFinal={round.id === "final"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Predicted knockout bracket with list view (mobile) and tree view (desktop) toggle.
 */
export default function WorldCup2026Bracket() {
  const [viewMode, setViewMode] = useState("list");
  const preferList = usePreferListBracketView();
  const effectiveView = preferList ? "list" : viewMode;
  const { rounds, predictedChampion, predictedChampionFlag, note } = bracketData;

  return (
    <div className="WC26__section">
      <p className="WC26__matchesNote">{note}</p>

      {!preferList && (
        <div className="WC26__bracketViewToggle">
          <button
            type="button"
            className={`WC26__phaseFilter${effectiveView === "list" ? " WC26__phaseFilter--active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            Round by round
          </button>
          <button
            type="button"
            className={`WC26__phaseFilter${effectiveView === "tree" ? " WC26__phaseFilter--active" : ""}`}
            onClick={() => setViewMode("tree")}
          >
            Bracket view
          </button>
        </div>
      )}

      {!preferList && (
        <p className="WC26__bracketMobileHint">
          Round-by-round view is easiest on mobile. Bracket view works best on a wider screen.
        </p>
      )}

      {effectiveView === "list" ? (
        <BracketListView
          rounds={rounds}
          champion={predictedChampion}
          championFlag={predictedChampionFlag}
        />
      ) : (
        <>
          <BracketTreeView rounds={rounds} />
          <div className="WC26__bracketChampion WC26__bracketChampion--tree">
            <span className="WC26__bracketChampionLabel">Predicted champion</span>
            <span className="WC26__flag WC26__flag--large">{predictedChampionFlag}</span>
            <strong>{predictedChampion}</strong>
          </div>
        </>
      )}
    </div>
  );
}

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { apiGetUrl } from "../utils/apiUrl";
import { parseCupTreeResponse } from "../utils/worldCupBracket";

function formatScore(homeScore, awayScore) {
  if (homeScore == null || awayScore == null) {
    return null;
  }
  return `${homeScore} - ${awayScore}`;
}

function centerYRelativeToColumn(el, columnEl) {
  const columnRect = columnEl.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  return rect.top - columnRect.top + rect.height / 2;
}

function clearBracketPositioning(rounds, matchRefs, columnRefs) {
  for (let roundIndex = 0; roundIndex < rounds.length; roundIndex += 1) {
    const column = columnRefs.current[roundIndex];
    if (column) {
      column.style.minHeight = "";
    }
  }

  for (let roundIndex = 1; roundIndex < rounds.length; roundIndex += 1) {
    for (const match of rounds[roundIndex].matches) {
      const el = matchRefs.current[match.blockId];
      if (!el) {
        continue;
      }

      el.style.position = "";
      el.style.top = "";
      el.style.left = "";
      el.style.right = "";
      el.style.width = "";
      el.style.marginTop = "";
    }
  }
}

function getFeederElements(targetMatch, roundIndex, rounds, links, matchRefs) {
  const linkFeeders = links.filter((link) => link.toBlockId === targetMatch.blockId);
  const homeId = linkFeeders.find((link) => link.toSide === "home")?.fromBlockId;
  const awayId = linkFeeders.find((link) => link.toSide === "away")?.fromBlockId;

  if (homeId != null && awayId != null) {
    return {
      homeEl: matchRefs.current[homeId],
      awayEl: matchRefs.current[awayId],
    };
  }

  const prevRound = rounds[roundIndex - 1];
  const matchIndex = rounds[roundIndex].matches.findIndex(
    (match) => match.blockId === targetMatch.blockId
  );

  if (matchIndex < 0) {
    return { homeEl: null, awayEl: null };
  }

  return {
    homeEl: matchRefs.current[prevRound.matches[matchIndex * 2]?.blockId],
    awayEl: matchRefs.current[prevRound.matches[matchIndex * 2 + 1]?.blockId],
  };
}

/**
 * Position later-round matches midway between feeders, using round 0 as the
 * vertical track and absolute positioning inside each column.
 */
function alignBracketRounds(rounds, links, matchRefs, columnRefs) {
  clearBracketPositioning(rounds, matchRefs, columnRefs);

  const trackColumn = columnRefs.current[0];
  if (!trackColumn || rounds.length <= 1) {
    return;
  }

  const trackHeight = trackColumn.offsetHeight;

  for (let roundIndex = 1; roundIndex < rounds.length; roundIndex += 1) {
    const column = columnRefs.current[roundIndex];
    if (column) {
      column.style.minHeight = `${trackHeight}px`;
    }
  }

  for (let roundIndex = 1; roundIndex < rounds.length; roundIndex += 1) {
    const column = columnRefs.current[roundIndex];
    const round = rounds[roundIndex];

    if (!column) {
      continue;
    }

    for (const targetMatch of round.matches) {
      const { homeEl, awayEl } = getFeederElements(
        targetMatch,
        roundIndex,
        rounds,
        links,
        matchRefs
      );
      const targetEl = matchRefs.current[targetMatch.blockId];

      if (!homeEl || !awayEl || !targetEl) {
        continue;
      }

      const desiredCenter =
        (centerYRelativeToColumn(homeEl, trackColumn) +
          centerYRelativeToColumn(awayEl, trackColumn)) /
        2;
      const top = desiredCenter - targetEl.offsetHeight / 2;

      targetEl.style.position = "absolute";
      targetEl.style.left = "0";
      targetEl.style.right = "0";
      targetEl.style.top = `${Math.max(0, top)}px`;
    }
  }
}

function BracketMatch({ match, registerMatchRef }) {
  const score = formatScore(match.homeScore, match.awayScore);

  return (
    <div
      ref={registerMatchRef(match.blockId)}
      className={`WCBracket__match${match.isPlaceholder ? " WCBracket__match--placeholder" : ""}`}
      data-block-id={match.blockId}
      data-event-id={match.eventId || undefined}
    >
      <div
        className={`WCBracket__team${match.homeWinner ? " WCBracket__team--winner" : ""}`}
      >
        <span className="WCBracket__teamName">{match.homeTeam}</span>
        {score && <span className="WCBracket__score">{match.homeScore}</span>}
      </div>
      <div
        className={`WCBracket__team${match.awayWinner ? " WCBracket__team--winner" : ""}`}
      >
        <span className="WCBracket__teamName">{match.awayTeam}</span>
        {score && <span className="WCBracket__score">{match.awayScore}</span>}
      </div>
      {!score && match.isPlaceholder && (
        <span className="WCBracket__feeder">Fixture TBD</span>
      )}
      {!score && !match.isPlaceholder && !match.finished && (
        <span className="WCBracket__vs">vs</span>
      )}
    </div>
  );
}

function BracketTree({ rounds, links }) {
  const scrollRef = useRef(null);
  const matchRefs = useRef({});
  const columnRefs = useRef([]);

  const registerColumnRef = useCallback((roundIndex) => {
    return (element) => {
      columnRefs.current[roundIndex] = element;
    };
  }, []);

  const registerMatchRef = useCallback((blockId) => {
    return (element) => {
      if (!blockId) {
        return;
      }
      if (element) {
        matchRefs.current[blockId] = element;
      } else {
        delete matchRefs.current[blockId];
      }
    };
  }, []);

  const alignLayout = useCallback(() => {
    if (rounds.length <= 1) {
      return;
    }

    alignBracketRounds(rounds, links || [], matchRefs, columnRefs);
  }, [links, rounds]);

  useLayoutEffect(() => {
    alignLayout();
  }, [alignLayout]);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) {
      return undefined;
    }

    const observer = new ResizeObserver(() => alignLayout());
    observer.observe(scroll);
    window.addEventListener("resize", alignLayout);

    const frame = requestAnimationFrame(() => alignLayout());

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", alignLayout);
    };
  }, [alignLayout]);

  return (
    <div className="WCBracket__treeWrap">
      <div className="WCBracket__scroll" ref={scrollRef}>
        {rounds.map((round) => (
          <h4 key={`title-${round.id}`} className="WCBracket__roundTitle">
            {round.label}
          </h4>
        ))}
        {rounds.map((round, roundIndex) => (
          <div
            key={round.id}
            className={
              roundIndex === 0
                ? "WCBracket__roundMatches"
                : "WCBracket__roundMatches WCBracket__roundMatches--positioned"
            }
            ref={registerColumnRef(roundIndex)}
            aria-label={round.label}
          >
            {round.matches.map((match, index) => (
              <BracketMatch
                key={match.blockId ?? `${round.id}-${index}`}
                match={match}
                registerMatchRef={registerMatchRef}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Knockout bracket for World Cup 2026, loaded from daily-cached industry stat website cuptrees.
 */
export default function WorldCupKnockoutBracket({
  tournamentId = 16,
  seasonId = 58210,
}) {
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBracket() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          apiGetUrl(`cuptrees/${tournamentId}/${seasonId}`)
        );

        if (!response.ok) {
          throw new Error(`Bracket request failed (${response.status})`);
        }

        const raw = await response.json();
        if (!cancelled) {
          setBracket(parseCupTreeResponse(raw));
        }
      } catch (fetchError) {
        if (!cancelled) {
          console.warn("World Cup bracket load failed:", fetchError);
          setError(fetchError.message);
          setBracket({ name: null, currentRound: null, rounds: [], links: [] });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBracket();

    return () => {
      cancelled = true;
    };
  }, [tournamentId, seasonId]);

  if (loading) {
    return (
      <div className="WCBracket WCBracket--loading">
        <p>Loading knockout bracket…</p>
      </div>
    );
  }

  if (!bracket?.rounds?.length) {
    return (
      <div className="WCBracket WCBracket--empty">
        <h3 className="WCBracket__title">Knockout bracket</h3>
        <p>
          {error
            ? "Knockout bracket is temporarily unavailable."
            : "Knockout bracket will appear here once the Round of 32 is drawn."}
        </p>
      </div>
    );
  }

  return (
    <div className="WCBracket">
      <h3 className="WCBracket__title">
        {bracket.name || "Knockout bracket"}
      </h3>

      <BracketTree rounds={bracket.rounds} links={bracket.links} />
    </div>
  );
}

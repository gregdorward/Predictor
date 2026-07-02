import { useEffect, useMemo, useState } from "react";
import WorldCup2026MatchCard from "./WorldCup2026MatchCard";
import {
  MATCH_PHASE_LABELS,
  MATCH_PHASE_ORDER,
  groupMatchesByPhase,
  loadStaticMatchPredictions,
  mergeMatchPredictions,
  fetchWorldCupMatchUpdates,
} from "../utils/worldCup2026Matches";
import staticMatchData from "../data/worldcup2026/match-predictions.json";

/**
 * Key Matches tab: static JSON by default; optional API merge for tournament updates.
 */
export default function WorldCup2026MatchesTab() {
  const [matches, setMatches] = useState(() => loadStaticMatchPredictions());
  const [phaseFilter, setPhaseFilter] = useState("all");

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_EXPRESS_SERVER;
    if (!apiBase) return;

    let cancelled = false;
    fetchWorldCupMatchUpdates(apiBase).then((updates) => {
      if (cancelled || updates.length === 0) return;
      setMatches(mergeMatchPredictions(staticMatchData, updates));
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => groupMatchesByPhase(matches), [matches]);

  const availablePhases = MATCH_PHASE_ORDER.filter((phase) => grouped[phase]?.length);

  const visiblePhases =
    phaseFilter === "all"
      ? availablePhases
      : availablePhases.filter((p) => p === phaseFilter);

  return (
    <div className="WC26__section">
      <p className="WC26__matchesNote">
        Predictions are illustrative estimates aligned with SoccerStatsHub modelling.
        Match lists are updated as the tournament progresses - live fixture data is also
        available on the homepage during the World Cup.
      </p>

      {availablePhases.length > 1 && (
        <div className="WC26__phaseFilters" role="tablist" aria-label="Filter by round">
          <button
            type="button"
            className={`WC26__phaseFilter${phaseFilter === "all" ? " WC26__phaseFilter--active" : ""}`}
            onClick={() => setPhaseFilter("all")}
          >
            All rounds
          </button>
          {availablePhases.map((phase) => (
            <button
              key={phase}
              type="button"
              className={`WC26__phaseFilter${phaseFilter === phase ? " WC26__phaseFilter--active" : ""}`}
              onClick={() => setPhaseFilter(phase)}
            >
              {MATCH_PHASE_LABELS[phase] || phase}
            </button>
          ))}
        </div>
      )}

      {visiblePhases.map((phase) => (
        <section key={phase} className="WC26__matchPhaseSection">
          <h3 className="WC26__sectionTitle">{MATCH_PHASE_LABELS[phase] || phase}</h3>
          <div className="WC26__matchList">
            {grouped[phase].map((match) => (
              <WorldCup2026MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      ))}

      {matches.length === 0 && (
        <p className="WC26__cardText">No match predictions yet. Check back during the tournament.</p>
      )}
    </div>
  );
}

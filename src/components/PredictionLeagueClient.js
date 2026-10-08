import { useEffect, useState } from "react";
import {
  fetchTipsNewPayload,
  slipsFromTipsNewPayload,
} from "../logic/predictionLeague";
import { PredictionLeagueLeaderboard } from "./TippingTable";
import PredictionLeagueTrending from "./PredictionLeagueTrending";

export default function PredictionLeagueClient({
  initialLeaderboard,
  monthKey,
}) {
  const [slips, setSlips] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const tipsPayload = await fetchTipsNewPayload();
      if (cancelled) return;
      const next =
        tipsPayload && typeof tipsPayload === "object"
          ? slipsFromTipsNewPayload(tipsPayload, { monthKey })
          : [];
      setSlips(next);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [monthKey]);

  if (slips === null) {
    return (
      <div className="leaderboard-loading" aria-live="polite">
        <span className="leaderboard-loading-dot" />
        Loading leaderboard…
      </div>
    );
  }

  return (
    <>
      <PredictionLeagueLeaderboard
        slips={slips}
        monthKey={monthKey}
        initialLeaderboard={initialLeaderboard}
      />
      <PredictionLeagueTrending slips={slips} />
    </>
  );
}

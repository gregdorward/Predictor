import React from "react";
import ExoticLeg from "./ExoticLeg";
import { MultisHubCard, MultisHubCardFooter, MultisHubEmpty } from "./MultisHubCard";

export default function ExoticMultiCard({
  tips,
  gamesInExotic,
  exoticString,
  exoticStake,
  combinations,
  totalStake,
  potentialWinnings,
  freeCapNote,
  getCopyText,
  emptyMessage,
}) {
  if (emptyMessage) {
    return (
      <MultisHubCard>
        <MultisHubEmpty message={emptyMessage} />
      </MultisHubCard>
    );
  }

  return (
    <MultisHubCard>
      {freeCapNote ? <p className="MultisHub__freeCapNote">{freeCapNote}</p> : null}
      <dl className="MultisHub__summaryGrid">
        <div className="MultisHub__summaryItem">
          <dt>Structure</dt>
          <dd>{gamesInExotic} games · {exoticString}</dd>
        </div>
        <div className="MultisHub__summaryItem">
          <dt>Stake</dt>
          <dd>
            {exoticStake} units per line · {combinations} combinations
          </dd>
        </div>
        <div className="MultisHub__summaryItem">
          <dt>Total outlay</dt>
          <dd>{totalStake} units</dd>
        </div>
        <div className="MultisHub__summaryItem MultisHub__summaryItem--highlight">
          <dt>Potential return</dt>
          <dd>{potentialWinnings} units</dd>
        </div>
      </dl>
      <ul className="MultisHub__legList MultisHub__legList--compact">
        {tips.map((tip) => (
          <ExoticLeg key={`${tip.team}-${tip.game}`} tip={tip} />
        ))}
      </ul>
      <MultisHubCardFooter getText={getCopyText} copyLabel="Copy exotic to clipboard" />
    </MultisHubCard>
  );
}

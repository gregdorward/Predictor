import React from "react";
import CopyMultiButton from "../CopyMultiButton";

export function MultisHubCard({ children, className = "" }) {
  return <div className={`MultisHub__card ${className}`.trim()}>{children}</div>;
}

export function MultisHubCardFooter({ oddsLabel, getText, copyLabel }) {
  return (
    <footer className="MultisHub__cardFooter">
      {oddsLabel ? (
        <p className="MultisHub__accumulator">{oddsLabel}</p>
      ) : null}
      {typeof getText === "function" ? (
        <CopyMultiButton getText={getText} label={copyLabel} />
      ) : null}
    </footer>
  );
}

export function MultisHubEmpty({ message }) {
  return <p className="MultisHub__empty">{message}</p>;
}

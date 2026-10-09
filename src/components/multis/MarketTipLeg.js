import React from "react";

const scrollToFixture = (id) => {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 0);
};

export default function MarketTipLeg({
  id,
  fixtureLine,
  marketLine,
  outcomeClassName,
  outcomeSymbol,
}) {
  return (
    <li className="MultisHub__simpleLeg">
      <a
        href={`#${id}`}
        className="MultisHub__simpleLegLink"
        onClick={(e) => {
          e.preventDefault();
          scrollToFixture(id);
        }}
      >
        <div className="MultisHub__simpleLegFixture">{fixtureLine}</div>
        <div className="MultisHub__simpleLegPick">
          <span className="MultisHub__simpleLegResult">
            {outcomeSymbol ? (
              <span
                className={`MultisHub__simpleLegStatus ${outcomeClassName || ""}`}
                aria-hidden="true"
              >
                {outcomeSymbol}
              </span>
            ) : null}
            <span className="MultisHub__simpleLegMarket">{marketLine}</span>
          </span>
        </div>
      </a>
    </li>
  );
}

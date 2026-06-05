import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const MULTIS_PANELS = [
  { id: "bestPredictions", label: "Build a Multi", className: "bestPredictions" },
  { id: "exoticOfTheDay", label: "Exotic of the Day", className: "exoticOfTheDay" },
  { id: "longShots", label: "Over 2.5 Goals", className: "MultisCarousel-panelLongShots" },
  { id: "BTTS", label: "BTTS Games", className: "MultisCarousel-panelBTTS" },
];

export default function MultisPanelCarousel({ panels = MULTIS_PANELS }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelCount = panels.length;

  const goTo = (index) => {
    if (index >= 0 && index < panelCount) {
      setActiveIndex(index);
    }
  };

  const previousPanel = activeIndex > 0 ? panels[activeIndex - 1] : null;
  const nextPanel = activeIndex < panelCount - 1 ? panels[activeIndex + 1] : null;

  return (
    <div className="MultisCarousel">
      <div className="MultisCarousel-nav">
        <button
          type="button"
          className="MultisCarousel-navControl MultisCarousel-navControl--prev"
          onClick={() => goTo(activeIndex - 1)}
          disabled={!previousPanel}
          aria-label={previousPanel ? `Previous: ${previousPanel.label}` : "No previous category"}
        >
          <ChevronLeft className="MultisCarousel-arrowIcon" />
        </button>

        <button
          type="button"
          className="MultisCarousel-navControl MultisCarousel-navControl--next"
          onClick={() => goTo(activeIndex + 1)}
          disabled={!nextPanel}
          aria-label={nextPanel ? `Next: ${nextPanel.label}` : "No next category"}
        >
          <ChevronRight className="MultisCarousel-arrowIcon" />
        </button>
      </div>

      <div className="MultisCarousel-viewport">
        {panels.map((panel, index) => (
          <div
            key={panel.id}
            id={panel.id}
            role="tabpanel"
            aria-hidden={index !== activeIndex}
            className={`MultisCarousel-panel ${panel.className || ""} ${
              index === activeIndex ? "is-active" : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}

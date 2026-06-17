import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SWIPE_THRESHOLD_PX = 48;
const SWIPE_MAX_VERTICAL_PX = 80;

// Buttons/links inside the carousel (nav arrows, Increment/Decrement, tip
// controls) must stay clickable. Starting a swipe — especially calling
// setPointerCapture — on these would redirect the synthesized click to the
// carousel container, so the element's own onClick would never fire.
const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, label, [role="button"]';

const isInteractiveTarget = (target) =>
  target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null;

export const MULTIS_PANELS = [
  { id: "bestPredictions", label: "Build a Multi", className: "bestPredictions" },
  { id: "exoticOfTheDay", label: "Exotic of the Day", className: "exoticOfTheDay" },
  { id: "longShots", label: "Over 2.5 Goals", className: "MultisCarousel-panelLongShots" },
  { id: "BTTS", label: "BTTS Games", className: "MultisCarousel-panelBTTS" },
];

export default function MultisPanelCarousel({ panels = MULTIS_PANELS }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const panelCount = panels.length;
  const swipeStart = useRef(null);

  const goTo = (index) => {
    if (index >= 0 && index < panelCount) {
      setActiveIndex(index);
    }
  };

  const goNext = () => {
    setActiveIndex((index) => Math.min(index + 1, panelCount - 1));
  };

  const goPrevious = () => {
    setActiveIndex((index) => Math.max(index - 1, 0));
  };

  const handleSwipeStart = (clientX, clientY) => {
    swipeStart.current = { x: clientX, y: clientY };
  };

  const handleSwipeEnd = (clientX, clientY) => {
    if (!swipeStart.current) return;

    const deltaX = clientX - swipeStart.current.x;
    const deltaY = clientY - swipeStart.current.y;
    swipeStart.current = null;

    if (Math.abs(deltaY) > SWIPE_MAX_VERTICAL_PX) return;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

    if (deltaX < 0) {
      goNext();
    } else {
      goPrevious();
    }
  };

  const previousPanel = activeIndex > 0 ? panels[activeIndex - 1] : null;
  const nextPanel = activeIndex < panelCount - 1 ? panels[activeIndex + 1] : null;

  return (
    <div
      className="MultisCarousel"
      onTouchStart={(event) => {
        if (isInteractiveTarget(event.target)) return;
        const touch = event.changedTouches[0];
        handleSwipeStart(touch.clientX, touch.clientY);
      }}
      onTouchEnd={(event) => {
        const touch = event.changedTouches[0];
        handleSwipeEnd(touch.clientX, touch.clientY);
      }}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        // Don't hijack clicks on nav arrows, Increment/Decrement, etc.
        if (isInteractiveTarget(event.target)) return;
        handleSwipeStart(event.clientX, event.clientY);
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerUp={(event) => {
        handleSwipeEnd(event.clientX, event.clientY);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={() => {
        swipeStart.current = null;
      }}
    >
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

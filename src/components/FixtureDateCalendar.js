import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Calendar from "react-calendar";
import { Calendar as CalendarIcon, X } from "lucide-react";
import {
  clampDateToFixtureRange,
  getFixtureDateBounds,
  getOffsetFromToday,
} from "../utils/fixtureDateBounds";
import "react-calendar/dist/Calendar.css";

const BODY_LOCK_CLASS = "ssh-fixture-calendar-open";

/**
 * Calendar icon + overlay for jumping to a homepage fixture date.
 * Range: today-60 … today+4 (local calendar days).
 */
export default function FixtureDateCalendar({
  currentDate,
  onSelectDate,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const titleId = useId();
  const { minDate, maxDate } = getFixtureDateBounds();

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
  }, [disabled]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const { body } = document;
    const scrollY = window.scrollY;
    body.classList.add(BODY_LOCK_CLASS);
    body.style.top = `-${scrollY}px`;

    const previouslyFocused = document.activeElement;
    const focusTimer = window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      body.classList.remove(BODY_LOCK_CLASS);
      body.style.top = "";
      window.scrollTo(0, scrollY);
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      } else {
        triggerRef.current?.focus();
      }
    };
  }, [isOpen, close]);

  const handleSelect = (value) => {
    const picked = Array.isArray(value) ? value[0] : value;
    if (!(picked instanceof Date) || Number.isNaN(picked.getTime())) return;

    const clamped = clampDateToFixtureRange(picked);
    const offset = getOffsetFromToday(clamped);
    onSelectDate(clamped, offset);
    close();
  };

  const overlay =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="FixtureDateCalendarOverlay"
            onClick={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div
              ref={dialogRef}
              className="FixtureDateCalendarDialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
            >
              <div className="FixtureDateCalendarDialog-header">
                <h2 id={titleId} className="FixtureDateCalendarDialog-title">
                  Choose fixture date
                </h2>
                <button
                  type="button"
                  className="FixtureDateCalendarDialog-close"
                  onClick={close}
                  aria-label="Close calendar"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <Calendar
                onChange={handleSelect}
                value={currentDate}
                minDate={minDate}
                maxDate={maxDate}
                locale="en-GB"
                calendarType="iso8601"
                showNeighboringMonth
                maxDetail="month"
                minDetail="month"
                next2Label={null}
                prev2Label={null}
                className="FixtureDateCalendarGrid"
              />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="SecondaryButton FixtureDateCalendarButton"
        onClick={open}
        disabled={disabled}
        aria-label="Choose fixture date"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        data-cy="fixture-date-calendar"
      >
        <CalendarIcon size={20} aria-hidden="true" />
      </button>
      {overlay}
    </>
  );
}

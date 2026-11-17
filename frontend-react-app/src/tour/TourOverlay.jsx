// src/tour/TourOverlay.jsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTour } from "./TourProvider";
import "./tour.css";

const POPOVER_WIDTH = 300;
const GAP = 14;
const PAD = 6;

const sameRect = (a, b) =>
  !a || !b
    ? a === b
    : Math.abs(a.top - b.top) < 1 &&
      Math.abs(a.left - b.left) < 1 &&
      Math.abs(a.width - b.width) < 1 &&
      Math.abs(a.height - b.height) < 1;

export default function TourOverlay() {
  const { active, step, steps, next, skip } = useTour();
  const current = steps[step];
  const [rect, setRect] = useState(null);

  // Track the target (it may not be on screen yet), and advance when the step's condition is met.
  useEffect(() => {
    if (!active || !current || !current.target) {
      setRect(null);
      return undefined;
    }

    let el = null;
    let fired = false;
    const advance = () => {
      if (fired) return;
      fired = true;
      next();
    };
    const onClick = () => current.advanceOn === "click" && advance();
    const detach = () => {
      if (el) el.removeEventListener("click", onClick, true);
      el = null;
    };

    const tick = () => {
      const found = document.querySelector(`[data-tour="${current.target}"]`);
      if (found !== el) {
        detach();
        el = found;
        if (el) {
          el.addEventListener("click", onClick, true); // capture phase; we never preventDefault
          el.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }

      if (current.advanceOn === "filled") {
        const watched = document.querySelector(`[data-tour="${current.watch}"]`);
        if (watched && watched.value) advance();
      }

      if (!el) {
        setRect((prev) => (prev === null ? prev : null));
        return;
      }
      const r = el.getBoundingClientRect();
      const nextRect = { top: r.top, left: r.left, width: r.width, height: r.height };
      setRect((prev) => (sameRect(prev, nextRect) ? prev : nextRect));
    };

    tick();
    const id = setInterval(tick, 120);
    return () => {
      clearInterval(id);
      detach();
    };
  }, [active, current, next]);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => e.key === "Escape" && skip();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, skip]);

  if (!active || !current) return null;

  const hasTarget = Boolean(current.target);
  const waiting = hasTarget && !rect; // target isn't on screen right now
  const info = !hasTarget; // centered card with no highlight
  const isLast = step === steps.length - 1;
  const showNext = current.advanceOn === "button" || current.advanceOn === "filled";

  let popoverStyle;
  if (info) {
    popoverStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  } else if (waiting) {
    popoverStyle = { bottom: 20, right: 20 };
  } else {
    const placeBelow = rect.top + rect.height < window.innerHeight - 220;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - POPOVER_WIDTH / 2, 12),
      window.innerWidth - POPOVER_WIDTH - 12
    );
    popoverStyle = placeBelow
      ? { top: rect.top + rect.height + PAD + GAP, left }
      : { top: rect.top - PAD - GAP, left, transform: "translateY(-100%)" };
  }

  return createPortal(
    <div className="tour-root" role="dialog" aria-live="polite" aria-label="Registration guide">
      {info && <div className="tour-dim" />}
      {!info && !waiting && (
        <div
          className="tour-spotlight"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
        />
      )}

      <div className="tour-popover" style={{ width: POPOVER_WIDTH, ...popoverStyle }}>
        <div className="tour-progress">
          Step {step + 1} of {steps.length}
        </div>
        <h3 className="tour-title">{waiting ? "Waiting for the next step" : current.title}</h3>
        <p className="tour-text">
          {waiting
            ? "The button for this step isn't on screen right now. Open the Register New Voter form to continue, or skip this step."
            : current.text}
        </p>
        {current.link && !waiting && (
          <a className="tour-link" href={current.link.href} target="_blank" rel="noreferrer">
            {current.link.label}
          </a>
        )}
        <div className="tour-actions">
          <button type="button" className="tour-skip" onClick={skip}>
            Skip guide
          </button>
          {waiting && (
            <button type="button" className="tour-next" onClick={next}>
              Skip step
            </button>
          )}
          {!waiting && showNext && (
            <button type="button" className="tour-next" onClick={next}>
              {isLast ? "Done" : "Next"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

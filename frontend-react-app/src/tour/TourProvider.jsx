// src/tour/TourProvider.jsx
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { TOUR_STEPS } from "./steps";
import TourOverlay from "./TourOverlay";

const STORAGE_KEY = "evotivity_tour_v1";
const TourContext = createContext(null);

export const useTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside <TourProvider>");
  return ctx;
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved.step === "number") return saved;
  } catch {
    /* storage unavailable or corrupted */
  }
  return { active: false, step: 0, done: false };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export default function TourProvider({ children }) {
  const [state, setState] = useState(loadState);

  const update = useCallback((next) => {
    setState(next);
    saveState(next);
  }, []);

  // Starts the guide the first time only. { force: true } restarts it.
  const startTour = useCallback(
    ({ force = false } = {}) => {
      if (!force && (state.active || state.done)) return;
      update({ active: true, step: 0, done: false });
    },
    [state.active, state.done, update]
  );

  const next = useCallback(() => {
    if (state.step + 1 >= TOUR_STEPS.length) {
      update({ active: false, step: 0, done: true });
    } else {
      update({ ...state, step: state.step + 1 });
    }
  }, [state, update]);

  // Jump to a step by id (only while the guide is running).
  const goToStep = useCallback(
    (id) => {
      if (!state.active) return;
      const idx = TOUR_STEPS.findIndex((s) => s.id === id);
      if (idx >= 0) update({ ...state, step: idx });
    },
    [state, update]
  );

  const skip = useCallback(() => update({ active: false, step: 0, done: true }), [update]);

  const value = useMemo(
    () => ({ active: state.active, step: state.step, steps: TOUR_STEPS, startTour, next, goToStep, skip }),
    [state.active, state.step, startTour, next, goToStep, skip]
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <TourOverlay />
    </TourContext.Provider>
  );
}

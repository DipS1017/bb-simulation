import { useEffect, useRef } from "react";
import { useSim } from "../store/useSim";
import { findPlay } from "../data/plays";

// Drives the Playbook: when a play is active, watches currentStep + isPlaying
// and applies each step's actions (via existing moveOffense / passTo store
// actions, which already trigger defender slides). When playing, schedules
// setTimeout to advance to the next step after step.duration / playSpeed.
//
// `appliedKeyRef` prevents re-applying the same step when unrelated store
// state toggles (e.g. pause/resume at the same step).

export function usePlayRunner() {
  const activePlayId = useSim((s) => s.activePlayId);
  const outcome = useSim((s) => s.outcome);
  const currentStep = useSim((s) => s.currentStep);
  const isPlaying = useSim((s) => s.isPlaying);
  const playSpeed = useSim((s) => s.playSpeed);
  const passTo = useSim((s) => s.passTo);
  const moveOffense = useSim((s) => s.moveOffense);
  const pause = useSim((s) => s.pause);

  const appliedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activePlayId) {
      appliedKeyRef.current = null;
      return;
    }
    const play = findPlay(activePlayId);
    if (!play) return;
    const steps = play[outcome];

    if (currentStep < 0) {
      appliedKeyRef.current = `${activePlayId}|${outcome}|init`;
      return;
    }
    if (currentStep >= steps.length) {
      pause();
      return;
    }

    const key = `${activePlayId}|${outcome}|${currentStep}`;
    if (appliedKeyRef.current !== key) {
      const step = steps[currentStep];
      for (const a of step.actions) {
        if (a.kind === "move") moveOffense(a.id, a.x, a.y);
        else if (a.kind === "pass") passTo(a.to);
      }
      appliedKeyRef.current = key;
    }

    if (!isPlaying) return;

    const step = steps[currentStep];
    const delay = step.duration / playSpeed;
    const t = setTimeout(() => {
      if (currentStep + 1 < steps.length) {
        useSim.setState({ currentStep: currentStep + 1 });
      } else {
        useSim.setState({ isPlaying: false });
      }
    }, delay);
    return () => clearTimeout(t);
  }, [activePlayId, outcome, currentStep, isPlaying, playSpeed, passTo, moveOffense, pause]);
}

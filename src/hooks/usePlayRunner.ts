import { useEffect, useRef } from "react";
import { useSim } from "../store/useSim";
import { findPlay } from "../data/plays";

// Drives the Playbook: when a play is active, watches currentStep + isPlaying
// and applies each step's actions (via existing moveOffense / passTo store
// actions, which already trigger defender slides). When playing, schedules
// setTimeout to advance to the next step after step.duration / playSpeed.
// If a step carries a `shot`, the runner triggers the shot animation and
// clears it ~50ms before the step's duration ends so the next step starts
// fresh.

const SHOT_TAIL_MS = 100; // leave a tiny window before advance

export function usePlayRunner() {
  const activePlayId = useSim((s) => s.activePlayId);
  const outcome = useSim((s) => s.outcome);
  const currentStep = useSim((s) => s.currentStep);
  const isPlaying = useSim((s) => s.isPlaying);
  const playSpeed = useSim((s) => s.playSpeed);
  const passTo = useSim((s) => s.passTo);
  const moveOffense = useSim((s) => s.moveOffense);
  const pause = useSim((s) => s.pause);
  const triggerShot = useSim((s) => s.triggerShot);
  const clearShot = useSim((s) => s.clearShot);

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
    const step = steps[currentStep];
    if (appliedKeyRef.current !== key) {
      for (const a of step.actions) {
        if (a.kind === "move") moveOffense(a.id, a.x, a.y);
        else if (a.kind === "pass") passTo(a.to);
      }
      if (step.shot) triggerShot(step.shot);
      appliedKeyRef.current = key;
    }

    if (!isPlaying) return;

    const delay = step.duration / playSpeed;
    const t = setTimeout(() => {
      if (step.shot) clearShot();
      if (currentStep + 1 < steps.length) {
        useSim.setState({ currentStep: currentStep + 1 });
      } else {
        useSim.setState({ isPlaying: false });
      }
    }, Math.max(100, delay - SHOT_TAIL_MS));
    return () => clearTimeout(t);
  }, [activePlayId, outcome, currentStep, isPlaying, playSpeed, passTo, moveOffense, pause, triggerShot, clearShot]);
}

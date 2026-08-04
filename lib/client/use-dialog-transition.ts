"use client";

import { useEffect, useState } from "react";

export const DIALOG_EXIT_MS = 200;

function prefersReducedMotion() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

/**
 * Keeps a dialog/drawer mounted for the length of its exit animation.
 * `closing` is true while the element should play its leave keyframes.
 */
export function useDialogTransition(open: boolean, exitMs = DIALOG_EXIT_MS) {
  const [visible, setVisible] = useState(open);
  const [previousOpen, setPreviousOpen] = useState(open);

  if (open !== previousOpen) {
    setPreviousOpen(open);
    if (open) setVisible(true);
  }

  const closing = !open && visible;

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => setVisible(false), prefersReducedMotion() ? 0 : exitMs);
    return () => window.clearTimeout(timer);
  }, [closing, exitMs]);

  return { mounted: open || visible, closing };
}

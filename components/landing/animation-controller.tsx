"use client";

import { useEffect } from "react";

const REVEAL_SELECTORS = [
  ".quick-steps-inner",
  ".section-heading",
  ".how-card",
  ".feature-card",
  ".memory-feature-grid",
  ".ai-grid",
  ".slideshow-copy",
  ".slideshow-visual-wrap",
  ".showcase-copy",
  ".devices .shell",
  ".event-use-cases__grid",
  ".solution-hub__grid",
  ".wedding-guest-demo__inner",
  ".wedding-offer__card",
  ".wedding-comparison__table",
  ".wedding-free-guide__grid",
  ".pricing-grid",
  ".addons",
  ".faq-shell",
  ".footer-cta",
  ".footer-links",
  ".copyright",
].join(",");

export function AnimationController() {
  useEffect(() => {
    const root = document.documentElement;
    const targets = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTORS));
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    targets.forEach((target) => target.classList.add("motion-reveal"));

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    root.dataset.motionReady = "true";

    /*
     * No negative bottom rootMargin: the last elements on the page (the footer
     * links and the copyright line) can never scroll above it, so any margin
     * that clips the viewport bottom leaves them permanently at opacity 0.
     * The threshold alone is what holds a reveal back until it is properly in
     * view — and it is measured against the element, so it costs the bottom of
     * the page nothing.
     */
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    const frame = window.requestAnimationFrame(() => {
      targets.forEach((target) => observer.observe(target));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      delete root.dataset.motionReady;
    };
  }, []);

  return null;
}

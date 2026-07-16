"use client";

import { useEffect } from "react";

const REVEAL_SELECTORS = [
  ".quick-steps-inner",
  ".section-heading",
  ".how-card",
  ".feature-grid",
  ".ai-grid",
  ".slideshow-copy",
  ".slideshow-visual-wrap",
  ".photobooth-inner",
  ".devices .shell",
  ".testimonial-grid",
  ".comparison-shell",
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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
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

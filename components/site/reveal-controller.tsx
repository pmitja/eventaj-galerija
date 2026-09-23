"use client";

import { useEffect } from "react";

/**
 * Fades `[data-reveal]` blocks up as they scroll into view. Content is fully
 * visible without JavaScript; only blocks that start below the fold are hidden.
 */
export function RevealController() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        element.style.opacity = "1";
        element.style.transform = "none";
        observer.unobserve(element);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => {
      if (element.getBoundingClientRect().top <= window.innerHeight) return;
      element.style.opacity = "0";
      element.style.transform = "translateY(36px)";
      element.style.transition = "opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)";
      observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);
  return null;
}

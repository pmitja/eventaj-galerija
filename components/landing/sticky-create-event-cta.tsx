"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isStickyCtaVisible } from "./sticky-create-event-cta-state";

const HERO_CTA_SELECTOR = '[data-sticky-cta-trigger="create-event"]';
const MOBILE_HEADER_HEIGHT = 60;

export function StickyCreateEventCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const trigger = document.querySelector<HTMLElement>(HERO_CTA_SELECTOR);
    if (!trigger) return;
    const triggerElement = trigger;

    function updateFromTriggerPosition() {
      const bounds = triggerElement.getBoundingClientRect();
      setVisible(isStickyCtaVisible({
        isIntersecting: bounds.bottom > MOBILE_HEADER_HEIGHT && bounds.top < window.innerHeight,
        triggerBottom: bounds.bottom,
        rootTop: MOBILE_HEADER_HEIGHT,
      }));
    }

    let animationFrame: number | undefined;
    function scheduleUpdate() {
      if (animationFrame !== undefined) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = undefined;
        updateFromTriggerPosition();
      });
    }

    updateFromTriggerPosition();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div
      className={`sticky-cta ${visible ? "sticky-cta--visible" : ""}`}
      aria-hidden={!visible}
    >
      <Link className="button" href="/naroci" tabIndex={visible ? undefined : -1}>
        Ustvari dogodek — 35 €
      </Link>
    </div>
  );
}

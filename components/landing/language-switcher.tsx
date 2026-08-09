"use client";

import { useEffect, useRef, useState } from "react";
import {
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
  PREFIXED_LOCALES,
  type Locale,
} from "@/lib/i18n/locale";
import { localizedMarketingPath } from "@/lib/i18n/routes";

/**
 * Slovenian and English live on their own domains; the additional languages are
 * path-prefixed on the English one. `alternateOrigin` is the other domain, so a
 * switch that crosses domains gets an absolute URL and one that does not stays
 * relative.
 */
const MENU_LOCALES: Locale[] = ["en", ...PREFIXED_LOCALES];

export function LanguageSwitcher({
  locale,
  pathname,
  alternateOrigin,
  label,
  menuLabel,
  locales = MENU_LOCALES,
}: {
  locale: Locale;
  pathname: string;
  alternateOrigin?: string;
  label: string;
  menuLabel: string;
  locales?: readonly Locale[];
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // The Slovenian site keeps a single toggle to English — the extra languages
  // are an English-domain offering.
  if (locale === "sl") {
    if (!alternateOrigin) return null;
    return (
      <a className="login-link" href={`${alternateOrigin}${localizedMarketingPath(pathname, "en")}`}>
        {LOCALE_SHORT_LABELS.en}
      </a>
    );
  }

  return (
    <div className="nav-dropdown language-switcher" ref={menuRef}>
      <button
        ref={buttonRef}
        className="nav-dropdown__trigger login-link"
        type="button"
        aria-expanded={open}
        aria-controls="language-menu"
        aria-label={`${label}: ${LOCALE_LABELS[locale]}`}
        onClick={() => setOpen((value) => !value)}
      >
        {LOCALE_SHORT_LABELS[locale]}
        <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg>
      </button>
      <div
        id="language-menu"
        className={`nav-dropdown__panel language-switcher__panel ${open ? "nav-dropdown__panel--open" : ""}`}
        aria-label={menuLabel}
      >
        <div className="nav-dropdown__group">
          {locales.map((target) => (
            <a
              key={target}
              href={localizedMarketingPath(pathname, target)}
              hrefLang={target}
              aria-current={target === locale ? "true" : undefined}
              onClick={() => setOpen(false)}
            >
              <span>{LOCALE_LABELS[target]}</span>
            </a>
          ))}
          {alternateOrigin ? (
            <a
              href={`${alternateOrigin}${localizedMarketingPath(pathname, "sl")}`}
              hrefLang="sl"
              onClick={() => setOpen(false)}
            >
              <span>{LOCALE_LABELS.sl}</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

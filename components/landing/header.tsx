"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LOCALE_LABELS, PREFIXED_LOCALES, type Locale } from "@/lib/i18n/locale";
import {
  demoEventPath,
  eventUseCaseMarketingPath,
  localizedMarketingPath,
  orderPath,
} from "@/lib/i18n/routes";
import { LanguageSwitcher } from "./language-switcher";
import type { EventUseCase } from "./use-cases";

export function HeaderClient({
  howItWorksHref,
  locale = "sl",
  alternateOrigin,
  languageLocales,
  copy: t,
  eventUseCases,
  eventUseCaseGroups,
}: {
  howItWorksHref?: string;
  locale?: Locale;
  alternateOrigin?: string;
  languageLocales?: readonly Locale[];
  copy: Dictionary;
  eventUseCases: readonly EventUseCase[];
  eventUseCaseGroups: readonly string[];
}) {
  const pathname = usePathname();
  const home = localizedMarketingPath("/", locale);
  const howHref = howItWorksHref ?? `${home}#${t.anchors.howItWorks}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const eventsMenuRef = useRef<HTMLDivElement>(null);
  const eventsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!eventsMenuRef.current?.contains(event.target as Node)) setEventsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setEventsOpen(false);
      eventsButtonRef.current?.focus();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function closeMenu() { setMenuOpen(false); }

  const mobileLanguageLinks = (
    locale === "sl"
      ? (["en"] as Locale[])
      : [
          ...(languageLocales ?? (["en", ...PREFIXED_LOCALES] as Locale[])),
          ...(alternateOrigin ? (["sl"] as Locale[]) : []),
        ]
  ).map((target) => ({
    target,
    href: target === "sl" || locale === "sl"
      ? `${alternateOrigin ?? ""}${localizedMarketingPath(pathname, target)}`
      : localizedMarketingPath(pathname, target),
  }));

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="brand" href={`${home}#top`} aria-label={t.nav.brandLabel}>
          <Image className="brand-logo" src={locale === "sl" ? "/logo.svg" : "/guest-mosaic-mark.webp"} alt="" width={40} height={40} />
          <b>{t.nav.brandWord}</b>
        </Link>
        <nav className="desktop-nav" aria-label={t.nav.mainNavigation}>
          <Link href={howHref}>{t.nav.howItWorks}</Link>
          <div className="nav-dropdown" ref={eventsMenuRef} onMouseEnter={() => setEventsOpen(true)} onMouseLeave={() => setEventsOpen(false)}>
            <button ref={eventsButtonRef} className="nav-dropdown__trigger" type="button" aria-expanded={eventsOpen} aria-controls="event-use-cases-menu" onClick={() => setEventsOpen((open) => !open)}>
              {t.nav.events}
              <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg>
            </button>
            <div id="event-use-cases-menu" className={`nav-dropdown__panel ${eventsOpen ? "nav-dropdown__panel--open" : ""}`}>
              {eventUseCaseGroups.map((group) => (
                <div className="nav-dropdown__group" key={group}>
                  <strong>{group}</strong>
                  {eventUseCases.filter((item) => item.group === group).map((item) => (
                    <Link href={eventUseCaseMarketingPath(locale, item.slug)} key={item.slug} onClick={() => setEventsOpen(false)}>
                      <span>{item.navTitle}</span><small>{item.navDescription}</small>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <Link href={`${home}#${t.anchors.features}`}>{t.nav.features}</Link>
          <Link href={`${home}#${t.anchors.pricing}`}>{t.nav.pricing}</Link>
          <Link href={`${home}#${t.anchors.faq}`}>{t.nav.faq}</Link>
        </nav>
        <div className="header-actions">
          {locale !== "sl" ? <LanguageSwitcher locale={locale} pathname={pathname} alternateOrigin={alternateOrigin} label={t.nav.language} menuLabel={t.nav.chooseLanguage} locales={languageLocales} /> : null}
          <Link className="button button--small button--secondary desktop-only" href={demoEventPath(locale)}>{t.nav.demoEvent}</Link>
          <Link className="button button--small desktop-only" href={orderPath(locale)}>{t.nav.createEvent}</Link>
          <button className={`menu-button ${menuOpen ? "menu-button--open" : ""}`} type="button" aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
      <nav id="mobile-navigation" className={`mobile-nav ${menuOpen ? "mobile-nav--open" : ""}`} aria-label={t.nav.mobileNavigation} aria-hidden={!menuOpen}>
        <Link href={howHref} onClick={closeMenu}>{t.nav.howItWorks}</Link>
        <details className="mobile-nav__events">
          <summary>{t.nav.events} <span aria-hidden="true">+</span></summary>
          <div>{eventUseCases.map((item) => <Link href={eventUseCaseMarketingPath(locale, item.slug)} key={item.slug} onClick={closeMenu}>{item.navTitle}</Link>)}</div>
        </details>
        <Link href={`${home}#${t.anchors.features}`} onClick={closeMenu}>{t.nav.features}</Link>
        <Link href={`${home}#${t.anchors.pricing}`} onClick={closeMenu}>{t.nav.pricing}</Link>
        <Link href={`${home}#${t.anchors.faq}`} onClick={closeMenu}>{t.nav.faq}</Link>
        <details className="mobile-nav__events">
          <summary>{t.nav.language} <span aria-hidden="true">+</span></summary>
          <div>{mobileLanguageLinks.map(({ target, href }) => <a key={target} href={href} hrefLang={target} aria-current={target === locale ? "true" : undefined}>{LOCALE_LABELS[target]}</a>)}</div>
        </details>
        <div className="mobile-nav__actions">
          <Link className="button button--secondary" href={demoEventPath(locale)} onClick={closeMenu}>{t.hero.ctaSecondary}</Link>
          <Link className="button" href={orderPath(locale)} onClick={closeMenu}>{t.hero.ctaPrimary}</Link>
        </div>
      </nav>
    </header>
  );
}

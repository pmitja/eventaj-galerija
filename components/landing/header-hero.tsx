"use client";

import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  LOCALE_LABELS,
  PREFIXED_LOCALES,
  type Locale,
} from "@/lib/i18n/locale";
import { localizedMarketingScreenshot } from "@/lib/i18n/marketing-assets";
import {
  demoEventPath,
  eventUseCasePath,
  localizedMarketingPath,
  orderPath,
} from "@/lib/i18n/routes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "./language-switcher";
import { eventUseCaseGroupsFor, eventUseCasesFor } from "./use-cases";
import { VisualPlaceholder } from "./visual-placeholder";

export function Header({
  howItWorksHref,
  locale = "sl",
  alternateOrigin,
  languageLocales,
}: {
  howItWorksHref?: string;
  locale?: Locale;
  alternateOrigin?: string;
  languageLocales?: readonly Locale[];
} = {}) {
  const pathname = usePathname();
  const t = getDictionary(locale);
  const home = localizedMarketingPath("/", locale);
  const howHref = howItWorksHref ?? `${home}#${t.anchors.howItWorks}`;
  const eventUseCases = eventUseCasesFor(locale);
  const eventUseCaseGroups = eventUseCaseGroupsFor(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const eventsMenuRef = useRef<HTMLDivElement>(null);
  const eventsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!eventsMenuRef.current?.contains(event.target as Node))
        setEventsOpen(false);
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

  function closeMenu() {
    setMenuOpen(false);
  }

  // Slovenian is the only language on the other domain, so it needs an absolute
  // URL; the rest are path-prefixed siblings of the current page.
  const mobileLanguageLinks = (
    locale === "sl"
      ? (["en"] as Locale[])
      : [
          ...(languageLocales ?? (["en", ...PREFIXED_LOCALES] as Locale[])),
          ...(alternateOrigin ? (["sl"] as Locale[]) : []),
        ]
  ).map((target) => ({
    target,
    href:
      target === "sl" || locale === "sl"
        ? `${alternateOrigin ?? ""}${localizedMarketingPath(pathname, target)}`
        : localizedMarketingPath(pathname, target),
  }));

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link
          className="brand"
          href={`${home}#top`}
          aria-label={t.nav.brandLabel}
        >
          {locale !== "sl" && (
            <Image
              className="brand-logo"
              src="/guest-mosaic-mark.webp"
              alt=""
              width={40}
              height={40}
            />
          )}
          {locale === "sl" && (
            <Image
              className="brand-logo"
              src="/logo.svg"
              alt=""
              width={40}
              height={40}
            />
          )}
          <b>{t.nav.brandWord}</b>
        </Link>
        <nav className="desktop-nav" aria-label={t.nav.mainNavigation}>
          <Link href={howHref}>{t.nav.howItWorks}</Link>
          <div
            className="nav-dropdown"
            ref={eventsMenuRef}
            onMouseEnter={() => setEventsOpen(true)}
            onMouseLeave={() => setEventsOpen(false)}
          >
            <button
              ref={eventsButtonRef}
              className="nav-dropdown__trigger"
              type="button"
              aria-expanded={eventsOpen}
              aria-controls="event-use-cases-menu"
              onClick={() => setEventsOpen((open) => !open)}
            >
              {t.nav.events}
              <svg aria-hidden="true" viewBox="0 0 16 16">
                <path d="m4 6 4 4 4-4" />
              </svg>
            </button>
            <div
              id="event-use-cases-menu"
              className={`nav-dropdown__panel ${eventsOpen ? "nav-dropdown__panel--open" : ""}`}
            >
              {eventUseCaseGroups.map((group) => (
                <div className="nav-dropdown__group" key={group}>
                  <strong>{group}</strong>
                  {eventUseCases
                    .filter((item) => item.group === group)
                    .map((item) => (
                      <Link
                        href={eventUseCasePath(locale, item.slug)}
                        key={item.slug}
                        onClick={() => setEventsOpen(false)}
                      >
                        <span>{item.navTitle}</span>
                        <small>{item.navDescription}</small>
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
          {locale !== "sl" && (
            <LanguageSwitcher
              locale={locale}
              pathname={pathname}
              alternateOrigin={alternateOrigin}
              label={t.nav.language}
              menuLabel={t.nav.chooseLanguage}
              locales={languageLocales}
            />
          )}
          <Link
            className="button button--small button--secondary desktop-only"
            href={demoEventPath(locale)}
          >
            {t.nav.demoEvent}
          </Link>
          <Link
            className="button button--small desktop-only"
            href={orderPath(locale)}
          >
            {t.nav.createEvent}
          </Link>
          <button
            className={`menu-button ${menuOpen ? "menu-button--open" : ""}`}
            type="button"
            aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        className={`mobile-nav ${menuOpen ? "mobile-nav--open" : ""}`}
        aria-label={t.nav.mobileNavigation}
        aria-hidden={!menuOpen}
      >
        <Link href={howHref} onClick={closeMenu}>
          {t.nav.howItWorks}
        </Link>
        <details className="mobile-nav__events">
          <summary>
            {t.nav.events} <span aria-hidden="true">+</span>
          </summary>
          <div>
            {eventUseCases.map((item) => (
              <Link
                href={eventUseCasePath(locale, item.slug)}
                key={item.slug}
                onClick={closeMenu}
              >
                {item.navTitle}
              </Link>
            ))}
          </div>
        </details>
        <Link href={`${home}#${t.anchors.features}`} onClick={closeMenu}>
          {t.nav.features}
        </Link>
        <Link href={`${home}#${t.anchors.pricing}`} onClick={closeMenu}>
          {t.nav.pricing}
        </Link>
        <Link href={`${home}#${t.anchors.faq}`} onClick={closeMenu}>
          {t.nav.faq}
        </Link>
        <details className="mobile-nav__events">
          <summary>
            {t.nav.language} <span aria-hidden="true">+</span>
          </summary>
          <div>
            {mobileLanguageLinks.map(({ target, href }) => (
              <a
                key={target}
                href={href}
                hrefLang={target}
                aria-current={target === locale ? "true" : undefined}
              >
                {LOCALE_LABELS[target]}
              </a>
            ))}
          </div>
        </details>
        <div className="mobile-nav__actions">
          <Link
            className="button button--secondary"
            href={demoEventPath(locale)}
            onClick={closeMenu}
          >
            {t.hero.ctaSecondary}
          </Link>
          <Link className="button" href={orderPath(locale)} onClick={closeMenu}>
            {t.hero.ctaPrimary}
          </Link>
        </div>
      </nav>
    </header>
  );
}

function PhoneGallery({ locale }: { locale: Locale }) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <Image
          className={`phone-shot${locale === "sl" ? "" : " phone-shot--trim-scrollbar"}`}
          src={localizedMarketingScreenshot(locale, "/marketing/screenshots/gallery-mobile.png")}
          alt={getDictionary(locale).hero.phoneAlt}
          fill
          sizes="300px"
          priority
        />
      </div>
    </div>
  );
}

export function Hero({ locale = "sl" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const cards = [
    ["hero-card--one", 5],
    ["hero-card--two", 6],
    ["hero-card--three", 7],
    ["hero-card--four", 8],
    ["hero-card--five", 9],
    ["hero-card--six", 3],
  ] as const;

  return (
    <section className="hero" id="top">
      <div className="hero-copy shell">
        <div className="eyebrow">
          <span />
          {t.hero.eyebrow}
        </div>
        <h1>{t.hero.title}</h1>
        <p>{t.hero.subtitle}</p>
        <div className="hero-buttons">
          <Link
            className="button"
            href={orderPath(locale)}
            data-sticky-cta-trigger="create-event"
          >
            {t.hero.ctaPrimary}
          </Link>
          <Link
            className="button button--secondary"
            href={demoEventPath(locale)}
          >
            {t.hero.ctaSecondary}
          </Link>
        </div>
        <div className="hero-trust" aria-label={t.hero.trustLabel}>
          {t.hero.trust.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
      <div className="hero-stage shell">
        {cards.map(([className, photo], index) => {
          const label = `${t.hero.guestPhotoAlt} ${index + 1}`;
          return (
            <div className={`hero-card ${className}`} key={className}>
              <VisualPlaceholder
                label={label}
                imageSrc={`/gallery/ana-marko/photo-${photo}.jpg`}
                imageAlt={label}
                priority
              />
            </div>
          );
        })}
        <PhoneGallery locale={locale} />
      </div>
    </section>
  );
}

export function QuickSteps({ locale = "sl" }: { locale?: Locale }) {
  const steps = getDictionary(locale).quickSteps;

  return (
    <section className="quick-steps">
      <div className="quick-steps-inner shell">
        {steps.map(([title, text], index) => (
          <div className="quick-step-wrap" key={title}>
            <div className="quick-step">
              <span>{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            </div>
            {index < 2 ? <b className="step-arrow">→</b> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

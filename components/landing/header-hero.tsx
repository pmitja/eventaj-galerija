"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LoginTrigger, useLoginModal } from "@/components/auth/login-modal";
import { eventUseCaseGroupsFor, eventUseCasesFor } from "./use-cases";
import { VisualPlaceholder } from "./visual-placeholder";
import type { Locale } from "@/lib/i18n/locale";
import { demoEventPath, eventUseCasePath, localizedMarketingPath, orderPath } from "@/lib/i18n/routes";

export function Header({ howItWorksHref, locale = "sl", alternateOrigin }: { howItWorksHref?: string; locale?: Locale; alternateOrigin?: string } = {}) {
  const pathname = usePathname();
  const en = locale === "en";
  const targetLocale = en ? "sl" : "en";
  const localeSwitchPath = localizedMarketingPath(pathname, targetLocale);
  const howHref = howItWorksHref ?? `/#${en ? "how-it-works" : "kako-deluje"}`;
  const eventUseCases = eventUseCasesFor(locale);
  const eventUseCaseGroups = eventUseCaseGroupsFor(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const eventsMenuRef = useRef<HTMLDivElement>(null);
  const eventsButtonRef = useRef<HTMLButtonElement>(null);
  const { openLogin } = useLoginModal();

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

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="brand" href="/#top" aria-label="Eventaj.si Galerija">
          <img className="brand-logo" src="/logo.svg" alt="Eventaj.si" width={40} height={40} />
          <span>|</span> <b>{en ? "Gallery" : "Galerija"}</b>
        </Link>
        <nav className="desktop-nav" aria-label={en ? "Main navigation" : "Glavna navigacija"}>
          <Link href={howHref}>{en ? "How it works" : "Kako deluje"}</Link>
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
              {en ? "Events" : "Za dogodke"}
              <svg aria-hidden="true" viewBox="0 0 16 16"><path d="m4 6 4 4 4-4" /></svg>
            </button>
            <div
              id="event-use-cases-menu"
              className={`nav-dropdown__panel ${eventsOpen ? "nav-dropdown__panel--open" : ""}`}
            >
              {eventUseCaseGroups.map((group) => (
                <div className="nav-dropdown__group" key={group}>
                  <strong>{group}</strong>
                  {eventUseCases.filter((item) => item.group === group).map((item) => (
                    <Link href={eventUseCasePath(locale, item.slug)} key={item.slug} onClick={() => setEventsOpen(false)}>
                      <span>{item.navTitle}</span>
                      <small>{item.navDescription}</small>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <Link href={`/#${en ? "features" : "funkcije"}`}>{en ? "Features" : "Funkcije"}</Link>
          <Link href={`/#${en ? "pricing" : "cene"}`}>{en ? "Pricing" : "Cene"}</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="header-actions">
          {alternateOrigin ? <a className="login-link" href={`${alternateOrigin}${localeSwitchPath}`}>{en ? "SL" : "EN"}</a> : null}
          <LoginTrigger className="login-link">{en ? "Sign in" : "Prijava"}</LoginTrigger>
          <Link className="button button--small button--secondary desktop-only" href={demoEventPath(locale)}>{en ? "Demo event" : "Demo dogodek"}</Link>
          <Link className="button button--small desktop-only" href={orderPath(locale)}>{en ? "Create event · €35" : "Ustvari dogodek · 35 €"}</Link>
          <button
            className={`menu-button ${menuOpen ? "menu-button--open" : ""}`}
            type="button"
            aria-label={menuOpen ? (en ? "Close menu" : "Zapri meni") : (en ? "Open menu" : "Odpri meni")}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
      <nav id="mobile-navigation" className={`mobile-nav ${menuOpen ? "mobile-nav--open" : ""}`} aria-label={en ? "Mobile navigation" : "Mobilna navigacija"} aria-hidden={!menuOpen}>
        <Link href={howHref} onClick={closeMenu}>{en ? "How it works" : "Kako deluje"}</Link>
        <details className="mobile-nav__events">
          <summary>{en ? "Events" : "Za dogodke"} <span aria-hidden="true">+</span></summary>
          <div>
            {eventUseCases.map((item) => (
              <Link href={eventUseCasePath(locale, item.slug)} key={item.slug} onClick={closeMenu}>{item.navTitle}</Link>
            ))}
          </div>
        </details>
        <Link href={`/#${en ? "features" : "funkcije"}`} onClick={closeMenu}>{en ? "Features" : "Funkcije"}</Link>
        <Link href={`/#${en ? "pricing" : "cene"}`} onClick={closeMenu}>{en ? "Pricing" : "Cene"}</Link>
        <Link href="/#faq" onClick={closeMenu}>FAQ</Link>
        {alternateOrigin ? <a href={`${alternateOrigin}${localeSwitchPath}`}>{en ? "Slovenščina" : "English"}</a> : null}
        <button type="button" onClick={() => { closeMenu(); openLogin("/admin"); }}>{en ? "Sign in" : "Prijava"}</button>
        <div className="mobile-nav__actions">
          <Link className="button button--secondary" href={demoEventPath(locale)} onClick={closeMenu}>{en ? "Try the demo event" : "Preizkusi demo dogodek"}</Link>
          <Link className="button" href={orderPath(locale)} onClick={closeMenu}>{en ? "Create event for €35" : "Ustvari dogodek za 35 €"}</Link>
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
          className="phone-shot"
          src="/marketing/screenshots/gallery-mobile.png"
          alt={locale === "en" ? "Anna and Mark's event gallery on a phone" : "Galerija dogodka Ana & Marko na telefonu"}
          fill
          sizes="300px"
          priority
        />
      </div>
    </div>
  );
}

export function Hero({ locale = "sl" }: { locale?: Locale }) {
  const en = locale === "en";
  const cards = [
    ["hero-card--one", en ? "Guest photo 1" : "Fotografija gosta 1", 5],
    ["hero-card--two", en ? "Guest photo 2" : "Fotografija gosta 2", 6],
    ["hero-card--three", en ? "Guest photo 3" : "Fotografija gosta 3", 7],
    ["hero-card--four", en ? "Guest photo 4" : "Fotografija gosta 4", 8],
    ["hero-card--five", en ? "Guest photo 5" : "Fotografija gosta 5", 9],
    ["hero-card--six", en ? "Guest photo 6" : "Fotografija gosta 6", 3],
  ] as const;

  return (
    <section className="hero" id="top">
      <div className="hero-copy shell">
        <div className="eyebrow"><span />{en ? "One QR code · no app" : "Ena QR koda · brez aplikacije"}</div>
        <h1>{en ? "Every memory from your guests. In one place." : "Vsi spomini vaših gostov. Na enem mestu."}</h1>
        <p>{en ? "Collect photos, short videos and heartfelt voice messages in one beautiful event gallery — with no app or guest registration." : "Zberite fotografije, kratke videe in iskrena glasovna voščila v eni čudoviti galeriji dogodka — brez aplikacije in registracije gostov."}</p>
        <div className="hero-buttons">
          <Link className="button" href={orderPath(locale)} data-sticky-cta-trigger="create-event">{en ? "Create your event for €35" : "Ustvari dogodek za 35 €"}</Link>
          <Link className="button button--secondary" href={demoEventPath(locale)}>{en ? "Try the demo event" : "Preizkusi demo dogodek"}</Link>
        </div>
        <div className="hero-trust" aria-label={en ? "Purchase benefits" : "Prednosti nakupa"}>
          <span>{en ? "One-time payment" : "Enkratno plačilo"}</span>
          <span>{en ? "Unlimited guests" : "Neomejeno gostov"}</span>
          <span>{en ? "Gallery for 180 days" : "Galerija za 180 dni"}</span>
        </div>
      </div>
      <div className="hero-stage shell">
        {cards.map(([className, label, photo]) => (
          <div className={`hero-card ${className}`} key={className}>
            <VisualPlaceholder label={label} imageSrc={`/gallery/ana-marko/photo-${photo}.jpg`} imageAlt={label} priority />
          </div>
        ))}
        <PhoneGallery locale={locale} />
      </div>
    </section>
  );
}

export function QuickSteps({ locale = "sl" }: { locale?: Locale }) {
  const steps = locale === "en" ? [
    ["Create your event", "and receive your gallery"],
    ["Guests scan the QR", "and add photos, video or voice"],
    ["Enjoy the memories", "every moment in one place"],
  ] : [
    ["Ustvarite dogodek", "in prejmete svojo galerijo"],
    ["Gostje skenirajo QR", "in dodajo fotografije, video ali glas"],
    ["Uživajte v spominih", "vsi trenutki na enem mestu"],
  ];

  return (
    <section className="quick-steps">
      <div className="quick-steps-inner shell">
        {steps.map(([title, text], index) => (
          <div className="quick-step-wrap" key={title}>
            <div className="quick-step"><span>{index + 1}</span><div><strong>{title}</strong><small>{text}</small></div></div>
            {index < 2 ? <b className="step-arrow">→</b> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LoginTrigger, useLoginModal } from "@/components/auth/login-modal";
import { eventUseCaseGroups, eventUseCases } from "./use-cases";
import { VisualPlaceholder } from "./visual-placeholder";

export function Header({ howItWorksHref = "/#kako-deluje" }: { howItWorksHref?: string } = {}) {
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
          <span>|</span> <b>Galerija</b>
        </Link>
        <nav className="desktop-nav" aria-label="Glavna navigacija">
          <Link href={howItWorksHref}>Kako deluje</Link>
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
              Za dogodke
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
                    <Link href={`/za-dogodke/${item.slug}`} key={item.slug} onClick={() => setEventsOpen(false)}>
                      <span>{item.navTitle}</span>
                      <small>{item.navDescription}</small>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <Link href="/#funkcije">Funkcije</Link>
          <Link href="/#cene">Cene</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="header-actions">
          <LoginTrigger className="login-link">Prijava</LoginTrigger>
          <Link className="button button--small button--secondary desktop-only" href="/e/ana-in-marko">Demo dogodek</Link>
          <Link className="button button--small desktop-only" href="/naroci">Ustvari dogodek</Link>
          <button
            className={`menu-button ${menuOpen ? "menu-button--open" : ""}`}
            type="button"
            aria-label={menuOpen ? "Zapri meni" : "Odpri meni"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
      <nav id="mobile-navigation" className={`mobile-nav ${menuOpen ? "mobile-nav--open" : ""}`} aria-label="Mobilna navigacija" aria-hidden={!menuOpen}>
        <Link href={howItWorksHref} onClick={closeMenu}>Kako deluje</Link>
        <details className="mobile-nav__events">
          <summary>Za dogodke <span aria-hidden="true">+</span></summary>
          <div>
            {eventUseCases.map((item) => (
              <Link href={`/za-dogodke/${item.slug}`} key={item.slug} onClick={closeMenu}>{item.navTitle}</Link>
            ))}
          </div>
        </details>
        <Link href="/#funkcije" onClick={closeMenu}>Funkcije</Link>
        <Link href="/#cene" onClick={closeMenu}>Cene</Link>
        <Link href="/#faq" onClick={closeMenu}>FAQ</Link>
        <button type="button" onClick={() => { closeMenu(); openLogin("/admin"); }}>Prijava</button>
        <div className="mobile-nav__actions">
          <Link className="button button--secondary" href="/e/ana-in-marko" onClick={closeMenu}>Preizkusi demo dogodek</Link>
          <Link className="button" href="/naroci" onClick={closeMenu}>Ustvari dogodek</Link>
        </div>
      </nav>
    </header>
  );
}

function PhoneGallery() {
  return (
    <div className="phone">
      <div className="phone-screen">
        <Image
          className="phone-shot"
          src="/marketing/screenshots/gallery-mobile.png"
          alt="Galerija dogodka Ana & Marko na telefonu"
          fill
          sizes="300px"
          priority
        />
      </div>
    </div>
  );
}

export function Hero() {
  const cards = [
    ["hero-card--one", "Fotografija gosta 1", 5],
    ["hero-card--two", "Fotografija gosta 2", 6],
    ["hero-card--three", "Fotografija gosta 3", 7],
    ["hero-card--four", "Fotografija gosta 4", 8],
    ["hero-card--five", "Fotografija gosta 5", 9],
    ["hero-card--six", "Fotografija gosta 6", 3],
  ] as const;

  return (
    <section className="hero" id="top">
      <div className="hero-copy shell">
        <div className="eyebrow"><span />QR galerija za dogodke</div>
        <h1>Vse fotografije vašega dogodka na enem mestu.</h1>
        <p>Gostje preprosto skenirajo QR kodo in delijo svoje fotografije — brez aplikacije in brez registracije.</p>
        <div className="hero-buttons">
          <Link className="button" href="/naroci" data-sticky-cta-trigger="create-event">Ustvari dogodek</Link>
          <Link className="button button--secondary" href="/e/ana-in-marko">Preizkusi demo dogodek</Link>
        </div>
        <div className="rating"><span>35 €</span><em>na dogodek · brez naročnine · neomejeno gostov</em></div>
      </div>
      <div className="hero-stage shell">
        {cards.map(([className, label, photo]) => (
          <div className={`hero-card ${className}`} key={className}>
            <VisualPlaceholder label={label} imageSrc={`/gallery/ana-marko/photo-${photo}.jpg`} imageAlt={label} priority />
          </div>
        ))}
        <PhoneGallery />
      </div>
    </section>
  );
}

export function QuickSteps() {
  const steps = [
    ["Ustvarite dogodek", "in prejmete svojo galerijo"],
    ["Gostje skenirajo QR", "in naložijo fotografije"],
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

"use client";

import { useState } from "react";
import { LoginTrigger, useLoginModal } from "@/components/auth/login-modal";
import { VisualPlaceholder } from "./visual-placeholder";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openLogin } = useLoginModal();

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <a className="brand" href="#top" aria-label="Eventaj.si Galerija">
          Eventaj.si <span>|</span> <b>Galerija</b>
        </a>
        <nav className="desktop-nav" aria-label="Glavna navigacija">
          <a href="#kako-deluje">Kako deluje</a>
          <a href="#funkcije">Funkcije</a>
          <a href="#cene">Cene</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="header-actions">
          <LoginTrigger className="login-link">Prijava</LoginTrigger>
          <LoginTrigger className="button button--small" callbackUrl="/admin/events/new">Ustvari dogodek</LoginTrigger>
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
        <a href="#kako-deluje" onClick={closeMenu}>Kako deluje</a>
        <a href="#funkcije" onClick={closeMenu}>Funkcije</a>
        <a href="#cene" onClick={closeMenu}>Cene</a>
        <a href="#faq" onClick={closeMenu}>FAQ</a>
        <button type="button" onClick={() => { closeMenu(); openLogin("/admin"); }}>Prijava</button>
      </nav>
    </header>
  );
}

function PhoneGallery() {
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="phone-heading">
          <span>Poroka</span>
          <strong>Ana &amp; Marko</strong>
          <small>248 fotografij · 32 videov · 87 gostov</small>
        </div>
        <div className="phone-grid">
          {[1, 2, 3, 4].map((item) => <VisualPlaceholder key={item} label="foto" />)}
        </div>
        <div className="phone-action">+ Dodaj fotografije</div>
      </div>
    </div>
  );
}

export function Hero() {
  const cards = [
    ["hero-card--one", "foto gosta 1"],
    ["hero-card--two", "foto gosta 2"],
    ["hero-card--three", "foto gosta 3"],
    ["hero-card--four", "foto gosta 4"],
    ["hero-card--five", "foto gosta 5"],
    ["hero-card--six", "foto gosta 6"],
  ] as const;

  return (
    <section className="hero" id="top">
      <div className="hero-copy shell">
        <div className="eyebrow"><span />QR + NFC galerija za dogodke</div>
        <h1>Vse fotografije vašega dogodka na enem mestu.</h1>
        <p>Gostje preprosto skenirajo QR kodo ali prislonijo telefon na NFC stojalo in delijo svoje fotografije — brez aplikacije in brez registracije.</p>
        <div className="hero-buttons">
          <LoginTrigger className="button" callbackUrl="/admin/events/new">Ustvari dogodek</LoginTrigger>
          <a className="button button--secondary" href="#kako-deluje">Oglej si predstavitev</a>
        </div>
        <div className="rating"><span>★★★★★</span><em className="desktop-only">Zaupa nam več kot 1.000 organizatorjev dogodkov</em><em className="mobile-only">Zaupa nam 1.000+ organizatorjev</em></div>
      </div>
      <div className="hero-stage shell">
        {cards.map(([className, label]) => (
          <div className={`hero-card ${className}`} key={className}><VisualPlaceholder label={label} /></div>
        ))}
        <PhoneGallery />
      </div>
    </section>
  );
}

export function QuickSteps() {
  const steps = [
    ["Ustvarite dogodek", "v manj kot 2 minutah"],
    ["Gostje skenirajo QR ali NFC", "in naložijo fotografije"],
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

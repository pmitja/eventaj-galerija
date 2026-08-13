"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import type { Locale } from "@/lib/i18n/locale";
import { privacyPath } from "@/lib/i18n/routes";
import {
  isGuestMosaicConsentHostname,
  readTrackingConsent,
  saveTrackingConsent,
} from "@/lib/client/tracking-consent";

const copy = {
  sl: {
    title: "Vaša zasebnost, vaša izbira",
    description: "Nujne tehnologije omogočajo delovanje strani. Z vašim dovoljenjem uporabljamo LiveSession za izboljšanje izkušnje in Meta Pixel za merjenje oglasov.",
    acceptAll: "Sprejmi vse",
    rejectAll: "Zavrni vse",
    customize: "Prilagodi",
    save: "Shrani izbiro",
    settings: "Nastavitve piškotkov",
    close: "Zapri nastavitve",
    necessary: "Nujno",
    necessaryDescription: "Varnost, osnovno delovanje in shranjevanje vaše izbire. Vedno aktivno.",
    analytics: "Analitika",
    analyticsDescription: "LiveSession nam pomaga razumeti uporabo strani. Tipkanja ne beležimo.",
    marketing: "Marketing",
    marketingDescription: "Meta Pixel meri uspešnost oglasov in obiske strani.",
    privacy: "Preberite politiko zasebnosti",
  },
  en: {
    title: "Your privacy, your choice",
    description: "Essential technologies keep the site working. With your permission, we use LiveSession to improve the experience and Meta Pixel to measure advertising.",
    acceptAll: "Accept all",
    rejectAll: "Reject all",
    customize: "Customise",
    save: "Save choices",
    settings: "Cookie settings",
    close: "Close settings",
    necessary: "Essential",
    necessaryDescription: "Security, core functionality and remembering your choice. Always active.",
    analytics: "Analytics",
    analyticsDescription: "LiveSession helps us understand site usage. Keystrokes are not recorded.",
    marketing: "Marketing",
    marketingDescription: "Meta Pixel measures ad performance and page visits.",
    privacy: "Read our Privacy Policy",
  },
  de: {
    title: "Ihre Privatsphäre, Ihre Wahl",
    description: "Notwendige Technologien sorgen für den Betrieb der Website. Mit Ihrer Einwilligung nutzen wir LiveSession zur Verbesserung der Nutzung und Meta Pixel zur Werbemessung.",
    acceptAll: "Alle akzeptieren",
    rejectAll: "Alle ablehnen",
    customize: "Anpassen",
    save: "Auswahl speichern",
    settings: "Cookie-Einstellungen",
    close: "Einstellungen schließen",
    necessary: "Notwendig",
    necessaryDescription: "Sicherheit, Grundfunktionen und Speicherung Ihrer Auswahl. Immer aktiv.",
    analytics: "Analyse",
    analyticsDescription: "LiveSession hilft uns, die Nutzung zu verstehen. Tastatureingaben werden nicht aufgezeichnet.",
    marketing: "Marketing",
    marketingDescription: "Meta Pixel misst Werbeerfolg und Seitenaufrufe.",
    privacy: "Datenschutzerklärung lesen",
  },
  nl: {
    title: "Jouw privacy, jouw keuze",
    description: "Noodzakelijke technologieën laten de site werken. Met jouw toestemming gebruiken we LiveSession om de ervaring te verbeteren en Meta Pixel om advertenties te meten.",
    acceptAll: "Alles accepteren",
    rejectAll: "Alles weigeren",
    customize: "Aanpassen",
    save: "Keuzes opslaan",
    settings: "Cookie-instellingen",
    close: "Instellingen sluiten",
    necessary: "Noodzakelijk",
    necessaryDescription: "Beveiliging, basisfuncties en het onthouden van je keuze. Altijd actief.",
    analytics: "Analyse",
    analyticsDescription: "LiveSession helpt ons het gebruik te begrijpen. Toetsaanslagen worden niet opgenomen.",
    marketing: "Marketing",
    marketingDescription: "Meta Pixel meet advertentieprestaties en paginabezoeken.",
    privacy: "Lees ons privacybeleid",
  },
  es: {
    title: "Tu privacidad, tu elección",
    description: "Las tecnologías necesarias mantienen el sitio en funcionamiento. Con tu permiso, usamos LiveSession para mejorar la experiencia y Meta Pixel para medir la publicidad.",
    acceptAll: "Aceptar todo",
    rejectAll: "Rechazar todo",
    customize: "Personalizar",
    save: "Guardar opciones",
    settings: "Configuración de cookies",
    close: "Cerrar configuración",
    necessary: "Necesarias",
    necessaryDescription: "Seguridad, funciones básicas y almacenamiento de tu elección. Siempre activas.",
    analytics: "Analítica",
    analyticsDescription: "LiveSession nos ayuda a entender el uso. No registramos las pulsaciones de teclas.",
    marketing: "Marketing",
    marketingDescription: "Meta Pixel mide el rendimiento publicitario y las visitas a páginas.",
    privacy: "Leer la Política de privacidad",
  },
  it: {
    title: "La tua privacy, la tua scelta",
    description: "Le tecnologie necessarie mantengono operativo il sito. Con il tuo consenso usiamo LiveSession per migliorare l’esperienza e Meta Pixel per misurare la pubblicità.",
    acceptAll: "Accetta tutto",
    rejectAll: "Rifiuta tutto",
    customize: "Personalizza",
    save: "Salva le scelte",
    settings: "Impostazioni cookie",
    close: "Chiudi impostazioni",
    necessary: "Necessari",
    necessaryDescription: "Sicurezza, funzioni di base e memorizzazione della scelta. Sempre attivi.",
    analytics: "Analisi",
    analyticsDescription: "LiveSession ci aiuta a capire l’utilizzo. I tasti premuti non vengono registrati.",
    marketing: "Marketing",
    marketingDescription: "Meta Pixel misura le prestazioni pubblicitarie e le visite alle pagine.",
    privacy: "Leggi l’Informativa sulla privacy",
  },
  fr: {
    title: "Votre vie privée, votre choix",
    description: "Les technologies nécessaires assurent le fonctionnement du site. Avec votre accord, nous utilisons LiveSession pour améliorer l’expérience et Meta Pixel pour mesurer la publicité.",
    acceptAll: "Tout accepter",
    rejectAll: "Tout refuser",
    customize: "Personnaliser",
    save: "Enregistrer mes choix",
    settings: "Paramètres des cookies",
    close: "Fermer les paramètres",
    necessary: "Nécessaires",
    necessaryDescription: "Sécurité, fonctions essentielles et mémorisation de votre choix. Toujours actifs.",
    analytics: "Analyse",
    analyticsDescription: "LiveSession nous aide à comprendre l’utilisation. Les frappes au clavier ne sont pas enregistrées.",
    marketing: "Marketing",
    marketingDescription: "Meta Pixel mesure les performances publicitaires et les visites de pages.",
    privacy: "Lire la Politique de confidentialité",
  },
} as const satisfies Record<Locale, Record<string, string>>;

const buttonBase = "min-h-11 cursor-pointer rounded-xl px-4 py-2.5 text-sm font-extrabold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f1d52]";
const categoryClass = "flex items-start justify-between gap-4 rounded-xl border border-[#eadde3] bg-[#fffafb] p-3.5";

function subscribe(): () => void {
  return () => undefined;
}

function consentSnapshot(): string {
  if (!isGuestMosaicConsentHostname(window.location.hostname)) return "unavailable";
  const consent = readTrackingConsent();
  return consent ? JSON.stringify(consent) : "missing";
}

export function CookieConsent({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const snapshot = useSyncExternalStore(subscribe, consentSnapshot, () => "server");
  const consent = snapshot.startsWith("{") ? readTrackingConsent() : null;
  const open = snapshot === "missing" || customizing;

  function persist(nextAnalytics: boolean, nextMarketing: boolean) {
    saveTrackingConsent({ analytics: nextAnalytics, marketing: nextMarketing });
    window.location.reload();
  }

  if (snapshot === "server" || snapshot === "unavailable") return null;

  if (!open) {
    return (
      <button
        type="button"
        className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-4 z-[70] inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-[#d8c7cf] bg-white px-3.5 py-2 text-xs font-extrabold text-[#4e1831] shadow-[0_8px_24px_rgba(63,13,37,.12)] transition-colors duration-200 hover:bg-[#fdf2f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f1d52] lg:bottom-4"
        onClick={() => {
          setAnalytics(consent?.analytics ?? false);
          setMarketing(consent?.marketing ?? false);
          setCustomizing(true);
        }}
      >
        <Cookie aria-hidden="true" className="size-4" />
        {t.settings}
      </button>
    );
  }

  return (
    <section
      aria-labelledby="cookie-consent-title"
      aria-live="polite"
      className="fixed right-3 bottom-[max(12px,env(safe-area-inset-bottom))] left-3 z-[80] mx-auto max-h-[calc(100dvh-24px)] max-w-[720px] overflow-y-auto rounded-2xl border border-[#eadde3] bg-white p-5 text-[#3f0d25] shadow-[0_18px_60px_rgba(63,13,37,.22)] sm:p-6"
      role="dialog"
    >
      {customizing ? (
        <button
          type="button"
          aria-label={t.close}
          className="absolute top-3 right-3 inline-grid size-11 cursor-pointer place-items-center rounded-full text-[#765d68] transition-colors duration-200 hover:bg-[#fdf2f8] hover:text-[#3f0d25] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f1d52]"
          onClick={() => setCustomizing(false)}
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      ) : null}

      <div className="pr-8">
        <p className="mb-1 text-[11px] font-extrabold tracking-[.13em] text-[#9f1d52] uppercase">Guest Mosaic</p>
        <h2 className="m-0 text-xl leading-tight tracking-[-.02em] sm:text-2xl" id="cookie-consent-title">{t.title}</h2>
        <p className="mt-2.5 mb-0 max-w-[65ch] text-sm leading-6 text-[#624b57] sm:text-[15px]">{t.description}</p>
      </div>

      {customizing ? (
        <div className="mt-5 grid gap-2.5">
          <div className={categoryClass}>
            <span><strong className="block text-sm">{t.necessary}</strong><small className="mt-1 block text-xs leading-5 text-[#6f5964]">{t.necessaryDescription}</small></span>
            <span className="rounded-full bg-[#fce7f3] px-2.5 py-1 text-[11px] font-extrabold text-[#831843]">ON</span>
          </div>
          <label className={categoryClass}>
            <span><strong className="block text-sm">{t.analytics}</strong><small className="mt-1 block text-xs leading-5 text-[#6f5964]">{t.analyticsDescription}</small></span>
            <input className="mt-1 size-5 shrink-0 cursor-pointer accent-[#9f1d52]" type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
          </label>
          <label className={categoryClass}>
            <span><strong className="block text-sm">{t.marketing}</strong><small className="mt-1 block text-xs leading-5 text-[#6f5964]">{t.marketingDescription}</small></span>
            <input className="mt-1 size-5 shrink-0 cursor-pointer accent-[#9f1d52]" type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />
          </label>
        </div>
      ) : null}

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <button type="button" className={`${buttonBase} border border-[#cdb8c2] bg-white text-[#4e1831] hover:bg-[#fff7fa]`} onClick={() => persist(false, false)}>{t.rejectAll}</button>
        {customizing ? (
          <button type="button" className={`${buttonBase} bg-[#9f1d52] text-white hover:bg-[#851342] sm:ml-auto`} onClick={() => persist(analytics, marketing)}>{t.save}</button>
        ) : (
          <>
            <button type="button" className={`${buttonBase} border border-transparent bg-[#fce7f3] text-[#831843] hover:bg-[#fbcfe8]`} onClick={() => setCustomizing(true)}>{t.customize}</button>
            <button type="button" className={`${buttonBase} bg-[#9f1d52] text-white hover:bg-[#851342] sm:ml-auto`} onClick={() => persist(true, true)}>{t.acceptAll}</button>
          </>
        )}
      </div>

      <Link className="mt-4 inline-flex min-h-11 items-center text-xs font-bold text-[#8f1748] underline decoration-[#d7a4b9] underline-offset-4 hover:text-[#6f1036] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9f1d52]" href={privacyPath(locale)}>{t.privacy}</Link>
    </section>
  );
}

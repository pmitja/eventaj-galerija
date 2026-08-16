import Link from "next/link";
import type { Locale } from "@/lib/i18n/locale";
import {
  SOLUTION_PAGE_PATHS,
  solutionPagePath,
  type SolutionPageId,
  type SolutionPageLocale,
} from "@/lib/i18n/routes";
import { getSolutionPage } from "./solution-pages";

const HUB_COPY: Record<SolutionPageLocale, { pill: string; heading: string; text: string; open: string }> = {
  en: { pill: "Choose your setup", heading: "One simple gallery, shaped around your event.", text: "Start with the outcome that matters most. Every option uses the same no-app guest flow and one-off event price.", open: "Explore solution" },
  de: { pill: "Passende Lösung wählen", heading: "Eine einfache Galerie, passend zu eurem Event.", text: "Startet mit dem wichtigsten Ziel. Jede Lösung nutzt denselben Gäste-Upload ohne App und einen einmaligen Eventpreis.", open: "Lösung ansehen" },
  nl: { pill: "Kies je oplossing", heading: "Eén eenvoudige galerij, passend bij je evenement.", text: "Begin met het resultaat dat telt. Elke optie gebruikt dezelfde upload zonder app en een eenmalige prijs.", open: "Bekijk oplossing" },
  es: { pill: "Elige tu solución", heading: "Una galería sencilla, adaptada a vuestro evento.", text: "Empezad por el resultado que más importa. Todas las opciones usan la misma subida sin app y un precio único.", open: "Ver solución" },
  it: { pill: "Scegli la soluzione", heading: "Una galleria semplice, pensata per il vostro evento.", text: "Partite dal risultato più importante. Ogni opzione usa lo stesso caricamento senza app e un prezzo unico.", open: "Scopri la soluzione" },
  fr: { pill: "Choisissez votre solution", heading: "Une galerie simple, adaptée à votre événement.", text: "Commencez par le résultat essentiel. Chaque option utilise le même envoi sans application et un prix unique.", open: "Découvrir" },
};

export function SolutionHub({ locale }: { locale: Locale }) {
  if (locale === "sl") return null;
  const solutionLocale = locale as SolutionPageLocale;
  const copy = HUB_COPY[solutionLocale];
  const ids = Object.keys(SOLUTION_PAGE_PATHS) as SolutionPageId[];

  return (
    <section className="section solution-hub" aria-labelledby="solution-hub-heading">
      <div className="shell">
        <div className="section-heading">
          <span className="section-pill">{copy.pill}</span>
          <h2 id="solution-hub-heading">{copy.heading}</h2>
          <p>{copy.text}</p>
        </div>
        <div className="solution-hub__grid">
          {ids.map((id, index) => {
            const page = getSolutionPage(id, solutionLocale);
            const href = solutionPagePath(solutionLocale, id);
            return href ? (
              <Link href={href} key={id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{page.navTitle}</strong>
                <p>{page.metaDescription}</p>
                <b>{copy.open} <span aria-hidden="true">→</span></b>
              </Link>
            ) : null;
          })}
        </div>
      </div>
    </section>
  );
}

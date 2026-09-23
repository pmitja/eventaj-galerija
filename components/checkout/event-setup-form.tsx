"use client";
import { withEnglishUS } from "@/lib/i18n/english-regions";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { detectedTimeZone } from "@/lib/datetime/timezone";
import { useLocale } from "@/components/i18n/locale-provider";

const fieldClass = "flex flex-col gap-2";
const labelClass = "text-[15px] font-semibold";
const inputClass = "w-full rounded-[14px] border-[1.5px] border-gm-line-strong bg-white px-4 py-[15px] font-gm text-[16px] font-medium text-gm-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-gm-accent focus:shadow-[0_0_0_4px_#f0d9d3]";

const COPY = withEnglishUS({
  sl: ["Naziv dogodka", "Datum dogodka", "Lokacija (neobvezno)", "Časovni pas", "Shrani in pripravi QR", "Shranjujemo…", "Podatkov ni bilo mogoče shraniti."],
  en: ["Event name", "Event date", "Location (optional)", "Time zone", "Save and create QR", "Saving…", "We couldn’t save the event."],
  de: ["Eventname", "Eventdatum", "Ort (optional)", "Zeitzone", "Speichern und QR erstellen", "Wird gespeichert…", "Das Event konnte nicht gespeichert werden."],
  nl: ["Naam evenement", "Datum evenement", "Locatie (optioneel)", "Tijdzone", "Opslaan en QR maken", "Opslaan…", "Het evenement kon niet worden opgeslagen."],
  es: ["Nombre del evento", "Fecha del evento", "Ubicación (opcional)", "Zona horaria", "Guardar y crear QR", "Guardando…", "No se pudo guardar el evento."],
  it: ["Nome dell’evento", "Data dell’evento", "Luogo (facoltativo)", "Fuso orario", "Salva e crea il QR", "Salvataggio…", "Impossibile salvare l’evento."],
  fr: ["Nom de l’événement", "Date de l’événement", "Lieu (facultatif)", "Fuseau horaire", "Enregistrer et créer le QR", "Enregistrement…", "Impossible d’enregistrer l’événement."],
} as const);

export function EventSetupForm({ token, defaults }: { token: string; defaults: { name: string; location: string; date: string; timezone: string } }) {
  const locale = useLocale(); const copy = COPY[locale];
  const [pending, setPending] = useState(false); const [error, setError] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(null);
    const data = new FormData(event.currentTarget);
    const response = await fetch(`/api/v1/manage/${encodeURIComponent(token)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventName: data.get("eventName"), eventDate: data.get("eventDate"), eventLocation: data.get("eventLocation"), timezone: data.get("timezone") }) });
    if (response.ok) window.location.reload(); else { setError(copy[6]); setPending(false); }
  }
  return <form className="grid gap-4" onSubmit={submit}>
    <label className={fieldClass} htmlFor="eventName"><span className={labelClass}>{copy[0]}</span><input className={inputClass} id="eventName" name="eventName" required minLength={2} defaultValue={defaults.name} /></label>
    <label className={fieldClass} htmlFor="eventDate"><span className={labelClass}>{copy[1]}</span><input className={inputClass} id="eventDate" name="eventDate" type="date" required defaultValue={defaults.date} /></label>
    <label className={fieldClass} htmlFor="eventLocation"><span className={labelClass}>{copy[2]}</span><input className={inputClass} id="eventLocation" name="eventLocation" defaultValue={defaults.location} /></label>
    <label className={fieldClass} htmlFor="timezone"><span className={labelClass}>{copy[3]}</span><input className={inputClass} id="timezone" name="timezone" required defaultValue={defaults.timezone === "UTC" ? detectedTimeZone() : defaults.timezone} /></label>
    {error ? <p role="alert" className="text-[14px] text-gm-accent-dark">{error}</p> : null}
    <button type="submit" className="flex min-h-[58px] cursor-pointer items-center justify-center gap-2 rounded-full border-0 bg-gm-accent px-6 text-[17px] font-semibold text-white! shadow-[0_10px_24px_rgba(168,69,58,.28)] transition-colors duration-200 hover:bg-gm-accent-dark disabled:cursor-progress disabled:bg-gm-accent-dark" disabled={pending}>{pending ? <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> : null}{pending ? copy[5] : copy[4]}</button>
  </form>;
}

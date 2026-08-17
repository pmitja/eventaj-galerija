"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { detectedTimeZone } from "@/lib/datetime/timezone";
import { useLocale } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

const COPY = {
  sl: ["Naziv dogodka", "Datum dogodka", "Lokacija (neobvezno)", "Časovni pas", "Shrani in pripravi QR", "Shranjujemo…", "Podatkov ni bilo mogoče shraniti."],
  en: ["Event name", "Event date", "Location (optional)", "Time zone", "Save and create QR", "Saving…", "We couldn’t save the event."],
  de: ["Eventname", "Eventdatum", "Ort (optional)", "Zeitzone", "Speichern und QR erstellen", "Wird gespeichert…", "Das Event konnte nicht gespeichert werden."],
  nl: ["Naam evenement", "Datum evenement", "Locatie (optioneel)", "Tijdzone", "Opslaan en QR maken", "Opslaan…", "Het evenement kon niet worden opgeslagen."],
  es: ["Nombre del evento", "Fecha del evento", "Ubicación (opcional)", "Zona horaria", "Guardar y crear QR", "Guardando…", "No se pudo guardar el evento."],
  it: ["Nome dell’evento", "Data dell’evento", "Luogo (facoltativo)", "Fuso orario", "Salva e crea il QR", "Salvataggio…", "Impossibile salvare l’evento."],
  fr: ["Nom de l’événement", "Date de l’événement", "Lieu (facultatif)", "Fuseau horaire", "Enregistrer et créer le QR", "Enregistrement…", "Impossible d’enregistrer l’événement."],
} as const;

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
    <Field><FieldLabel htmlFor="eventName">{copy[0]}</FieldLabel><Input id="eventName" name="eventName" required minLength={2} defaultValue={defaults.name} /></Field>
    <Field><FieldLabel htmlFor="eventDate">{copy[1]}</FieldLabel><Input id="eventDate" name="eventDate" type="date" required defaultValue={defaults.date} /></Field>
    <Field><FieldLabel htmlFor="eventLocation">{copy[2]}</FieldLabel><Input id="eventLocation" name="eventLocation" defaultValue={defaults.location} /></Field>
    <Field><FieldLabel htmlFor="timezone">{copy[3]}</FieldLabel><Input id="timezone" name="timezone" required defaultValue={defaults.timezone === "UTC" ? detectedTimeZone() : defaults.timezone} /></Field>
    {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    <Button className="min-h-[54px]" disabled={pending}>{pending ? <LoaderCircle className="size-5 animate-spin" /> : null}{pending ? copy[5] : copy[4]}</Button>
  </form>;
}

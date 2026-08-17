"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, LoaderCircle, ShieldCheck, TriangleAlert } from "lucide-react";
import { minimalCheckoutSchema, type MinimalCheckoutValues } from "@/lib/validation/checkout";
import { useLocale } from "@/components/i18n/locale-provider";
import { termsPath, privacyPath } from "@/lib/i18n/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

const COPY = {
  sl: ["Tvoj e-poštni naslov", "Na ta naslov prejmeš povezavo za nastavitev dogodka.", "Sprejemam", "pogoje uporabe", "in", "pravilnik o zasebnosti", "Nadaljuj na varno plačilo · 35 €", "Odpiramo Stripe …", "Plačilo varno obdela Stripe. Podatke dogodka vneseš po plačilu."],
  en: ["Your email address", "We’ll send your private event setup link here.", "I accept the", "terms of use", "and", "privacy policy", "Continue to secure payment · €35", "Opening Stripe…", "Stripe securely processes the payment. You set up the event afterwards."],
  de: ["Deine E-Mail-Adresse", "Hierhin senden wir deinen privaten Einrichtungslink.", "Ich akzeptiere die", "Nutzungsbedingungen", "und die", "Datenschutzerklärung", "Sicher bezahlen · 35 €", "Stripe wird geöffnet…", "Stripe verarbeitet die Zahlung sicher. Danach richtest du das Event ein."],
  nl: ["Je e-mailadres", "We sturen je persoonlijke instellink naar dit adres.", "Ik accepteer de", "gebruiksvoorwaarden", "en het", "privacybeleid", "Veilig betalen · € 35", "Stripe openen…", "Stripe verwerkt de betaling veilig. Daarna stel je het evenement in."],
  es: ["Tu correo electrónico", "Te enviaremos aquí tu enlace privado de configuración.", "Acepto los", "términos de uso", "y la", "política de privacidad", "Continuar al pago seguro · 35 €", "Abriendo Stripe…", "Stripe procesa el pago de forma segura. Configurarás el evento después."],
  it: ["Il tuo indirizzo email", "Invieremo qui il link privato per configurare l’evento.", "Accetto i", "termini di utilizzo", "e l’", "informativa sulla privacy", "Continua al pagamento sicuro · 35 €", "Apertura di Stripe…", "Stripe gestisce il pagamento in modo sicuro. Configurerai l’evento dopo."],
  fr: ["Votre adresse e-mail", "Nous y enverrons votre lien privé de configuration.", "J’accepte les", "conditions d’utilisation", "et la", "politique de confidentialité", "Continuer vers le paiement sécurisé · 35 €", "Ouverture de Stripe…", "Stripe traite le paiement en toute sécurité. Vous configurerez ensuite l’événement."],
} as const;

export function MinimalCheckoutForm() {
  const locale = useLocale();
  const copy = COPY[locale];
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<MinimalCheckoutValues>({ resolver: zodResolver(minimalCheckoutSchema), defaultValues: { ownerEmail: "", termsAccepted: false } });
  const { errors, isSubmitting } = form.formState;

  async function submit(data: MinimalCheckoutValues) {
    setServerError(null);
    try {
      const response = await fetch("/api/v1/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const body = await response.json().catch(() => null) as { checkout?: { url: string }; detail?: string; title?: string } | null;
      if (!response.ok || !body?.checkout?.url) throw new Error(body?.detail ?? body?.title ?? "Checkout is unavailable.");
      window.location.assign(body.checkout.url);
    } catch (error) { setServerError(error instanceof Error ? error.message : "Checkout is unavailable."); }
  }

  return <Card className="mx-auto max-w-[540px] shadow-[0_18px_48px_rgba(79,18,47,.09)]">
    <CardHeader><CardTitle>35 €</CardTitle><CardDescription>{copy[8]}</CardDescription></CardHeader>
    <CardContent><form className="grid gap-5" onSubmit={form.handleSubmit(submit)} noValidate>
      <Field><FieldLabel htmlFor="ownerEmail">{copy[0]}</FieldLabel><Input id="ownerEmail" type="email" inputMode="email" autoComplete="email" required autoFocus aria-invalid={Boolean(errors.ownerEmail)} {...form.register("ownerEmail")} /><small className="text-[12px] text-plum-muted">{copy[1]}</small>{errors.ownerEmail ? <FieldError>{errors.ownerEmail.message}</FieldError> : null}</Field>
      <Controller control={form.control} name="termsAccepted" render={({ field }) => <label className="flex cursor-pointer items-start gap-2.5 text-[12px]/[1.5] text-[#68495a]"><Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} /><span>{copy[2]} <Link className="underline" href={termsPath(locale)} target="_blank">{copy[3]}</Link> {copy[4]} <Link className="underline" href={privacyPath(locale)} target="_blank">{copy[5]}</Link>.</span></label>} />
      {errors.termsAccepted ? <FieldError>{errors.termsAccepted.message}</FieldError> : null}
      {serverError ? <div role="alert" className="flex gap-2 text-sm text-red-700"><TriangleAlert className="size-4" />{serverError}</div> : null}
      <Button className="min-h-[56px] w-full text-[16px]" type="submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="size-5 animate-spin" /> : <CreditCard className="size-5" />}{isSubmitting ? copy[7] : copy[6]}</Button>
      <div className="flex items-start justify-center gap-2 text-[11.5px] text-plum-muted"><ShieldCheck className="size-4 text-green-600" />{copy[8]}</div>
    </form></CardContent>
  </Card>;
}

"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Check, Download, LoaderCircle, LockKeyhole, Mail, ScanFace, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { format } from "date-fns";
import { sl } from "date-fns/locale";
import { Alert, Separator } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel, RequiredMark } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/validation/checkout";
import styles from "./checkout.module.css";

function dateFromValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day, 12) : undefined;
}

function valueFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function DatePickerField({ id, label, value, onChange, error, disabledBefore }: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabledBefore?: Date;
}) {
  const [open, setOpen] = useState(false);
  const selected = dateFromValue(value);
  return <Field>
    <FieldLabel htmlFor={id}>Datum<RequiredMark /></FieldLabel>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} type="button" variant="outline" className={styles.dateButton} aria-label={label} aria-required="true" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}>
          <CalendarDays aria-hidden="true" />
          <span>{selected ? format(selected, "d. MMM yyyy", { locale: sl }) : "Izberi datum"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(valueFromDate(date));
            setOpen(false);
          }}
          disabled={disabledBefore ? { before: disabledBefore } : undefined}
          autoFocus
        />
      </PopoverContent>
    </Popover>
    {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
  </Field>;
}

function SectionHeading({ step, title, description }: { step: string; title: string; description: string }) {
  return <CardHeader className={styles.sectionHeader}>
    <span className={styles.stepNumber} aria-hidden="true">{step}</span>
    <div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </div>
  </CardHeader>;
}

export function CheckoutForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    mode: "onBlur",
    defaultValues: {
      organizationName: "",
      ownerName: "",
      ownerEmail: "",
      eventName: "",
      eventLocation: "",
      startDate: "",
      startTime: "16:00",
      endDate: "",
      endTime: "23:59",
      commentsEnabled: true,
      aiBestPhotos: false,
      faceCollections: false,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const [aiBestPhotos, faceCollections, startDate] = useWatch({ control: form.control, name: ["aiBestPhotos", "faceCollections", "startDate"] });
  const totalEuros = 35 + (aiBestPhotos ? 15 : 0) + (faceCollections ? 5 : 0);

  async function submit(data: CheckoutFormValues) {
    setServerError(null);
    try {
      const response = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          organizationName: data.organizationName,
          ownerName: data.ownerName,
          ownerEmail: data.ownerEmail,
          eventName: data.eventName,
          eventLocation: data.eventLocation,
          startsAt: new Date(`${data.startDate}T${data.startTime}:00`).toISOString(),
          endsAt: new Date(`${data.endDate}T${data.endTime}:00`).toISOString(),
          timezone: "Europe/Ljubljana",
          commentsEnabled: data.commentsEnabled,
          aiBestPhotos: data.aiBestPhotos,
          faceCollections: data.faceCollections,
        }),
      });
      const body = await response.json().catch(() => null) as { checkout?: { url: string }; detail?: string; title?: string } | null;
      if (!response.ok || !body?.checkout?.url) throw new Error(body?.detail ?? body?.title ?? "Plačila ni mogoče začeti.");
      window.location.assign(body.checkout.url);
    } catch (cause) {
      setServerError(cause instanceof Error ? cause.message : "Plačila ni mogoče začeti.");
    }
  }

  return <form className={styles.form} onSubmit={form.handleSubmit(submit)} noValidate>
    <p className={styles.requiredNote}><span aria-hidden="true">*</span> označuje obvezno polje</p>
    <div className={styles.formLayout}>
      <div className={styles.formColumn}>
        <Card>
          <SectionHeading step="1" title="Kam pošljemo QR?" description="Na ta naslov pošljemo QR kodo, po dogodku pa še ZIP vseh fotografij. Prijave ne potrebuješ." />
          <CardContent className={styles.fieldsGrid}>
            <Field>
              <FieldLabel htmlFor="organizationName">Organizacija<RequiredMark /></FieldLabel>
              <Input id="organizationName" required autoComplete="organization" placeholder="npr. Studio Sever" aria-invalid={Boolean(errors.organizationName)} aria-describedby={errors.organizationName ? "organizationName-error" : undefined} {...form.register("organizationName")} />
              {errors.organizationName ? <FieldError id="organizationName-error">{errors.organizationName.message}</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="ownerName">Ime in priimek<RequiredMark /></FieldLabel>
              <Input id="ownerName" required autoComplete="name" placeholder="npr. Nina Novak" aria-invalid={Boolean(errors.ownerName)} aria-describedby={errors.ownerName ? "ownerName-error" : undefined} {...form.register("ownerName")} />
              {errors.ownerName ? <FieldError id="ownerName-error">{errors.ownerName.message}</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="ownerEmail">E-pošta<RequiredMark /></FieldLabel>
              <Input id="ownerEmail" type="email" required inputMode="email" autoComplete="email" placeholder="ime@podjetje.si" aria-invalid={Boolean(errors.ownerEmail)} aria-describedby={errors.ownerEmail ? "ownerEmail-error" : undefined} {...form.register("ownerEmail")} />
              {errors.ownerEmail ? <FieldError id="ownerEmail-error">{errors.ownerEmail.message}</FieldError> : null}
            </Field>
            <div className={styles.deliveryPromise}>
              <Mail aria-hidden="true" />
              <span><strong>Takoj po plačilu</strong><small>QR koda in neposredna povezava do dogodka.</small></span>
            </div>
            <div className={styles.deliveryPromise}>
              <Download aria-hidden="true" />
              <span><strong>Po zaključku dogodka</strong><small>24-urna povezava do ZIP-a vseh fotografij.</small></span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <SectionHeading step="2" title="Podatki o dogodku" description="Vnesi osnovne podatke in določi, kdaj bo galerija aktivna." />
          <CardContent className={styles.eventContent}>
            <div className={styles.fieldsGrid}>
              <Field className={styles.fullWidth}>
                <FieldLabel htmlFor="eventName">Naziv dogodka<RequiredMark /></FieldLabel>
                <Input id="eventName" required placeholder="npr. Poroka Ane in Marka" aria-invalid={Boolean(errors.eventName)} aria-describedby={errors.eventName ? "eventName-error" : undefined} {...form.register("eventName")} />
                {errors.eventName ? <FieldError id="eventName-error">{errors.eventName.message}</FieldError> : null}
              </Field>
              <Field className={styles.fullWidth}>
                <FieldLabel htmlFor="eventLocation">Lokacija <span className={styles.optional}>(neobvezno)</span></FieldLabel>
                <Input id="eventLocation" placeholder="npr. Vila Bled" autoComplete="off" aria-invalid={Boolean(errors.eventLocation)} {...form.register("eventLocation")} />
                {errors.eventLocation ? <FieldError>{errors.eventLocation.message}</FieldError> : null}
              </Field>
            </div>

            <div className={styles.timeline}>
              <div className={styles.dateTimeGroup}>
                <div className={styles.dateTimeHeading}><span>Začetek</span><small>Europe/Ljubljana</small></div>
                <div className={styles.dateTimeFields}>
                  <Controller control={form.control} name="startDate" render={({ field }) => <DatePickerField id="startDate" label="Izberi datum začetka" value={field.value} onChange={(value) => {
                    field.onChange(value);
                    if (!form.getValues("endDate")) form.setValue("endDate", value, { shouldValidate: true });
                  }} error={errors.startDate?.message} disabledBefore={new Date(new Date().setHours(0, 0, 0, 0))} />} />
                  <Field>
                    <FieldLabel htmlFor="startTime">Čas<RequiredMark /></FieldLabel>
                    <Input id="startTime" type="time" required aria-label="Čas začetka" aria-invalid={Boolean(errors.startTime)} {...form.register("startTime")} />
                    {errors.startTime ? <FieldError>{errors.startTime.message}</FieldError> : null}
                  </Field>
                </div>
              </div>
              <div className={styles.dateTimeGroup}>
                <div className={styles.dateTimeHeading}><span>Konec</span><small>Po začetku dogodka</small></div>
                <div className={styles.dateTimeFields}>
                  <Controller control={form.control} name="endDate" render={({ field }) => <DatePickerField id="endDate" label="Izberi datum konca" value={field.value} onChange={field.onChange} error={errors.endDate?.message} disabledBefore={dateFromValue(startDate)} />} />
                  <Field>
                    <FieldLabel htmlFor="endTime">Čas<RequiredMark /></FieldLabel>
                    <Input id="endTime" type="time" required aria-label="Čas konca" aria-invalid={Boolean(errors.endTime)} {...form.register("endTime")} />
                    {errors.endTime ? <FieldError>{errors.endTime.message}</FieldError> : null}
                  </Field>
                </div>
              </div>
            </div>

            <Controller control={form.control} name="commentsEnabled" render={({ field }) => <label className={styles.commentsOption} htmlFor="commentsEnabled">
              <Checkbox id="commentsEnabled" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              <span><strong>Omogoči komentarje gostov</strong><small>Gostje bodo lahko komentirali fotografije v galeriji.</small></span>
            </label>} />
          </CardContent>
        </Card>
      </div>

      <aside className={styles.summary} aria-label="Povzetek naročila">
        <Card className={styles.summaryCard}>
          <CardHeader>
            <CardTitle>Povzetek naročila</CardTitle>
            <CardDescription>Enkratno plačilo, brez naročnine.</CardDescription>
          </CardHeader>
          <CardContent className={styles.summaryContent}>
            <div className={styles.productRow}>
              <div className={styles.productIcon}><CalendarDays aria-hidden="true" /></div>
              <div><strong>Eventaj Galerija</strong><span>1 dogodek · 90 dni hrambe</span></div>
              <b>35 €</b>
            </div>
            <ul className={styles.includedList}>
              <li><Check aria-hidden="true" /> Neomejeno gostov</li>
              <li><Check aria-hidden="true" /> QR koda in foto galerija</li>
              <li><Check aria-hidden="true" /> QR takoj po e-pošti</li>
              <li><Check aria-hidden="true" /> ZIP po zaključku dogodka</li>
            </ul>
            <Separator />
            <Controller control={form.control} name="aiBestPhotos" render={({ field }) => <label className={styles.addon} htmlFor="aiBestPhotos">
              <Checkbox id="aiBestPhotos" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              <span><strong><Sparkles aria-hidden="true" /> AI Best Photos</strong><small>Samodejni izbor do 3.000 fotografij.</small></span>
              <b>+15 €</b>
            </label>} />
            <Controller control={form.control} name="faceCollections" render={({ field }) => <label className={styles.addon} htmlFor="faceCollections">
              <Checkbox id="faceCollections" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} />
              <span><strong><ScanFace aria-hidden="true" /> AI iskanje po obrazu</strong><small>Gostje s selfijem najdejo svoje fotografije.</small></span>
              <b>+5 €</b>
            </label>} />
            <Separator />
            <div className={styles.total}><span>Skupaj</span><strong>{totalEuros} €</strong></div>
            <span className={styles.taxNote}>Cena vključuje DDV.</span>
            {serverError ? <Alert role="alert"><TriangleAlert aria-hidden="true" /><span>{serverError}</span></Alert> : null}
            <Button className={styles.submit} type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className={styles.spinner} aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
              {isSubmitting ? "Odpiram varno plačilo …" : "Nadaljuj na plačilo"}
            </Button>
            <div className={styles.secureNote}><ShieldCheck aria-hidden="true" /><span>Plačilo varno obdela Stripe. Kartičnih podatkov ne hranimo.</span></div>
          </CardContent>
        </Card>
      </aside>
    </div>
  </form>;
}

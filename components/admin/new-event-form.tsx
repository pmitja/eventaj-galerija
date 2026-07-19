"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icon";
import styles from "./admin.module.css";

export function NewEventForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    const startsAt = new Date(`${formData.get("startDate")}T${formData.get("startTime")}`).toISOString();
    const endsAt = new Date(`${formData.get("endDate")}T${formData.get("endTime")}`).toISOString();
    const response = await fetch("/api/v1/admin/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        location: formData.get("location"),
        startsAt,
        endsAt,
        timezone: "Europe/Ljubljana",
        customerName: formData.get("customerName"),
        customerEmail: formData.get("customerEmail"),
        packageCode: formData.get("packageCode"),
        commentsEnabled: formData.get("commentsEnabled") === "on",
      }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { detail?: string } | null;
      setError(body?.detail ?? "Dogodka ni bilo mogoče ustvariti.");
      setPending(false);
      return;
    }
    router.push("/admin/events");
    router.refresh();
  }

  return (
    <form className={styles.formStack} action={submit}>
      <section className={styles.formSection}>
        <div className={styles.formSectionIntro}><span>1</span><div><h2>Osnovni podatki</h2><p>Dogodek dobi varno, nepredvidljivo povezavo.</p></div></div>
        <div className={styles.formGrid}>
          <label className={styles.fieldWide}><span>Naziv dogodka</span><input name="name" required minLength={2} placeholder="npr. Poroka Ane & Marka" /></label>
          <label><span>Datum začetka</span><input name="startDate" type="date" required /></label>
          <label><span>Čas začetka</span><input name="startTime" type="time" required defaultValue="16:00" /></label>
          <label><span>Datum konca</span><input name="endDate" type="date" required /></label>
          <label><span>Čas konca</span><input name="endTime" type="time" required defaultValue="23:59" /></label>
          <label className={styles.fieldWide}><span>Lokacija</span><input name="location" placeholder="npr. Vila Bled" /></label>
          <label><span>Časovni pas</span><input value="Europe/Ljubljana" readOnly /></label>
          <label><span>Hramba</span><input value="90 dni po koncu" readOnly /></label>
        </div>
      </section>
      <section className={styles.formSection}>
        <div className={styles.formSectionIntro}><span>2</span><div><h2>Stranka in paket</h2><p>Stranka bo vezana na dogodek, njen status pa bo sledil statusu dogodka.</p></div></div>
        <div className={styles.formGrid}>
          <label><span>Ime ali naziv stranke</span><input name="customerName" required minLength={2} placeholder="npr. Ana Kovač" /></label>
          <label><span>E-poštni naslov</span><input name="customerEmail" type="email" required autoComplete="email" placeholder="ana@example.com" /></label>
          <label className={styles.fieldWide}><span>Izbrani paket</span><select name="packageCode" required defaultValue="advanced"><option value="basic">Basic · 19 €</option><option value="advanced">Advanced · 39 €</option><option value="premium">Premium · 99 €</option></select></label>
        </div>
      </section>
      <section className={styles.formSection}>
        <div className={styles.infoNote}><Icon name="shield" size={18} /><p>Galerija bo <strong>neindeksirana</strong> in dostopna vsakomur z nepredvidljivo povezavo.</p></div>
        <label className={styles.eventOption}>
          <span><strong>Komentarji gostov</strong><small>Gostje lahko komentirajo posamezne fotografije. Nastavitev lahko pozneje spremeniš.</small></span>
          <input name="commentsEnabled" type="checkbox" defaultChecked />
        </label>
      </section>
      {error ? <p role="alert">{error}</p> : null}
      <div className={styles.formActions}><button type="submit" className={styles.primaryAction} disabled={pending}>{pending ? "Shranjujem …" : "Ustvari dogodek"} <Icon name="arrow" size={18} /></button></div>
    </form>
  );
}

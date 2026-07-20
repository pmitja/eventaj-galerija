"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./icon";
import styles from "./admin.module.css";

type EventOption = {
  id: string;
  name: string;
};

type AccessPointItem = {
  id: string;
  publicCode: string;
  label: string;
  type: string;
  active: boolean;
  visitCount: number;
  eventName: string;
  eventSlug: string;
};

export function AccessPointsPanel({
  events,
  accessPoints,
  publicAppUrl,
}: {
  events: EventOption[];
  accessPoints: AccessPointItem[];
  publicAppUrl: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(accessPoints.length === 0 && events.length > 0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  async function createPoint(formData: FormData) {
    setPending(true);
    setError(null);
    const eventId = String(formData.get("eventId") ?? "");
    const response = await fetch(`/api/v1/admin/events/${encodeURIComponent(eventId)}/access-points`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label: formData.get("label"), type: "qr" }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { detail?: string } | null;
      setError(body?.detail ?? "Dostopne točke ni bilo mogoče ustvariti.");
      setPending(false);
      return;
    }
    setPending(false);
    setShowForm(false);
    router.refresh();
  }

  async function copyStableLink(publicCode: string) {
    const url = `${publicAppUrl.replace(/\/$/, "")}/t/${publicCode}`;
    await navigator.clipboard.writeText(url);
    setCopiedCode(publicCode);
    window.setTimeout(() => setCopiedCode(null), 1800);
  }

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelTop}>
          <div><h2>QR dostopne točke</h2><p>Vsaka koda uporablja stabilno povezavo in meri svoje obiske.</p></div>
          {events.length > 0 ? (
            <button type="button" className={styles.primaryAction} onClick={() => setShowForm((current) => !current)}>
              <Icon name="plus" size={18} /> Nova dostopna točka
            </button>
          ) : <Link className={styles.primaryAction} href="/admin/events/new"><Icon name="plus" size={18} /> Ustvari dogodek</Link>}
        </div>
        {showForm ? (
          <form className={styles.formStack} action={createPoint}>
            <div className={styles.formGrid}>
              <label><span>Dogodek</span><select name="eventId" required>{events.map((event) => <option value={event.id} key={event.id}>{event.name}</option>)}</select></label>
              <label><span>Naziv točke</span><input name="label" required minLength={2} maxLength={80} defaultValue="Glavni vhod" /></label>
            </div>
            {error ? <p role="alert">{error}</p> : null}
            <div className={styles.formActions}>
              <button type="button" className={styles.secondaryAction} onClick={() => setShowForm(false)}>Prekliči</button>
              <button type="submit" className={styles.primaryAction} disabled={pending}>{pending ? "Ustvarjam …" : "Ustvari QR kodo"}</button>
            </div>
          </form>
        ) : null}
      </section>

      {accessPoints.map((point) => (
        <section className={styles.accessGrid} key={point.id}>
          <article className={styles.qrCard}>
            <div className={styles.qrPreview}>
              {/* Generated SVG is served by our same-origin, validated QR endpoint. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/qr/${point.publicCode}.svg`} alt={`QR koda: ${point.label}`} />
            </div>
            <div className={styles.qrInfo}>
              <p>{point.label.toUpperCase()}</p>
              <h2>{point.eventName}</h2>
              <span className={`${styles.statusBadge} ${point.active ? styles.prepared : styles.ended}`}><i />{point.active ? "Aktivna" : "Neaktivna"}</span>
              <dl>
                <div><dt>Stabilni cilj</dt><dd>/t/{point.publicCode}</dd></div>
                <div><dt>Obiski</dt><dd>{point.visitCount}</dd></div>
              </dl>
              <div>
                <a className={styles.primaryAction} href={`/qr/${point.publicCode}.svg?download=1`}><Icon name="upload" size={17} /> Prenesi SVG</a>
                <a className={styles.secondaryAction} href={`/qr/${point.publicCode}.png?download=1`}>PNG</a>
                <button type="button" className={styles.secondaryAction} onClick={() => void copyStableLink(point.publicCode)}>
                  {copiedCode === point.publicCode ? "Kopirano" : "Kopiraj povezavo"}
                </button>
              </div>
            </div>
          </article>
          <article className={styles.tipCard}>
            <span><Icon name="qr" size={22} /></span>
            <h3>Pred tiskom vedno testiraj</h3>
            <p>QR vedno vodi prek stabilne dostopne točke. Ciljni dogodek lahko pozneje upravljaš, ne da bi ponovno tiskal kodo.</p>
            <Link href={`/t/${point.publicCode}`} target="_blank">Odpri testno povezavo <Icon name="arrow" size={16} /></Link>
          </article>
        </section>
      ))}

      {accessPoints.length === 0 ? (
        <section className={styles.panel}><p>{events.length === 0 ? "Najprej ustvari dogodek; njegova glavna QR koda bo pripravljena samodejno." : "QR dostopnih točk še ni."}</p></section>
      ) : null}

    </>
  );
}

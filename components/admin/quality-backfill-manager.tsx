"use client";

import { useEffect, useState } from "react";
import styles from "./admin.module.css";

type Backfill = {
  id: string;
  mode: "missing" | "failed" | "all";
  status: "queued" | "processing" | "completed" | "failed";
  errorCode: string | null;
  totalCount: number;
  completedCount: number;
  failedCount: number;
  queuedCount: number;
};

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
  return body?.detail ?? body?.title ?? "Analize ni bilo mogoče začeti.";
}

export function QualityBackfillManager({ eventId, initialBackfill }: { eventId: string; initialBackfill: Backfill | null }) {
  const [job, setJob] = useState(initialBackfill);
  const [mode, setMode] = useState<Backfill["mode"]>("missing");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = job?.status === "queued" || job?.status === "processing";

  useEffect(() => {
    if (!active) return;
    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/v1/admin/events/${encodeURIComponent(eventId)}/quality-backfill`, { cache: "no-store" });
      if (!response.ok) return;
      const body = await response.json() as { backfill: Backfill | null };
      setJob(body.backfill);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [active, eventId]);

  async function start() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/v1/admin/events/${encodeURIComponent(eventId)}/quality-backfill`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    if (!response.ok) setError(await readError(response));
    else {
      const body = await response.json() as { backfill: Backfill };
      setJob(body.backfill);
    }
    setPending(false);
  }

  const total = job?.totalCount ?? 0;
  const done = (job?.completedCount ?? 0) + (job?.failedCount ?? 0);
  const progress = total ? Math.round(done / total * 100) : active ? 0 : 100;

  return <section className={styles.backfillPanel} aria-labelledby="quality-backfill-title">
    <div>
      <p>MASOVNA ANALIZA</p>
      <h2 id="quality-backfill-title">Tehnična kakovost obstoječih slik</h2>
      <span>{active
        ? `${done} od ${total || "…"} obdelanih`
        : job?.status === "completed"
          ? `Zaključeno: ${job.completedCount} uspešnih analiz`
          : job?.status === "failed"
            ? `Zaključeno z napakami: ${job.failedCount}`
            : "Zaženi analizo slik, ki še nimajo rezultata."}</span>
      {active ? <div className={styles.backfillProgress} role="progressbar" aria-label="Napredek analize" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div> : null}
      {error ? <p className={styles.backfillError} role="alert">{error}</p> : null}
    </div>
    <div className={styles.backfillActions}>
      <label><span className={styles.srOnly}>Obseg masovne analize</span><select value={mode} onChange={(event) => setMode(event.target.value as Backfill["mode"])} disabled={pending || active}>
        <option value="missing">Samo brez analize</option>
        <option value="failed">Samo neuspele</option>
        <option value="all">Ponovno vse</option>
      </select></label>
      <button type="button" className={styles.secondaryAction} onClick={() => void start()} disabled={pending || active}>
        {pending ? "Dodajam v vrsto …" : active ? "Analiza poteka …" : "Zaženi analizo"}
      </button>
    </div>
  </section>;
}

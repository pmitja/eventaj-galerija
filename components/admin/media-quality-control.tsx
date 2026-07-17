"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { QualityCategory } from "@/lib/domain/media-quality";
import styles from "./admin.module.css";

const labels: Record<QualityCategory, string> = {
  best: "Najboljša",
  good: "Dobra",
  duplicate: "Podvojena",
  blurry: "Neostra",
  low_quality: "Slabša",
};

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
  return body?.detail ?? body?.title ?? "Spremembe ni bilo mogoče shraniti.";
}

export function MediaQualityControl({
  eventId,
  mediaId,
  automaticCategory,
  overrideCategory,
  effectiveCategory,
  score,
  analysisStatus,
}: {
  eventId: string;
  mediaId: string;
  automaticCategory: QualityCategory | null;
  overrideCategory: QualityCategory | null;
  effectiveCategory: QualityCategory | null;
  score: number | null;
  analysisStatus: "pending" | "completed" | "failed" | null;
}) {
  const router = useRouter();
  const [override, setOverride] = useState<QualityCategory | null>(overrideCategory);
  const [effective, setEffective] = useState<QualityCategory | null>(effectiveCategory);
  const [status, setStatus] = useState(analysisStatus);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeOverride(value: string) {
    const category = value === "automatic" ? null : value as QualityCategory;
    const previous = override;
    setOverride(category);
    setPending(true);
    setError(null);
    const response = await fetch(`/api/v1/admin/events/${encodeURIComponent(eventId)}/media/${encodeURIComponent(mediaId)}/quality`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ category }),
    });
    if (!response.ok) {
      setOverride(previous);
      setError(await readError(response));
    } else {
      const body = await response.json() as { effectiveCategory: QualityCategory | null };
      setEffective(body.effectiveCategory);
      router.refresh();
    }
    setPending(false);
  }

  async function retry() {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/v1/admin/events/${encodeURIComponent(eventId)}/media/${encodeURIComponent(mediaId)}/quality`, { method: "POST" });
    if (!response.ok) setError(await readError(response));
    else setStatus("pending");
    setPending(false);
  }

  const statusLabel = status === "pending"
    ? "Analiza čaka"
    : status === "failed"
      ? "Analiza ni uspela"
      : effective
        ? labels[effective]
        : "Brez analize";

  return <div className={styles.qualityControl}>
    <div className={styles.qualityLine}>
      <span className={`${styles.qualityBadge} ${effective ? styles[`quality_${effective}`] : styles.quality_pending}`}>
        {statusLabel}{score !== null && status === "completed" ? ` · ${Math.round(score)}` : ""}
      </span>
      {override ? <small>ročno</small> : null}
    </div>
    <label>
      <span className={styles.srOnly}>Kategorija kakovosti</span>
      <select value={override ?? "automatic"} onChange={(event) => void changeOverride(event.target.value)} disabled={pending || status !== "completed"}>
        <option value="automatic">Samodejno{automaticCategory ? ` (${labels[automaticCategory]})` : ""}</option>
        {Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    {(status === "failed" || status === null) ? <button type="button" onClick={() => void retry()} disabled={pending}>
      {pending ? "Zaganjam …" : "Ponovi analizo"}
    </button> : null}
    {error ? <p role="alert">{error}</p> : null}
  </div>;
}

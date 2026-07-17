"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icon";
import styles from "./admin.module.css";

type ExportStatus = "queued" | "processing" | "ready" | "failed" | "expired";

type ExportState = {
  id: string;
  status: ExportStatus;
  fileName: string;
  mediaCount: number;
  downloadUrl?: string | null;
};

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
  return body?.detail ?? body?.title ?? "ZIP izvoza ni bilo mogoče pripraviti.";
}

export function ExportManager({
  eventId,
  photoCount,
  initialExport,
}: {
  eventId: string;
  photoCount: number;
  initialExport: ExportState | null;
}) {
  const [exportJob, setExportJob] = useState(initialExport);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const exportId = exportJob?.id;
  const exportStatus = exportJob?.status;
  const exportDownloadUrl = exportJob?.downloadUrl;

  useEffect(() => {
    if (!exportId || !exportStatus || !["queued", "processing", "ready"].includes(exportStatus)) return;
    if (exportStatus === "ready" && exportDownloadUrl) return;

    const id = exportId;
    let cancelled = false;
    let timeout: number | undefined;
    async function refresh() {
      try {
        const response = await fetch(`/api/v1/admin/exports/${encodeURIComponent(id)}`, { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) setError(await readError(response));
          return;
        }
        const body = await response.json() as { export: ExportState };
        if (cancelled) return;
        setError(null);
        setExportJob(body.export);
        if (["queued", "processing"].includes(body.export.status)) {
          timeout = window.setTimeout(() => void refresh(), 2500);
        }
      } catch {
        if (!cancelled) setError("Povezave s strežnikom ni bilo mogoče vzpostaviti. Poskusi znova.");
      }
    }
    void refresh();
    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [exportId, exportStatus, exportDownloadUrl, refreshKey]);

  async function startExport() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/admin/events/${encodeURIComponent(eventId)}/exports`, { method: "POST" });
      if (!response.ok) {
        setError(await readError(response));
        return;
      }
      const body = await response.json() as { export: ExportState };
      setExportJob(body.export);
    } catch {
      setError("Povezave s strežnikom ni bilo mogoče vzpostaviti. Poskusi znova.");
    } finally {
      setPending(false);
    }
  }

  if (exportJob?.status === "ready" && exportJob.downloadUrl) {
    return <div className={styles.exportActions}>
      <a className={styles.primaryAction} href={exportJob.downloadUrl}><Icon name="upload" size={18} /> Prenesi ZIP</a>
      <button type="button" className={styles.secondaryAction} onClick={() => void startExport()} disabled={pending}>
        {pending ? "Začenjam …" : "Osveži ZIP"}
      </button>
    </div>;
  }

  const working = exportJob && ["queued", "processing"].includes(exportJob.status);
  const retryingLink = exportJob?.status === "ready" && !exportJob.downloadUrl;
  return <div className={styles.exportActions}>
    <button
      type="button"
      className={styles.secondaryAction}
      onClick={() => retryingLink ? setRefreshKey((current) => current + 1) : void startExport()}
      disabled={pending || working || photoCount === 0}
    >
      <Icon name="upload" size={18} />
      {pending ? "Začenjam …" : working ? "Pripravljam ZIP …" : retryingLink ? "Poskusi povezavo znova" : exportJob?.status === "failed" ? "Poskusi znova" : "Izvozi ZIP"}
    </button>
    {error ? <small className={styles.exportError} role="alert">{error}</small> : null}
  </div>;
}

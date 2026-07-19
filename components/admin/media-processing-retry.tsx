"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./admin.module.css";

export function MediaProcessingRetry({ eventId, mediaId }: { eventId: string; mediaId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setPending(true);
    setError(null);
    const response = await fetch(
      `/api/v1/admin/events/${encodeURIComponent(eventId)}/media/${encodeURIComponent(mediaId)}/processing`,
      { method: "POST" },
    );
    if (response.ok) router.refresh();
    else {
      const body = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
      setError(body?.detail ?? body?.title ?? "Obdelave ni bilo mogoče ponoviti.");
    }
    setPending(false);
  }

  return <div className={styles.qualityControl}>
    <button type="button" onClick={() => void retry()} disabled={pending}>
      {pending ? "Zaganjam …" : "Ponovi obdelavo"}
    </button>
    {error ? <p role="alert">{error}</p> : null}
  </div>;
}

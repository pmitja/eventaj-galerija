"use client";

import { useState } from "react";
import styles from "./admin.module.css";

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null) as { detail?: string; title?: string } | null;
  return body?.detail ?? body?.title ?? "Nastavitve ni bilo mogoče shraniti.";
}

export function EventCommentsToggle({
  eventId,
  eventName,
  initialEnabled,
}: {
  eventId: string;
  eventName: string;
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(nextEnabled: boolean) {
    if (pending) return;
    setPending(true);
    setError(null);
    const response = await fetch(`/api/v1/admin/events/${encodeURIComponent(eventId)}/settings`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ commentsEnabled: nextEnabled }),
    });
    if (!response.ok) {
      setError(await readError(response));
      setPending(false);
      return;
    }
    setEnabled(nextEnabled);
    setPending(false);
  }

  return (
    <div className={styles.eventCommentsSetting}>
      <label>
        <span className={styles.srOnly}>Komentarji za {eventName}</span>
        <input
          type="checkbox"
          checked={enabled}
          disabled={pending}
          onChange={(event) => void update(event.target.checked)}
          aria-describedby={error ? `comments-error-${eventId}` : undefined}
        />
        <span aria-hidden="true" />
      </label>
      <small>{pending ? "Shranjujem …" : enabled ? "Vključeni" : "Izključeni"}</small>
      {error ? <p id={`comments-error-${eventId}`} role="alert">{error}</p> : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Icon } from "./icon";
import styles from "./admin.module.css";
import { shareGallery } from "@/lib/client/share-gallery";

function copyWithLegacySelection(url: string) {
  const textArea = document.createElement("textarea");
  textArea.value = url;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textArea.remove();
  }
}

export function GalleryLinkBar({ url, eventName }: { url: string; eventName: string }) {
  const [feedback, setFeedback] = useState<{ message: string; tone: "success" | "error" } | null>(null);

  async function handleCopy() {
    const result = await shareGallery({
      client: navigator,
      data: {
        title: `${eventName} | Eventaj Galerija`,
        text: `Oglej si fotografije dogodka ${eventName}.`,
        url,
      },
      legacyCopy: copyWithLegacySelection,
    });
    if (result === "cancelled") return;
    setFeedback(result === "error"
      ? { message: "Povezave ni bilo mogoče kopirati.", tone: "error" }
      : { message: result === "shared" ? "Povezava je bila deljena." : "Povezava je kopirana.", tone: "success" });
  }

  return (
    <section className={styles.galleryLinkBar} aria-label="Povezava do galerije">
      <span className={styles.galleryLinkIcon}><Icon name="link" size={17} /></span>
      <div className={styles.galleryLinkBody}>
        <small>POVEZAVA DO GALERIJE</small>
        <a href={url} target="_blank" rel="noreferrer">{url}</a>
      </div>
      <div className={styles.galleryLinkActions}>
        {feedback ? <span role="status" className={feedback.tone === "error" ? styles.galleryLinkError : styles.galleryLinkOk}>{feedback.message}</span> : null}
        <a className={styles.galleryLinkOpen} href={url} target="_blank" rel="noreferrer">Odpri <Icon name="chevron" size={15} /></a>
        <button type="button" className={styles.galleryLinkCopy} onClick={handleCopy}><Icon name="copy" size={15} /> Kopiraj povezavo</button>
      </div>
    </section>
  );
}

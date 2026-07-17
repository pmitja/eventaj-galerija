"use client";

import styles from "@/components/admin/admin.module.css";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className={styles.main}>
    <section className={styles.galleryError} role="alert">
      <h1>Galerije ni bilo mogoče naložiti</h1>
      <p>Preveri povezavo in poskusi znova. Nobena sprememba ni bila izgubljena.</p>
      <button type="button" className={styles.primaryAction} onClick={reset}>Poskusi znova</button>
    </section>
  </main>;
}

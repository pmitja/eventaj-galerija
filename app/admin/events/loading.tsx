import styles from "@/components/admin/admin.module.css";

export default function Loading() {
  return <main className={styles.main} aria-busy="true" aria-label="Nalaganje dogodkov">
    <p className={styles.emptyState}>Nalagam dogodke …</p>
  </main>;
}

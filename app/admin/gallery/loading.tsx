import styles from "@/components/admin/admin.module.css";

export default function Loading() {
  return <main className={styles.main} aria-busy="true" aria-label="Nalaganje galerije">
    <div className={styles.gallerySkeleton}><span /><span /><span /></div>
    <p className={styles.emptyState}>Nalagam fotografije in analizo kakovosti …</p>
  </main>;
}

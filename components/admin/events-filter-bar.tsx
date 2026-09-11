"use client";

import Link from "next/link";
import type { AdminEventsQuery } from "@/lib/validation/admin";
import { Icon } from "./icon";
import styles from "./admin.module.css";

export function EventsFilterBar({ filters }: { filters: AdminEventsQuery }) {
  return <form className={`${styles.filterBar} ${styles.eventsFilters}`} action="/admin/events" method="get" aria-label="Filtri dogodkov"
    onChange={(event) => { if (event.target instanceof HTMLSelectElement) event.currentTarget.requestSubmit(); }}>
    <label className={styles.filterSearch}><Icon name="search" size={17} /><span className={styles.srOnly}>Išči po dogodkih ali lokaciji</span><input name="q" type="search" maxLength={100} defaultValue={filters.q ?? ""} placeholder="Išči po dogodkih ali lokaciji ..." /></label>
    <label className={styles.selectControl}><span className={styles.srOnly}>Status</span><select name="status" defaultValue={filters.status}><option value="all">Vsi statusi</option><option value="active">Aktivni</option><option value="upcoming">Prihajajoči</option><option value="draft">Osnutki</option><option value="ended">Zaključeni</option></select></label>
    <label className={styles.selectControl}><span className={styles.srOnly}>Časovno obdobje</span><select name="period" defaultValue={filters.period}><option value="all">Vsa obdobja</option><option value="this_month">Ta mesec</option><option value="previous_month">Prejšnji mesec</option></select></label>
    <label className={styles.selectControl}><span className={styles.srOnly}>Sortiranje</span><select name="sort" defaultValue={filters.sort}><option value="date_desc">Datum: najnovejši</option><option value="date_asc">Datum: najstarejši</option><option value="name_asc">Ime: A–Ž</option><option value="name_desc">Ime: Ž–A</option></select></label>
    <button className={styles.filterSubmit} type="submit">Filtriraj</button>
    <Link className={styles.filterReset} href="/admin/events">Počisti</Link>
  </form>;
}

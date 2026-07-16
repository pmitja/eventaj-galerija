import Link from "next/link";
import { activity, chartData, events } from "./data";
import { Icon } from "./icon";
import styles from "./admin.module.css";

export function AdminDashboard() {
  return (
    <main className={styles.main}>
      <section className={styles.pageHeading}>
        <div><p className={styles.eyebrow}>SREDA, 15. JULIJ</p><h1>Dobrodošel nazaj, Mitja</h1><p>Tukaj je pregled tvojih dogodkov in galerij.</p></div>
      </section>
      <section className={styles.statusStrip} aria-label="Pomembno opozorilo">
        <span className={styles.statusIcon}><Icon name="sparkles" size={20} /></span>
        <div><strong>Poroka Ane & Marka je skoraj pripravljena</strong><p>Dodaj še naslovno fotografijo in preveri QR kodo pred dogodkom.</p></div>
        <Link href="/admin/events">Dokončaj pripravo <Icon name="arrow" size={17} /></Link>
      </section>
      <section className={styles.metricGrid} aria-label="Ključne metrike">
        <article className={styles.metricCard}><div><p>Aktivni dogodki</p><strong>2</strong></div><span className={`${styles.metricIcon} ${styles.rose}`}><Icon name="calendar" size={21} /></span><small><b>+1</b> glede na prejšnji mesec</small></article>
        <article className={styles.metricCard}><div><p>Zbrane fotografije</p><strong>1.284</strong></div><span className={`${styles.metricIcon} ${styles.violet}`}><Icon name="image" size={21} /></span><small><b>+23 %</b> v zadnjih 30 dneh</small></article>
        <article className={styles.metricCard}><div><p>Obiski galerij</p><strong>3.842</strong></div><span className={`${styles.metricIcon} ${styles.blue}`}><Icon name="users" size={21} /></span><small><b>+18 %</b> v zadnjih 30 dneh</small></article>
        <article className={styles.metricCard}><div><p>Čaka na moderacijo</p><strong>8</strong></div><span className={`${styles.metricIcon} ${styles.amber}`}><Icon name="shield" size={21} /></span><small><Link href="/admin/moderation">Preglej vsebino <Icon name="arrow" size={14} /></Link></small></article>
      </section>
      <div className={styles.contentGrid}>
        <section className={styles.eventsCard} aria-labelledby="events-title">
          <div className={styles.cardHeader}><div><h2 id="events-title">Tvoji dogodki</h2><p>Prihajajoči in nedavno zaključeni</p></div><Link href="/admin/events">Vsi dogodki <Icon name="arrow" size={16} /></Link></div>
          <div className={styles.eventList}>{events.map((event) => (
            <article className={styles.eventRow} key={event.name}>
              <div className={`${styles.eventVisual} ${styles[event.accent]}`} aria-hidden="true"><span /><span /><span /></div>
              <div className={styles.eventMain}><div className={styles.eventTitleLine}><h3>{event.name}</h3><span className={`${styles.statusBadge} ${styles[event.statusTone]}`}><i />{event.status}</span></div><p><Icon name="calendar" size={14} /> {event.date} <span>•</span> {event.location}</p><div className={styles.eventProgress}><div><span style={{ width: `${event.progress}%` }} /></div><small>{event.progress === 100 ? "Zaključeno" : `${event.progress}% pripravljeno`}</small></div></div>
              <div className={styles.eventStats}><span><strong>{event.photos}</strong><small>fotografij</small></span><span><strong>{event.guests}</strong><small>obiskov</small></span></div>
              <Link href="/admin/events" className={styles.rowArrow} aria-label={`Odpri ${event.name}`}><Icon name="chevron" size={19} /></Link>
            </article>
          ))}</div>
        </section>
        <aside className={styles.sideColumn}><section className={styles.activityCard} aria-labelledby="activity-title"><div className={styles.cardHeader}><div><h2 id="activity-title">Zadnja aktivnost</h2><p>V tvojem delovnem prostoru</p></div></div><div className={styles.activityList}>{activity.map((item) => <div className={styles.activityItem} key={item.title}><span className={`${styles.activityIcon} ${styles[item.tone]}`}><Icon name={item.icon} size={17} /></span><div><strong>{item.title}</strong><p>{item.detail}</p><small>{item.time}</small></div></div>)}</div><Link href="/admin/analytics" className={styles.fullLink}>Prikaži vso aktivnost <Icon name="arrow" size={16} /></Link></section></aside>
      </div>
      <section className={styles.analyticsCard} aria-labelledby="analytics-title"><div className={styles.cardHeader}><div><h2 id="analytics-title">Obiski galerij</h2><p>Zadnjih 14 dni</p></div><div className={styles.analyticsTotal}><strong>1.248</strong><span>+18,2 %</span></div></div><div className={styles.chart} role="img" aria-label="Obiski galerij so v zadnjih 14 dneh pretežno naraščali">{chartData.map((value, index) => <span key={index} style={{ height: `${value}%` }}><i>{value}</i></span>)}</div><div className={styles.chartLabels}><span>2. jul.</span><span>5. jul.</span><span>8. jul.</span><span>11. jul.</span><span>15. jul.</span></div></section>
    </main>
  );
}

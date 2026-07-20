import Link from "next/link";
import { getAuthContext } from "@/lib/auth/context";
import { formatRelativeTime, presentEventStatus, scaleChart } from "@/lib/domain/admin-dashboard";
import { getAdminDashboardData } from "@/lib/repositories/admin-dashboard";
import { Icon } from "./icon";
import styles from "./admin.module.css";

const number = new Intl.NumberFormat("sl-SI");

function displayName(name: string | null | undefined, email: string | null | undefined) {
  if (name && name !== "Eventaj Admin") return name.split(" ")[0];
  const localPart = email?.split("@")[0] ?? "nazaj";
  return localPart.charAt(0).toUpperCase() + localPart.slice(1);
}

export async function AdminDashboard() {
  const context = await getAuthContext();
  if (!context) return null;
  const data = await getAdminDashboardData(context.organizationId);
  const draftEvent = data.events.find((event) => event.status === "draft");
  const chartData = scaleChart(data.visitsByDay.map((item) => item.visits));
  const chartTotal = data.visitsByDay.reduce((total, item) => total + item.visits, 0);
  const generatedAt = new Date(data.totals.generated_at);
  const today = new Intl.DateTimeFormat("sl-SI", { weekday: "long", day: "numeric", month: "long" })
    .format(generatedAt).toLocaleUpperCase("sl-SI");

  return (
    <main className={styles.main}>
      <section className={styles.pageHeading}>
        <div><p className={styles.eyebrow}>{today}</p><h1>Dobrodošel nazaj, {displayName(context.name, context.email)}</h1><p>Tukaj je pregled tvojih dogodkov in galerij.</p></div>
      </section>
      {draftEvent ? <section className={styles.statusStrip} aria-label="Dogodek v pripravi">
        <span className={styles.statusIcon}><Icon name="sparkles" size={20} /></span>
        <div><strong>{draftEvent.name} je še v osnutku</strong><p>Preveri nastavitve dogodka in ga aktiviraj, ko bo pripravljen za goste.</p></div>
        <Link href="/admin/events">Nadaljuj pripravo <Icon name="arrow" size={17} /></Link>
      </section> : null}
      <section className={styles.metricGrid} aria-label="Ključne metrike">
        <article className={styles.metricCard}><div><p>Aktivni dogodki</p><strong>{number.format(data.totals.active_events)}</strong></div><span className={`${styles.metricIcon} ${styles.rose}`}><Icon name="calendar" size={21} /></span><small>trenutno aktivni</small></article>
        <article className={styles.metricCard}><div><p>Zbrane fotografije</p><strong>{number.format(data.totals.photos)}</strong></div><span className={`${styles.metricIcon} ${styles.violet}`}><Icon name="image" size={21} /></span><small>uspešno obdelane</small></article>
        <article className={styles.metricCard}><div><p>Obiski galerij</p><strong>{number.format(data.totals.visits)}</strong></div><span className={`${styles.metricIcon} ${styles.blue}`}><Icon name="users" size={21} /></span><small>vsi zabeleženi obiski</small></article>
        <article className={styles.metricCard}><div><p>Čaka na moderacijo</p><strong>{number.format(data.totals.pending_moderation)}</strong></div><span className={`${styles.metricIcon} ${styles.amber}`}><Icon name="shield" size={21} /></span><small><Link href="/admin/moderation">Preglej vsebino <Icon name="arrow" size={14} /></Link></small></article>
      </section>
      <div className={styles.contentGrid}>
        <section className={styles.eventsCard} aria-labelledby="events-title">
          <div className={styles.cardHeader}><div><h2 id="events-title">Tvoji dogodki</h2><p>Najnovejši dogodki v delovnem prostoru</p></div><Link href="/admin/events">Vsi dogodki <Icon name="arrow" size={16} /></Link></div>
          {data.events.length ? <div className={styles.eventList}>{data.events.map((event, index) => {
            const status = presentEventStatus(event.status);
            return <article className={styles.eventRow} key={event.id}>
              <div className={`${styles.eventVisual} ${styles[index % 3 === 0 ? "rose" : index % 3 === 1 ? "amber" : "violet"]}`} aria-hidden="true"><span /><span /><span /></div>
              <div className={styles.eventMain}><div className={styles.eventTitleLine}><h3>{event.name}</h3><span className={`${styles.statusBadge} ${styles[status.tone]}`}><i />{status.label}</span></div><p><Icon name="calendar" size={14} /> {new Intl.DateTimeFormat("sl-SI", { dateStyle: "medium", timeZone: event.timezone }).format(new Date(event.starts_at))} <span>•</span> {event.location ?? "Brez lokacije"}</p></div>
              <div className={styles.eventStats}><span><strong>{number.format(event.photo_count)}</strong><small>fotografij</small></span><span><strong>{number.format(event.visit_count)}</strong><small>obiskov</small></span></div>
              <Link href={`/admin/gallery?eventId=${encodeURIComponent(event.id)}`} className={styles.rowArrow} aria-label={`Odpri galerijo dogodka ${event.name}`}><Icon name="chevron" size={19} /></Link>
            </article>;
          })}</div> : <p className={styles.emptyState}>Dogodkov še ni. Ustvari prvega in nato deli njegovo QR kodo.</p>}
        </section>
        <aside className={styles.sideColumn}><section className={styles.activityCard} aria-labelledby="activity-title"><div className={styles.cardHeader}><div><h2 id="activity-title">Zadnja aktivnost</h2><p>V tvojem delovnem prostoru</p></div></div>{data.activity.length ? <div className={styles.activityList}>{data.activity.map((item, index) => <div className={styles.activityItem} key={`${item.kind}-${item.occurred_at}-${index}`}><span className={`${styles.activityIcon} ${styles[item.kind === "media" ? "rose" : "blue"]}`}><Icon name={item.kind === "media" ? "image" : "calendar"} size={17} /></span><div><strong>{item.kind === "media" ? `Naložena fotografija ${item.filename ?? ""}` : "Ustvarjen je bil dogodek"}</strong><p>{item.event_name}</p><small>{formatRelativeTime(item.occurred_at, generatedAt)}</small></div></div>)}</div> : <p className={styles.emptyState}>Aktivnosti še ni.</p>}</section></aside>
      </div>
      <section className={styles.analyticsCard} aria-labelledby="analytics-title"><div className={styles.cardHeader}><div><h2 id="analytics-title">Obiski galerij</h2><p>Zadnjih 14 dni</p></div><div className={styles.analyticsTotal}><strong>{number.format(chartTotal)}</strong></div></div><div className={styles.chart} role="img" aria-label={`V zadnjih 14 dneh je bilo ${number.format(chartTotal)} obiskov`}>{chartData.map((value, index) => <span key={data.visitsByDay[index]?.day ?? index} style={{ height: `${value}%` }}><i>{data.visitsByDay[index]?.visits ?? 0}</i></span>)}</div><div className={styles.chartLabels}>{data.visitsByDay.filter((_, index) => index % 3 === 0 || index === 13).map((item) => <span key={item.day}>{new Intl.DateTimeFormat("sl-SI", { day: "numeric", month: "short" }).format(new Date(`${item.day}T12:00:00Z`))}</span>)}</div></section>
    </main>
  );
}

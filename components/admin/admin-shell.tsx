"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Icon } from "./icon";
import styles from "./admin.module.css";

const primaryNav = [
  { label: "Pregled", icon: "home", href: "/admin", badge: undefined },
  { label: "Dogodki", icon: "calendar", href: "/admin/events", badge: undefined },
  { label: "Galerija", icon: "image", href: "/admin/gallery", badge: undefined },
  { label: "Moderacija", icon: "shield", href: "/admin/moderation", badge: undefined },
  { label: "QR kode", icon: "qr", href: "/admin/access", badge: undefined },
] as const;

const secondaryNav = [
  { label: "Stranke", icon: "users", href: "/admin/customers" },
  { label: "Analitika", icon: "chart", href: "/admin/analytics" },
  { label: "Nastavitve", icon: "settings", href: "/admin/settings" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

export function AdminShell({ children, user }: Readonly<{
  children: React.ReactNode;
  user: { name: string; email: string; role: "owner" | "event_manager" | "platform_admin" };
}>) {
  const pathname = usePathname();
  const initials = user.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.logo} aria-label="Eventaj Galerija – domov">
          eventaj<span>.si</span><small>GALERIJA</small>
        </Link>
        <nav aria-label="Glavna navigacija" className={styles.nav}>
          <p className={styles.navLabel}>DELOVNI PROSTOR</p>
          {primaryNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? styles.navActive : styles.navItem} aria-current={active ? "page" : undefined}>
                <Icon name={item.icon} size={19} /><span>{item.label}</span>
                {item.badge ? <b className={styles.navBadge}>{item.badge}</b> : null}
              </Link>
            );
          })}
          <p className={styles.navLabel}>UPRAVLJANJE</p>
          {secondaryNav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? styles.navActive : styles.navItem} aria-current={active ? "page" : undefined}>
                <Icon name={item.icon} size={19} /><span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/admin/settings#support" className={styles.helpLink}><Icon name="help" size={18} /> Pomoč in podpora</Link>
          <button className={styles.profile} type="button" onClick={() => void signOut({ callbackUrl: "/" })} aria-label="Odjavi se">
            <span className={styles.avatar}>{initials}</span>
            <span><strong>{user.name}</strong><small>{user.role === "owner" ? "Lastnik" : "Administrator"} · Odjava</small></span>
            <Icon name="more" size={18} />
          </button>
        </div>
      </aside>

      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <Link href="/" className={styles.mobileLogo}>eventaj<span>.si</span></Link>
          <label className={styles.search}>
            <span className={styles.srOnly}>Išči dogodke, galerije ali stranke</span>
            <Icon name="search" size={18} />
            <input type="search" placeholder="Išči dogodke, galerije ali stranke ..." />
            <kbd>⌘ K</kbd>
          </label>
          <div className={styles.topActions}>
            <button className={styles.iconButton} type="button" aria-label="Obvestila"><Icon name="bell" size={20} /><span className={styles.notificationDot} /></button>
            <Link className={styles.newEventButton} href="/naroci"><Icon name="plus" size={19} /> <span>Kupi dogodek</span></Link>
          </div>
        </header>
        {children}
      </div>

      <nav className={styles.mobileNav} aria-label="Mobilna navigacija">
        {primaryNav.slice(0, 4).map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} className={active ? styles.mobileNavActive : undefined} aria-current={active ? "page" : undefined}>
              <Icon name={item.icon} size={21} /><span>{item.label}</span>
              {item.badge ? <b>{item.badge}</b> : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

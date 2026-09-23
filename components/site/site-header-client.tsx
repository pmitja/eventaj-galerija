"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LOCALE_LABELS, LOCALE_SHORT_LABELS, PREFIXED_LOCALES, type Locale } from "@/lib/i18n/locale";
import { localizedMarketingPath } from "@/lib/i18n/routes";
import { cn } from "@/lib/utils";

export type HeaderEventLink = { href: string; title: string; description: string };
export type HeaderEventGroup = { label: string; items: HeaderEventLink[] };
type HeaderLanguage = { locale: Locale; label: string; short: string; href: string; current: boolean };

/**
 * Slovenian and English own separate domains; the other languages are
 * path-prefixed on the English one. A switch that crosses domains needs the
 * absolute `alternateOrigin`.
 */
function languageLinks(locale: Locale, pathname: string, alternateOrigin?: string): HeaderLanguage[] {
  const targets: Locale[] = locale === "sl"
    ? ["sl", "en"]
    : ["en", ...PREFIXED_LOCALES, ...(alternateOrigin ? (["sl"] as Locale[]) : [])];
  return targets.map((target) => {
    const crossesDomain = target === "sl" || locale === "sl";
    const path = target === locale ? pathname : localizedMarketingPath(pathname, target);
    return {
      locale: target,
      label: LOCALE_LABELS[target],
      short: LOCALE_SHORT_LABELS[target],
      href: crossesDomain && target !== locale ? `${alternateOrigin ?? ""}${path}` : path,
      current: target === locale,
    };
  });
}

export type SiteHeaderProps = {
  brand: { name: string; mark: string; homeHref: string };
  copy: {
    skipToContent: string;
    howItWorks: string;
    events: string;
    liveDemo: string;
    pricing: string;
    faq: string;
    tryAsGuest: string;
    createEvent: string;
    createShort: string;
    menu: string;
    closeMenu: string;
    language: string;
    demoCardTitle: string;
    demoCardText: string;
  };
  links: { howItWorks: string; liveDemo: string; pricing: string; faq: string; demo: string; order: string };
  eventGroups: HeaderEventGroup[];
  locale: Locale;
  alternateOrigin?: string;
  demoImage: string;
};

const pill = "rounded-full px-3.5 py-2.5 transition-colors duration-200 hover:bg-gm-sand hover:text-gm-ink!";

export function SiteHeaderClient({ brand, copy, links, eventGroups, locale, alternateOrigin, demoImage }: SiteHeaderProps) {
  const pathname = usePathname();
  const languages = languageLinks(locale, pathname, alternateOrigin);
  const [menu, setMenu] = useState<"events" | "lang" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const current = languages.find((language) => language.current);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) { setMenu(null); setMobileOpen(false); }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenu(null); setMobileOpen(false); }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const close = () => { setMenu(null); setMobileOpen(false); };
  const toggle = (name: "events" | "lang") => setMenu((open) => (open === name ? null : name));
  const allEvents = eventGroups.flatMap((group) => group.items);

  return (
    <>
      <a
        href="#main"
        className="fixed top-2 -left-[9999px] z-[100] rounded-lg bg-gm-ink px-4 py-3 text-gm-bg! focus:left-2"
      >
        {copy.skipToContent}
      </a>
      <header
        ref={rootRef}
        className={cn(
          "sticky top-0 z-50 border-b bg-[rgba(247,245,241,0.9)] backdrop-blur-[14px] backdrop-saturate-[1.4] transition-[border-color] duration-300",
          scrolled || menu || mobileOpen ? "border-gm-line" : "border-transparent",
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-3 px-[clamp(16px,4vw,48px)] min-[480px]:gap-8">
          <Link href={brand.homeHref} aria-label={brand.name} className="flex min-w-0 items-center gap-2 text-[16px] font-bold tracking-[-0.01em] text-gm-ink! min-[400px]:gap-2.5 min-[400px]:text-[18px]">
            {brand.mark ? <img src={brand.mark} alt="" width={34} height={34} className="block size-[30px] flex-none object-contain min-[400px]:size-[34px]" /> : null}
            <span className="whitespace-nowrap">{brand.name}</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-0.5 text-[15px] font-medium whitespace-nowrap min-[1180px]:flex">
            <a href={links.howItWorks} className={pill}>{copy.howItWorks}</a>
            <button
              type="button"
              onClick={() => toggle("events")}
              aria-expanded={menu === "events"}
              aria-controls="site-events-menu"
              className={cn(pill, "flex cursor-pointer items-center gap-2 border-0 text-[15px] font-medium", menu === "events" ? "bg-gm-sand" : "bg-transparent")}
            >
              {copy.events}
              <span aria-hidden="true" className={cn("inline-block text-[9px] transition-transform duration-[250ms]", menu === "events" && "rotate-180")}>▼</span>
            </button>
            <a href={links.liveDemo} className={pill}>{copy.liveDemo}</a>
            <a href={links.pricing} className={pill}>{copy.pricing}</a>
            <a href={links.faq} className={pill}>{copy.faq}</a>
          </nav>

          <div className="ml-auto hidden items-center gap-1.5 whitespace-nowrap min-[1180px]:flex">
            {languages.length > 1 ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggle("lang")}
                  aria-expanded={menu === "lang"}
                  aria-label={`${copy.language}: ${current?.label ?? ""}`}
                  className="cursor-pointer rounded-full border-0 bg-transparent px-3 py-2.5 text-[14px] font-medium text-gm-muted! hover:bg-gm-sand"
                >
                  {current?.short ?? "EN"} ▾
                </button>
                {menu === "lang" ? (
                  <div className="absolute top-[calc(100%+12px)] right-0 flex min-w-[200px] animate-gm-drop flex-col rounded-[14px] border border-gm-line bg-gm-paper p-1.5 shadow-[0_18px_40px_rgba(40,30,20,.12)]">
                    {languages.map((language) => (
                      <a
                        key={language.locale}
                        href={language.href}
                        hrefLang={language.locale}
                        aria-current={language.current ? "true" : undefined}
                        className={cn("rounded-lg px-3 py-2.5 hover:bg-gm-sand-soft", language.current && "font-semibold text-gm-accent!")}
                      >
                        {language.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            <Link href={links.demo} className="rounded-full px-4 py-[11px] text-[15px] font-semibold transition-colors duration-200 hover:bg-gm-sand hover:text-gm-ink!">
              {copy.tryAsGuest}
            </Link>
            <Link
              href={links.order}
              className="flex items-center gap-2.5 rounded-full bg-gm-accent px-5 py-3 text-[15px] font-semibold text-white! transition-[background,transform] duration-200 hover:-translate-y-px hover:bg-gm-accent-dark hover:text-white! active:translate-y-0"
            >
              {copy.createEvent}
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2 whitespace-nowrap min-[1180px]:hidden">
            <Link href={links.order} className="rounded-full bg-gm-accent px-4 py-3 text-[14px] font-semibold text-white! hover:text-white!">
              {copy.createShort}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? copy.closeMenu : copy.menu}
              aria-expanded={mobileOpen}
              aria-controls="site-mobile-menu"
              className="size-[46px] flex-none cursor-pointer rounded-full border border-gm-line-strong bg-gm-paper text-[16px]"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menu === "events" ? (
          <div id="site-events-menu" className="hidden animate-gm-drop border-t border-gm-line bg-gm-paper shadow-[0_24px_40px_rgba(40,30,20,.08)] min-[1180px]:block">
            <div className="mx-auto grid max-w-[1320px] grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-10 gap-y-3 px-[clamp(16px,4vw,48px)] pt-7 pb-8">
              {eventGroups.map((group) => (
                <div key={group.label} className="flex flex-col gap-0.5">
                  <div className="px-3 pb-2.5 text-[12px] font-semibold tracking-[.14em] text-gm-accent uppercase">{group.label}</div>
                  {group.items.map((item) => (
                    <Link key={item.href} href={item.href} onClick={close} className="rounded-xl p-3 hover:bg-gm-sand-soft hover:text-gm-ink!">
                      <strong className="block text-[16px] font-semibold">{item.title}</strong>
                      <span className="text-[14px] text-gm-muted">{item.description}</span>
                    </Link>
                  ))}
                </div>
              ))}
              <Link href={links.demo} onClick={close} className="relative flex min-h-[200px] items-end overflow-hidden rounded-2xl p-[18px] text-white! hover:text-white!">
                <img src={demoImage} alt="" className="absolute inset-0 size-full object-cover" />
                <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,15,10,0)_30%,rgba(20,15,10,.75))]" />
                <span className="relative">
                  <span className="block font-serif text-[21.3px] leading-[1.1]">{copy.demoCardTitle}</span>
                  <span className="text-[14px] opacity-90">{copy.demoCardText}</span>
                </span>
              </Link>
            </div>
          </div>
        ) : null}

        {mobileOpen ? (
          <nav
            id="site-mobile-menu"
            aria-label="Mobile"
            className="flex max-h-[calc(100vh-72px)] animate-gm-drop flex-col overflow-auto border-t border-gm-line bg-gm-bg px-4 pt-2 pb-6 text-[19px] font-semibold min-[1180px]:hidden"
          >
            <a href={links.howItWorks} onClick={close} className="border-b border-gm-line px-1 py-4">{copy.howItWorks}</a>
            <a href={links.liveDemo} onClick={close} className="border-b border-gm-line px-1 py-4">{copy.liveDemo}</a>
            <a href={links.pricing} onClick={close} className="border-b border-gm-line px-1 py-4">{copy.pricing}</a>
            <a href={links.faq} onClick={close} className="border-b border-gm-line px-1 py-4">{copy.faq}</a>
            <div className="px-1 pt-[18px] pb-2.5 text-[12px] tracking-[.14em] text-gm-accent uppercase">{copy.events}</div>
            <div className="grid grid-cols-2 gap-2 text-[15px] font-medium">
              {allEvents.map((item) => (
                <Link key={item.href} href={item.href} onClick={close} className="rounded-xl border border-gm-line bg-gm-paper px-3 py-3.5">
                  {item.title}
                </Link>
              ))}
            </div>
            {languages.length > 1 ? (
              <>
                <div className="px-1 pt-[18px] pb-2.5 text-[12px] tracking-[.14em] text-gm-accent uppercase">{copy.language}</div>
                <div className="flex flex-wrap gap-2 text-[14px] font-medium">
                  {languages.map((language) => (
                    <a
                      key={language.locale}
                      href={language.href}
                      hrefLang={language.locale}
                      aria-current={language.current ? "true" : undefined}
                      className={cn("rounded-full border border-gm-line bg-gm-paper px-3.5 py-2", language.current && "border-gm-accent text-gm-accent!")}
                    >
                      {language.label}
                    </a>
                  ))}
                </div>
              </>
            ) : null}
            <Link href={links.demo} onClick={close} className="mt-5 flex justify-between rounded-full border border-gm-ink px-5 py-4">
              {copy.tryAsGuest} <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        ) : null}
      </header>
    </>
  );
}

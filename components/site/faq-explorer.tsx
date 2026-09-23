"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DisplayText } from "./primitives";
import { FaqAccordion } from "./faq-accordion";

type Category = "guests" | "qr" | "photos" | "privacy" | "pricing";

export type FaqExplorerCopy = {
  eyebrow: string;
  heading: string;
  text: string;
  searchLabel: string;
  searchPlaceholder: string;
  topics: string;
  all: string;
  categories: Record<Category, string>;
  emptyTitle: string;
  emptyText: string;
};

/** Help-centre hero with search and topic chips, above the filtered answer list. */
export function FaqExplorer({ copy, items, email, children }: {
  copy: FaqExplorerCopy;
  items: readonly (readonly [string, string, string])[];
  email: string;
  children?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<Category | "all">("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return items.filter(([q, a, category]) =>
      (topic === "all" || category === topic) && (!needle || `${q} ${a}`.toLocaleLowerCase().includes(needle)));
  }, [items, query, topic]);

  const topics: (Category | "all")[] = ["all", "guests", "qr", "photos", "privacy", "pricing"];
  const [emptyBefore, emptyAfter = ""] = copy.emptyText.split("{email}");

  return (
    <>
      <section aria-label={copy.eyebrow} className="px-[clamp(16px,4vw,48px)] pt-[clamp(48px,6vw,88px)] pb-[clamp(32px,4vw,48px)]">
        <div className="mx-auto flex max-w-[860px] flex-col items-center gap-[22px] text-center">
          <div className="animate-[gmUp_.6s_both] text-[12px] font-semibold tracking-[.16em] whitespace-nowrap text-gm-accent uppercase">{copy.eyebrow}</div>
          <h1 className="animate-[gmUp_.7s_.06s_cubic-bezier(.2,.7,.2,1)_both] font-serif text-[clamp(39.4px,5.2vw,75.4px)] leading-[1.08] font-normal tracking-[-0.02em]">
            <DisplayText value={copy.heading} emClassName="text-gm-accent" />
          </h1>
          <p className="max-w-[560px] animate-[gmUp_.7s_.12s_cubic-bezier(.2,.7,.2,1)_both] text-[18px] leading-[1.55] text-gm-muted">{copy.text}</p>
          <label className="relative mt-1.5 w-[min(620px,100%)] animate-[gmUp_.7s_.18s_cubic-bezier(.2,.7,.2,1)_both]">
            <span className="sr-only">{copy.searchLabel}</span>
            <span aria-hidden="true" className="absolute top-1/2 left-[22px] -translate-y-1/2 text-[18px] text-gm-muted">⌕</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-full border border-gm-line-strong bg-gm-paper py-[19px] pr-[22px] pl-[52px] font-gm text-[17px] font-medium text-gm-ink shadow-[0_10px_30px_rgba(40,30,20,.06)] outline-none transition-[border-color,box-shadow] duration-200 focus:border-gm-accent focus:shadow-[0_0_0_4px_#f0d9d3]"
            />
          </label>
          <div role="tablist" aria-label={copy.topics} className="flex animate-[gmUp_.7s_.24s_cubic-bezier(.2,.7,.2,1)_both] flex-wrap justify-center gap-2">
            {topics.map((name) => {
              const on = topic === name;
              const count = name === "all" ? items.length : items.filter((item) => item[2] === name).length;
              return (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTopic(name)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-full border px-[18px] py-2.5 text-[15px] font-medium whitespace-nowrap transition-[background,color,border-color] duration-200",
                    on ? "border-gm-ink bg-gm-ink text-gm-bg" : "border-gm-line-strong bg-gm-paper text-gm-ink",
                  )}
                >
                  {name === "all" ? copy.all : copy.categories[name]}
                  <span className="text-[12px] tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 px-[clamp(16px,4vw,48px)] pb-[clamp(72px,9vw,120px)]">
      <div className="mx-auto max-w-[860px]">
      <div className="flex flex-col rounded-[28px] border border-gm-line bg-gm-paper px-[clamp(18px,3vw,36px)] py-2 shadow-[0_30px_60px_rgba(40,30,20,.06)]">
        {visible.length ? (
          <FaqAccordion
            key={`${topic}:${query}`}
            separators="between"
            items={visible.map(([q, a, category]) => ({ q, a, label: copy.categories[category as Category] }))}
          />
        ) : (
          <div role="status" className="flex flex-col items-center gap-2 px-2 py-12 text-center">
            <span className="font-serif text-[24.6px]">{copy.emptyTitle}</span>
            <span className="text-[16px] text-gm-muted">
              {emptyBefore}<a href={`mailto:${email}`} className="text-gm-accent! underline!">{email}</a>{emptyAfter}
            </span>
          </div>
        )}
      </div>
      {children}
      </div>
      </section>
    </>
  );
}

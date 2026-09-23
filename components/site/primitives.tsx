import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Renders display copy where `*text*` marks the italic accent, e.g.
 * "Every photo your guests take, *in one gallery.*".
 */
export function DisplayText({ value, emClassName }: { value: string; emClassName?: string }) {
  const parts = value.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2
          ? <em key={index} className={emClassName}>{part.slice(1, -1)}</em>
          : <Fragment key={index}>{part}</Fragment>,
      )}
    </>
  );
}

/**
 * Adds the italic accent to headings that come from content data without
 * markers: a two-sentence heading accents its last sentence, otherwise the
 * last three words ("Collect … with *one QR code.*").
 */
export function withAccent(value: string): string {
  if (value.includes("*")) return value;
  const sentences = value.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length >= 2 && sentences.join("").length === value.length) {
    const last = sentences[sentences.length - 1].trim();
    return `${value.slice(0, value.length - last.length).trimEnd()} *${last}*`;
  }
  const words = value.split(" ");
  if (words.length < 5) return value;
  return `${words.slice(0, -3).join(" ")} *${words.slice(-3).join(" ")}*`;
}

/** Strips the `*` accent markers for plain-text contexts (metadata, aria labels). */
export function plainText(value: string): string {
  return value.replace(/\*/g, "");
}

/** Small uppercase label above section headings. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("text-[12px] font-semibold tracking-[.16em] whitespace-nowrap text-gm-accent uppercase", className)}>
      {children}
    </div>
  );
}

export const sectionPadX = "px-[clamp(16px,4vw,48px)]";
export const serif = "font-serif font-normal";

/** Section heading in the display serif with the terracotta italic accent. */
export function SectionTitle({ value, as: Tag = "h2", className }: { value: string; as?: "h1" | "h2" | "h3"; className?: string }) {
  return (
    <Tag className={cn("m-0 font-serif text-[clamp(34px,4.4vw,60px)] leading-[1.08] font-normal tracking-[-0.02em] text-balance", className)}>
      <DisplayText value={value} emClassName="text-gm-accent" />
    </Tag>
  );
}

export const primaryButton =
  "inline-flex items-center justify-center gap-3 rounded-full bg-gm-accent font-semibold text-white! shadow-[0_10px_24px_rgba(168,69,58,.28)] transition-[background,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-gm-accent-dark hover:text-white! active:translate-y-0";

export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-gm-line-strong bg-gm-paper font-semibold text-gm-ink transition-[background,border-color] duration-200 hover:border-gm-ink hover:bg-white hover:text-gm-ink!";

export function Check({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("grid size-[22px] flex-none place-items-center rounded-full bg-gm-blush text-[12px] font-bold text-gm-accent", className)}>
      ✓
    </span>
  );
}

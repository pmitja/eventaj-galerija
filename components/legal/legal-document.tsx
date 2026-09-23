import { Fragment } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locale";
import { getLegalCopy, type LegalDocument } from "@/lib/i18n/legal";
import { marketingHomeHref, privacyPath, termsPath } from "@/lib/i18n/routes";
import { fill, getSiteCopy } from "@/lib/i18n/site";
import { brandName, supportEmail } from "@/lib/seo";
import { SitePage } from "@/components/site/site-chrome";
import { LegalToc } from "./legal-toc";

// `!` premaga globalni `a { color; text-decoration }` iz globals.css, ki ni v Tailwind plasti.
const inlineLink = "text-gm-accent! underline! underline-offset-[3px]";

/**
 * Legal copy carries two inline links as `{email}` / `{privacyPolicy}` tokens so
 * the translations stay plain strings instead of embedded markup.
 */
function LegalText({ value, locale }: { value: string; locale: Locale }) {
  const parts = value.split(/(\{email\}|\{privacyPolicy\})/g);
  const contactEmail = supportEmail(locale);
  return (
    <>
      {parts.map((part, index) => {
        if (part === "{email}") {
          return <a className={inlineLink} key={index} href={`mailto:${contactEmail}`}>{contactEmail}</a>;
        }
        if (part === "{privacyPolicy}") {
          return (
            <Link className={inlineLink} key={index} href={privacyPath(locale)}>
              {getLegalCopy(locale).privacyPolicyLabel}
            </Link>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

/** "1. Data we process" -> ["01", "Data we process"]. */
function splitHeading(heading: string): [string, string] {
  const match = /^(\d+)\.\s*(.*)$/.exec(heading);
  return match ? [match[1].padStart(2, "0"), match[2]] : ["", heading];
}

function readingMinutes(document: LegalDocument): number {
  const text = [document.intro, ...document.sections.flatMap((section) => [...(section.body ?? []), ...(section.items ?? [])])].join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

const bodyText = "text-[17px] leading-[1.7] text-pretty text-gm-body";

export function LegalDocumentPage({
  locale,
  document,
  kind,
}: {
  locale: Locale;
  document: LegalDocument;
  kind: "privacy" | "terms";
}) {
  const t = getSiteCopy(locale).legal;
  const email = supportEmail(locale);
  const keyPoints = kind === "privacy" ? t.privacyKeyPoints : t.termsKeyPoints;
  const other = kind === "privacy"
    ? { href: termsPath(locale), label: getSiteCopy(locale).footer.terms }
    : { href: privacyPath(locale), label: getLegalCopy(locale).privacyPolicyLabel };
  const toc = document.sections.map((section, index) => ({ id: `s${index + 1}`, label: section.heading }));

  return (
    <SitePage locale={locale} sticky={false}>
      <section className="border-b border-gm-line px-[clamp(16px,4vw,48px)] pt-[clamp(48px,6vw,88px)] pb-[clamp(32px,4vw,48px)]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-[18px]">
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-[14px] text-gm-muted">
            <Link href={marketingHomeHref(locale)} className="text-gm-muted! hover:text-gm-accent!">{brandName(locale)}</Link>
            <span aria-hidden="true">/</span><span>{t.legal}</span><span aria-hidden="true">/</span>
            <span className="font-medium text-gm-ink" aria-current="page">{document.title}</span>
          </nav>
          <h1 className="animate-gm-up font-serif text-[clamp(40px,5.4vw,76px)] leading-[1.05] font-normal tracking-[-0.02em]">{document.title}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[15px] text-gm-muted">
            <span className="rounded-full border border-gm-line bg-gm-paper px-3 py-1.5 font-semibold whitespace-nowrap text-gm-ink">{document.version}</span>
            <span className="whitespace-nowrap">{fill(t.readTime, { sections: document.sections.length, minutes: readingMinutes(document) })}</span>
          </div>
          <p className="max-w-[720px] text-[19px] leading-[1.6] text-pretty text-gm-body"><LegalText value={document.intro} locale={locale} /></p>
        </div>
      </section>

      <section className="px-[clamp(16px,4vw,48px)] pt-[clamp(40px,5vw,72px)] pb-[clamp(72px,9vw,120px)]">
        <div className="mx-auto grid max-w-[1180px] grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] items-start gap-[clamp(32px,5vw,80px)]">
          <aside className="flex max-w-[300px] flex-col gap-[18px] min-[860px]:sticky min-[860px]:top-24">
            <div className="text-[12px] font-semibold tracking-[.14em] text-gm-muted uppercase">{t.onThisPage}</div>
            <LegalToc label={t.sections} items={toc} />
            <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-gm-line bg-gm-paper p-[18px] text-[14px] leading-[1.5] text-gm-muted">
              <strong className="font-semibold text-gm-ink">{t.questions}</strong>
              <a href={`mailto:${email}`} className={inlineLink}>{email}</a>
              <Link href={other.href} className="font-semibold text-gm-ink! hover:text-gm-accent!">{other.label} →</Link>
            </div>
          </aside>

          <article className="max-w-[760px] min-w-0 min-[860px]:col-span-2">
            <div className="mb-10 rounded-[22px] border border-gm-line bg-gm-paper p-[clamp(20px,2.6vw,30px)]">
              <div className="mb-3.5 text-[12px] font-semibold tracking-[.14em] text-gm-accent uppercase">{t.keyPoints}</div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                {keyPoints.map(([title, text]) => (
                  <div key={title} className="flex flex-col gap-1">
                    <span className="font-serif text-[24px] leading-[1.1]">{title}</span>
                    <span className="text-[14px] leading-[1.5] text-gm-muted">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {document.sections.map((section, index) => {
              const [number, heading] = splitHeading(section.heading);
              const isLast = index === document.sections.length - 1;
              return (
                <section key={section.heading} id={`s${index + 1}`} className="scroll-mt-24 border-t border-gm-line pt-7 pb-5">
                  <h2 className="mb-4 flex items-baseline gap-4 font-serif text-[clamp(26px,2.6vw,34px)] leading-[1.15] font-normal tracking-[-0.01em]">
                    {number ? <span className="font-gm text-[14px] font-semibold text-gm-accent tabular-nums">{number}</span> : null}
                    {heading}
                  </h2>
                  {section.items ? (
                    <ul className="m-0 mb-4 flex list-none flex-col gap-2.5 p-0">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-3 text-[17px] leading-[1.6] text-gm-body">
                          <span aria-hidden="true" className="mt-[11px] size-1.5 flex-none rounded-full bg-gm-accent" />
                          <span><LegalText value={item} locale={locale} /></span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {section.body?.map((paragraph) => (
                    <p key={paragraph} className={`mb-4! ${bodyText}`}><LegalText value={paragraph} locale={locale} /></p>
                  ))}
                  {isLast && document.notice ? (
                    <div className="mt-2 rounded-2xl border border-gm-blush bg-gm-blush-soft px-5 py-[18px] text-[16px] leading-[1.6] text-gm-body">
                      <LegalText value={document.notice} locale={locale} />
                    </div>
                  ) : null}
                </section>
              );
            })}
          </article>
        </div>
      </section>
    </SitePage>
  );
}

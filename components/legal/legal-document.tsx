import { Fragment } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locale";
import { getLegalCopy, type LegalDocument } from "@/lib/i18n/legal";
import { localizedMarketingPath, privacyPath } from "@/lib/i18n/routes";
import { brandWordParts, guestBrandMark } from "@/lib/seo";

const SUPPORT_EMAIL = "info@eventaj.si";

// `!` premaga globalni `a { color; text-decoration }` iz globals.css, ki ni v Tailwind plasti.
const inlineLink = "text-[#9a315a]! underline! underline-offset-[3px]";
const bodyText = "text-[15px]/[1.7] text-[#59464e] min-[601px]:text-[16px]";

/**
 * Legal copy carries two inline links as `{email}` / `{privacyPolicy}` tokens so
 * the translations stay plain strings instead of embedded markup.
 */
function LegalText({ value, locale }: { value: string; locale: Locale }) {
  const parts = value.split(/(\{email\}|\{privacyPolicy\})/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part === "{email}") {
          return <a className={inlineLink} key={index} href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;
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

export function LegalDocumentPage({
  locale,
  document,
}: {
  locale: Locale;
  document: LegalDocument;
}) {
  const copy = getLegalCopy(locale);
  const home = localizedMarketingPath("/", locale);
  const brandMarkSrc = guestBrandMark(locale);
  const [brandLead, brandTail] = brandWordParts(locale);

  return (
    <main className="min-h-screen bg-[#fffafc] text-[#2b1820]">
      <header className="border-b border-[#eadde2] bg-white">
        <div className="mx-auto flex min-h-[72px] w-[min(100%-32px,860px)] items-center justify-between">
          <Link className="inline-flex items-center gap-[9px] text-[22px] font-[850] tracking-[-.05em] text-[#321722]!" href={home}>
            {brandMarkSrc ? (
              <img className="block size-[30px] flex-none" src={brandMarkSrc} alt="" width={30} height={30} />
            ) : null}
            <span>{brandLead}<span className="text-[#c33268]">{brandTail}</span></span>
          </Link>
          <Link className="inline-flex min-h-11 items-center text-[14px] font-bold text-[#7d294b]!" href={home}>{copy.back}</Link>
        </div>
      </header>
      <article className="mx-auto w-[min(100%-32px,760px)] pt-[42px] pb-[88px] min-[601px]:pt-16">
        <p className="m-0 mb-2 text-[12px] font-extrabold tracking-[.1em] text-[#9a315a] uppercase">{document.eyebrow}</p>
        <h1 className="m-0 mb-3 font-[Georgia,'Times_New_Roman',serif] text-[clamp(38px,8vw,58px)] font-normal tracking-[-.04em]">{document.title}</h1>
        <p className="m-0 mb-[42px] text-[14px] text-[#7d6d73]">{document.version}</p>
        <p className={bodyText}><LegalText value={document.intro} locale={locale} /></p>
        {document.sections.map((section) => (
          <Fragment key={section.heading}>
            <h2 className="mt-[38px] mb-2.5 text-[21px]">{section.heading}</h2>
            {section.items ? (
              <ul className="pl-[22px]">
                {section.items.map((item) => (
                  <li className={bodyText} key={item}><LegalText value={item} locale={locale} /></li>
                ))}
              </ul>
            ) : null}
            {section.body?.map((paragraph) => (
              <p className={bodyText} key={paragraph}><LegalText value={paragraph} locale={locale} /></p>
            ))}
          </Fragment>
        ))}
        {document.notice ? (
          <p className={`${bodyText} my-7 rounded-2xl border border-[#e9cad6] bg-[#fff3f7] px-5 py-[18px]`}><LegalText value={document.notice} locale={locale} /></p>
        ) : null}
      </article>
    </main>
  );
}

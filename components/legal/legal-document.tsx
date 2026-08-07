import { Fragment } from "react";
import Link from "next/link";
import styles from "@/app/legal.module.css";
import type { Locale } from "@/lib/i18n/locale";
import { getLegalCopy, type LegalDocument } from "@/lib/i18n/legal";
import { localizedMarketingPath, privacyPath } from "@/lib/i18n/routes";
import { guestBrandMark } from "@/lib/seo";

const SUPPORT_EMAIL = "info@eventaj.si";

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
          return <a key={index} href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;
        }
        if (part === "{privacyPolicy}") {
          return (
            <Link key={index} href={privacyPath(locale)}>
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

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href={home}>
            {brandMarkSrc ? (
              <img className={styles.brandMark} src={brandMarkSrc} alt="" width={30} height={30} />
            ) : null}
            <span className={styles.brandWord}>Guest<span> Mosaic</span></span>
          </Link>
          <Link className={styles.back} href={home}>{copy.back}</Link>
        </div>
      </header>
      <article className={styles.article}>
        <p className={styles.eyebrow}>{document.eyebrow}</p>
        <h1>{document.title}</h1>
        <p className={styles.updated}>{document.version}</p>
        <p><LegalText value={document.intro} locale={locale} /></p>
        {document.sections.map((section) => (
          <Fragment key={section.heading}>
            <h2>{section.heading}</h2>
            {section.items ? (
              <ul>
                {section.items.map((item) => (
                  <li key={item}><LegalText value={item} locale={locale} /></li>
                ))}
              </ul>
            ) : null}
            {section.body?.map((paragraph) => (
              <p key={paragraph}><LegalText value={paragraph} locale={locale} /></p>
            ))}
          </Fragment>
        ))}
        {document.notice ? (
          <p className={styles.notice}><LegalText value={document.notice} locale={locale} /></p>
        ) : null}
      </article>
    </main>
  );
}

import { formatPrice } from "@/lib/domain/billing";
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, Check, ChevronDown, ExternalLink, Play, X } from 'lucide-react';
import { Header } from '@/components/landing/header-server';
import { Footer } from '@/components/landing/footer';
import { LocalUploadDemo } from '@/components/landing/local-upload-demo';
import { ComparisonFaq } from '@/components/comparisons/comparison-faq';
import { weddingConversionCopy } from '@/components/landing/wedding-conversion-copy';
import { getSolutionPage } from '@/components/landing/solution-pages';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { localizedMarketingScreenshot } from '@/lib/i18n/marketing-assets';
import { demoEventPath, orderPath } from '@/lib/i18n/routes';
import { intlLocale, localePathPrefix } from '@/lib/i18n/locale';
import { comparisonCopy } from '@/lib/comparisons/copy';
import { comparisonContent } from '@/lib/comparisons/content';
import { COMPARISONS, FACT_MARKS, FEATURE_IDS, GUEST_MOSAIC_FACTS, type FactId } from '@/lib/comparisons/facts';
import { COMPARISON_IDS, COMPARISON_LABELS, COMPARISON_LOCALES, COMPARISON_UPDATED, comparisonPath, type ComparisonId, type ComparisonLocale } from '@/lib/comparisons/routes';

function Actions({ locale, hero = false }: { locale: ComparisonLocale; hero?: boolean }) {
  const t = comparisonCopy[locale];
  return <div className="compare-actions">
    <Link className="button" href={orderPath(locale)} data-sticky-cta-trigger={hero ? 'create-event' : undefined}>{t.buy}<ArrowRight size={18} aria-hidden="true" /></Link>
    <Link className="button button--secondary" href={demoEventPath(locale)}><Play size={16} aria-hidden="true" />{t.demo}</Link>
  </div>;
}

function Related({ locale, current }: { locale: ComparisonLocale; current?: ComparisonId }) {
  const t = comparisonCopy[locale];
  return <div className={`compare-list${current ? ' compare-list--related' : ''}`}>
    {COMPARISON_IDS.filter(id => id !== current).map(id => <article className="compare-card" key={id}>
      <h3><span className="sr-only">Guest Mosaic vs </span>{COMPARISONS[id].name}</h3>
      <p>{t.summaries[id]}</p>
      <Link className="button button--secondary" href={comparisonPath(locale, id)} aria-label={`${t.compare}: Guest Mosaic vs ${COMPARISONS[id].name}`}>{t.compare}<ArrowRight size={18} aria-hidden="true" /></Link>
    </article>)}
  </div>;
}

function FactValue({ fact, text }: { fact: FactId; text: string }) {
  const mark = FACT_MARKS[fact];
  return <span className={`compare-fact compare-fact--${mark}`}>
    {mark === 'check' ? <Check size={18} strokeWidth={2.5} aria-hidden="true" /> : null}
    {mark === 'x' ? <X size={18} strokeWidth={2.5} aria-hidden="true" /> : null}
    <span>{text}</span>
  </span>;
}

export function ComparisonPage({ locale, id }: { locale: ComparisonLocale; id?: ComparisonId }) {
  const t = comparisonCopy[locale];
  const content = id ? comparisonContent[locale][id] : null;
  const provider = id ? COMPARISONS[id] : null;
  const wedding = weddingConversionCopy[locale];
  const steps = getDictionary(locale).heroPromise.steps.slice(0, 3);
  const date = new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${COMPARISON_UPDATED}T00:00:00Z`));
  const faqItems = content ? [[content.question, content.answer], ...getSolutionPage('wedding-qr', locale).faq.slice(0, 2)] as const : [];
  return <main className="landing-page comparison-page" id="top">
    <Header locale={locale} languageLocales={COMPARISON_LOCALES} howItWorksHref="#how-it-works" />
    <section className="compare-hero" id="main-content" tabIndex={-1}>
      <div className="shell">
        <nav className="compare-breadcrumb" aria-label={COMPARISON_LABELS[locale]}>
          <Link href={localePathPrefix(locale) || '/'}>Guest Mosaic</Link><span aria-hidden="true">/</span>
          {id ? <><Link href={comparisonPath(locale)}>{COMPARISON_LABELS[locale]}</Link><span aria-hidden="true">/</span><span>Guest Mosaic vs {provider?.name}</span></> : <span>{COMPARISON_LABELS[locale]}</span>}
        </nav>
        <div className="compare-hero__inner">
          <div className="compare-hero__copy">
            <h1>{content?.headline ?? t.hubTitle}</h1>
            <p>{content?.intro ?? t.hubIntro}</p>
            <Actions locale={locale} hero />
            <p className="compare-trust">{t.facts.gmPrice}<br />{t.facts.noAccount}</p>
          </div>
          <figure className="compare-product">
            <Image src={localizedMarketingScreenshot(locale, '/marketing/screenshots/comments-desktop.png')} alt={t.screenshot} width={1440} height={900} priority sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) 70vw, 48vw" />
            <figcaption><span>Guest Mosaic · {t.seoTopic}</span><Link href={demoEventPath(locale)}>{t.demo}<ArrowRight size={16} aria-hidden="true" /></Link></figcaption>
          </figure>
        </div>
      </div>
    </section>

    {content && provider ? <>
      <section className="compare-section compare-decision">
        <div className="shell">
          <h2 className="compare-heading">{t.decision}</h2>
          <div className="compare-decision__grid">
            <article className="compare-choice compare-choice--ours"><h3>Guest Mosaic</h3><p>{content.ours}</p><Link className="button" href={orderPath(locale)}>{t.buy}<ArrowRight size={18} aria-hidden="true" /></Link></article>
            <article className="compare-choice"><h3>{provider.name}</h3><p>{content.theirs}</p><a className="compare-text-link" href="#comparison">{t.compare}<ArrowDown size={16} aria-hidden="true" /></a></article>
          </div>
        </div>
      </section>
      <section className="compare-section compare-section--muted" id="comparison">
        <div className="shell">
          <h2 className="compare-heading">{t.table}</h2><p className="compare-section__intro">{t.package}: Guest Mosaic · {provider.name} {provider.plan}</p>
          <table className="compare-table" role="table">
            <caption className="sr-only">Guest Mosaic vs {provider.name}: {t.seoTopic}</caption>
            <thead><tr role="row"><th scope="col" role="columnheader">{t.feature}</th><th scope="col" role="columnheader">Guest Mosaic</th><th scope="col" role="columnheader">{provider.name}</th></tr></thead>
            <tbody>{FEATURE_IDS.map((feature, i) => <tr key={feature} role="row">
              <th scope="row" role="rowheader">{t.features[i]}</th>
              <td role="cell" data-provider="Guest Mosaic"><FactValue fact={GUEST_MOSAIC_FACTS[i]} text={t.facts[GUEST_MOSAIC_FACTS[i]]} /></td>
              <td role="cell" data-provider={provider.name}><FactValue fact={provider.facts[i]} text={t.facts[provider.facts[i]]} />{feature === 'price' ? <a className="compare-source-link" href="#sources">{t.sources}<ArrowDown size={14} aria-hidden="true" /></a> : null}</td>
            </tr>)}</tbody>
          </table>
          <div className="compare-table__footer"><p>{t.checked}: <time dateTime={COMPARISON_UPDATED}>{date}</time></p><Link className="button" href={orderPath(locale)}>{t.buy}<ArrowRight size={18} aria-hidden="true" /></Link></div>
        </div>
      </section>
      <section className="compare-section">
        <div className="shell compare-explanation"><h2 className="compare-heading">{content.detailTitle}</h2><p>{content.detail}</p></div>
      </section>
    </> : <section className="compare-section compare-directory"><div className="shell"><h2 className="compare-heading">{t.decision}</h2><Related locale={locale} /></div></section>}

    <section className="compare-section compare-section--muted" id="guest-upload-demo">
      <div className="shell compare-demo">
        <div className="compare-demo__copy"><h2 className="compare-heading">{t.demoTitle}</h2><p>{t.demoText}</p><Link className="button button--secondary" href={demoEventPath(locale)}><Play size={16} aria-hidden="true" />{wedding.uploadDemoLink.replace(/\s*→$/, '')}</Link></div>
        <LocalUploadDemo copy={wedding} locale={locale} />
      </div>
    </section>
    <section className="compare-section compare-offer" id="offer">
      <div className="shell">
        <div className="compare-offer__inner">
          <div className="compare-offer__copy"><h2 className="compare-heading">{t.offerTitle}</h2><p>{t.offerText}</p>
            <ol className="compare-steps" id="how-it-works">{steps.map(([title, text], i) => <li key={title}><span aria-hidden="true">{i + 1}</span><div><strong>{title}</strong><p>{text}</p></div></li>)}</ol>
          </div>
          <div className="compare-offer__details"><div className="compare-offer__price"><strong>{formatPrice(3500, locale)}</strong><span>{wedding.offerPriceNote}</span></div>
            <ul>{[t.facts.noAccount, t.facts.gmMedia, t.facts.gmSlideshow, t.facts.gmDownload].map(item => <li key={item}><Check size={18} aria-hidden="true" />{item}</li>)}</ul>
            <Link className="button" href={orderPath(locale)}>{t.buy}<ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
        </div>
        <p className="compare-limitations">{t.limitations}</p>
      </div>
    </section>
    {content ? <section className="compare-section compare-faq">
      <div className="shell"><h2 className="compare-heading">{t.faq}</h2>
        <ComparisonFaq items={faqItems} />
      </div>
    </section> : null}
    {id ? <section className="compare-section compare-directory"><div className="shell"><h2 className="compare-heading">{t.related}</h2><Related locale={locale} current={id} /></div></section> : null}
    <section className="compare-sources" id="sources"><div className="shell">
      <details>
        <summary><h2 className="compare-heading">{t.sources}</h2><span>{t.checked}: <time dateTime={COMPARISON_UPDATED}>{date}</time></span><ChevronDown size={20} aria-hidden="true" /></summary>
        <p>{t.priceNote}</p>
        <div className="compare-sources__groups">{(provider ? [provider] : Object.values(COMPARISONS)).map(p => <div key={p.name}><h3>{p.name}{p.plan ? ` · ${p.plan}` : ''}</h3><ul>{p.sources.map((source, i) => <li key={`${p.name}-${i}`}><a href={source.url}>{source.name}<ExternalLink size={14} aria-hidden="true" /></a></li>)}</ul></div>)}</div>
      </details>
      <p>{t.disclosure}</p>
    </div></section>
    <Footer locale={locale} />
  </main>;
}

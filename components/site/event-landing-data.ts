import type { Locale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { eventUseCaseMarketingPath, SOLUTION_PAGE_PATHS, solutionPagePath, type SolutionPageId, type SolutionPageLocale } from "@/lib/i18n/routes";
import { fill, getSiteCopy } from "@/lib/i18n/site";
import { brandName } from "@/lib/seo";
import { getSolutionPage } from "@/components/landing/solution-pages";
import { eventUseCasesFor, type EventUseCase } from "@/components/landing/use-cases";
import { weddingConversionCopy } from "@/components/landing/wedding-conversion-copy";
import type { EventLandingData } from "./event-landing";
import { eventPhotos } from "./event-landing";

/** Old copy used "Create … — €35"; the redesign separates the price with a middle dot. */
const dotted = (value: string) => value.replace(/\s+[—–]\s+/g, " · ");

const BUSINESS_SLUGS = new Set(["team-building", "poslovni-dogodki", "konference-in-sejmi"]);

function genericSections(locale: Locale): Pick<EventLandingData, "offer" | "comparison"> {
  const site = getSiteCopy(locale);
  const brand = brandName(locale);
  const c = site.compare;
  return {
    offer: {
      eyebrow: site.event.included,
      heading: site.pricing.headingGeneral,
      text: site.pricing.text,
      priceNote: site.event.offerNote,
      items: [1, 0, 4, 5, 7, 8].map((index) => site.pricing.included[index]),
      cta: site.finalCta.ctaGeneral,
    },
    comparison: {
      eyebrow: c.eyebrow,
      heading: fill(c.heading, { brand }),
      text: c.text,
      task: c.task,
      product: brand,
      alternative: c.alternative,
      rows: c.rows,
      diy: {
        eyebrow: c.diyEyebrow,
        heading: c.diyHeading,
        text: c.diyText,
        when: c.diyWhen,
        whenText: c.diyWhenText,
        paidWhen: fill(c.paidWhen, { brand }),
        paidWhenText: c.paidWhenText,
        cta: c.paidCta,
      },
    },
  };
}

export function solutionLandingData(locale: SolutionPageLocale, id: SolutionPageId): EventLandingData {
  const page = getSolutionPage(id, locale);
  const wedding = id === "wedding-qr";
  const photos = eventPhotos(wedding ? "wedding" : "party");
  const generic = genericSections(locale);
  const w = weddingConversionCopy[locale];
  const brand = brandName(locale);
  const related = (Object.keys(SOLUTION_PAGE_PATHS) as SolutionPageId[]).filter((other) => other !== id);

  return {
    breadcrumb: page.navTitle,
    eyebrow: page.eyebrow,
    title: page.title,
    description: page.description,
    primaryCta: dotted(page.primaryCta),
    secondaryCta: page.secondaryCta,
    heroImage: photos.hero,
    heroAlt: getSiteCopy(locale).event.heroAlt,
    strip: photos.strip,
    benefits: {
      eyebrow: page.benefitsPill,
      heading: page.benefitsHeading,
      intro: page.benefitsIntro,
      items: page.benefits.map((benefit, index) => ({ ...benefit, image: photos.benefits[index % photos.benefits.length] })),
    },
    offer: wedding
      ? { eyebrow: w.offerPill, heading: w.offerHeading, text: w.offerText, priceNote: w.offerPriceNote, items: w.offerItems, cta: w.offerCta }
      : generic.offer,
    clarity: { eyebrow: page.clarityPill, heading: page.clarityHeading, text: page.clarityText, items: page.clarityItems, image: photos.clarity },
    comparison: wedding
      ? {
          eyebrow: w.comparisonPill,
          heading: w.comparisonHeading,
          text: w.comparisonText,
          task: w.comparisonFeature,
          product: w.comparisonProduct,
          alternative: w.comparisonAlternative,
          rows: w.comparisonRows,
          diy: {
            eyebrow: w.freePill,
            heading: w.freeHeading,
            text: w.freeText,
            when: w.freeGoodFor,
            whenText: w.freeGoodForText,
            paidWhen: w.paidGoodFor.replace("Guest Mosaic", brand),
            paidWhenText: w.paidGoodForText,
            cta: `${w.offerCta} →`,
          },
        }
      : generic.comparison,
    faq: { heading: page.faqHeading, items: page.faq },
    related: {
      heading: page.relatedHeading,
      links: related.flatMap((other) => {
        const href = solutionPagePath(locale, other);
        return href ? [{ kicker: page.relatedLink, title: getSolutionPage(other, locale).navTitle, href }] : [];
      }),
    },
    wedding,
  };
}

export function landingDataForUseCase(locale: Locale, useCase: EventUseCase): EventLandingData {
  const dict = getDictionary(locale).useCasePage;
  const site = getSiteCopy(locale);
  const wedding = useCase.slug === "poroke";
  const photos = eventPhotos(wedding ? "wedding" : BUSINESS_SLUGS.has(useCase.slug) ? "business" : "party");
  const related = eventUseCasesFor(locale)
    .filter((item) => item.group === useCase.group && item.slug !== useCase.slug)
    .slice(0, 2);

  return {
    breadcrumb: useCase.navTitle,
    eyebrow: useCase.eyebrow,
    title: useCase.title,
    description: useCase.description,
    primaryCta: dict.ctaCreate,
    secondaryCta: site.hero.tryGuest,
    heroImage: photos.hero,
    heroAlt: site.event.heroAlt,
    strip: photos.strip,
    benefits: {
      eyebrow: useCase.benefitsPill ?? dict.benefitsPill,
      heading: dict.benefitsHeading,
      intro: dict.benefitsSubtitle,
      items: useCase.highlights.map((title, index) => ({ title, image: photos.benefits[index % photos.benefits.length] })),
    },
    ...genericSections(locale),
    clarity: { eyebrow: dict.flexiblePill, heading: dict.flexibleHeading, text: dict.flexibleSubtitle, items: useCase.scenarios, image: photos.clarity },
    faq: { heading: dict.faqHeading, items: useCase.faq },
    related: {
      heading: dict.exploreMore,
      links: related.map((item) => ({ kicker: item.group, title: item.navTitle, text: item.navDescription, href: eventUseCaseMarketingPath(locale, item.slug) })),
    },
    wedding,
  };
}

/** The honest "us vs. a free workaround" table for pages without a wedding focus. */
export function genericComparison(locale: Locale): NonNullable<EventLandingData["comparison"]> {
  return genericSections(locale).comparison as NonNullable<EventLandingData["comparison"]>;
}

import type { MetadataRoute } from "next";
import { eventUseCases } from "@/components/landing/use-cases";
import { absoluteUrl, SEO_LAST_UPDATED } from "@/lib/seo";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { appUrlForLocale } from "@/lib/i18n/locale";
import { eventUseCasePath, orderPath } from "@/lib/i18n/routes";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locale = await getRequestLocale();
  const siteUrl = appUrlForLocale(getPublicAppUrls(), locale);
  const marketingPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/", siteUrl),
      lastModified: SEO_LAST_UPDATED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl(orderPath(locale), siteUrl),
      lastModified: SEO_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const useCasePages: MetadataRoute.Sitemap = eventUseCases.map(({ slug }) => ({
    url: absoluteUrl(eventUseCasePath(locale, slug), siteUrl),
    lastModified: SEO_LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...marketingPages, ...useCasePages];
}

import type { MetadataRoute } from "next";
import { eventUseCases } from "@/components/landing/use-cases";
import { absoluteUrl, SEO_LAST_UPDATED } from "@/lib/seo";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { appUrlForLocale } from "@/lib/i18n/locale";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = appUrlForLocale(getPublicAppUrls(), await getRequestLocale());
  const marketingPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/", siteUrl),
      lastModified: SEO_LAST_UPDATED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/naroci", siteUrl),
      lastModified: SEO_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const useCasePages: MetadataRoute.Sitemap = eventUseCases.map(({ slug }) => ({
    url: absoluteUrl(`/za-dogodke/${slug}`, siteUrl),
    lastModified: SEO_LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...marketingPages, ...useCasePages];
}

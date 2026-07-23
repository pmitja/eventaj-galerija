import type { MetadataRoute } from "next";
import { eventUseCases } from "@/components/landing/use-cases";
import { absoluteUrl, SEO_LAST_UPDATED } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const marketingPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: SEO_LAST_UPDATED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/naroci"),
      lastModified: SEO_LAST_UPDATED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const useCasePages: MetadataRoute.Sitemap = eventUseCases.map(({ slug }) => ({
    url: absoluteUrl(`/za-dogodke/${slug}`),
    lastModified: SEO_LAST_UPDATED,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...marketingPages, ...useCasePages];
}

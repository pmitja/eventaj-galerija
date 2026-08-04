import type { MetadataRoute } from "next";
import { PRIVATE_ROBOTS_PATHS } from "@/lib/seo";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { appUrlForLocale } from "@/lib/i18n/locale";

export const dynamic = "force-dynamic";

const publicRules = {
  allow: ["/", "/za-dogodke/", "/naroci", "/llms.txt", "/llms-full.txt"],
  disallow: [...PRIVATE_ROBOTS_PATHS],
};

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = appUrlForLocale(getPublicAppUrls(), await getRequestLocale());
  return {
    rules: [
      {
        userAgent: "*",
        ...publicRules,
      },
      {
        userAgent: "OAI-SearchBot",
        ...publicRules,
      },
      {
        userAgent: "ChatGPT-User",
        ...publicRules,
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

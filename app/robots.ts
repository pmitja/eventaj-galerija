import type { MetadataRoute } from "next";
import { PRIVATE_ROBOTS_PATHS } from "@/lib/seo";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { appUrlForLocale } from "@/lib/i18n/locale";
import { orderPath } from "@/lib/i18n/routes";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const locale = await getRequestLocale();
  const siteUrl = appUrlForLocale(getPublicAppUrls(), locale);
  const publicRules = {
    allow: ["/", locale === "en" ? "/for-events/" : "/za-dogodke/", orderPath(locale), "/llms.txt", "/llms-full.txt"],
    disallow: [...PRIVATE_ROBOTS_PATHS],
  };
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

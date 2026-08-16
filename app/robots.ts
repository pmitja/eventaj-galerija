import type { MetadataRoute } from "next";
import { PRIVATE_ROBOTS_PATHS } from "@/lib/seo";
import { getPublicAppUrls, getRequestLocale } from "@/lib/i18n/server";
import { PREFIXED_LOCALES, appUrlForLocale, localePathPrefix } from "@/lib/i18n/locale";
import { orderPath, privacyPath, termsPath } from "@/lib/i18n/routes";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const locale = await getRequestLocale();
  const siteUrl = appUrlForLocale(getPublicAppUrls(), locale);
  // The English domain also serves the path-prefixed languages, so their
  // marketing routes have to be crawlable too.
  const localesOnHost = locale === "sl" ? (["sl"] as const) : (["en", ...PREFIXED_LOCALES] as const);
  const publicRules = {
    allow: [
      "/",
      "/llm.txt",
      "/llms.txt",
      "/llms-full.txt",
      ...localesOnHost.flatMap((item) => [
        `${localePathPrefix(item)}${item === "sl" ? "/za-dogodke/" : "/for-events/"}`,
        orderPath(item),
        termsPath(item),
        privacyPath(item),
        // The prefixed languages serve their own translated copies of these.
        `${localePathPrefix(item)}/llm.txt`,
        `${localePathPrefix(item)}/llms.txt`,
        `${localePathPrefix(item)}/llms-full.txt`,
      ]),
    ],
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

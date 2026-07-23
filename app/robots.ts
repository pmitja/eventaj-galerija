import type { MetadataRoute } from "next";
import { PRIVATE_ROBOTS_PATHS, SITE_URL } from "@/lib/seo";

const publicRules = {
  allow: ["/", "/za-dogodke/", "/naroci", "/llms.txt", "/llms-full.txt"],
  disallow: [...PRIVATE_ROBOTS_PATHS],
};

export default function robots(): MetadataRoute.Robots {
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
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/favorites", "/onboard"],
    },
    sitemap: "https://kaamdha.com/sitemap.xml",
  };
}

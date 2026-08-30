import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/contact", "/form", "/docs", "/terms", "/privacy"],
      disallow: ["/dashboard", "/api/"],
    },
    sitemap: "https://nvpsa.vercel.app/sitemap.xml",
  };
}

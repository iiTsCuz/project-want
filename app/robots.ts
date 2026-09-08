import type {
  MetadataRoute,
} from "next";

export default function robots():
  MetadataRoute.Robots {
  const baseUrl =
    "https://www.wantpilot.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",

      disallow: [
        "/dashboard",
        "/settings",
        "/api/",
      ],
    },

    sitemap:
      `${baseUrl}/sitemap.xml`,
  };
}
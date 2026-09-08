import type {
  MetadataRoute,
} from "next";

export default function sitemap():
  MetadataRoute.Sitemap {
  const baseUrl =
    "https://project-want.vercel.app";

  const products = [
    "rtx-5070",
    "iphone-17-pro",
    "ps5-pro",
    "oled-monitor",
    "airpods-pro",
    "macbook-air-m4",
  ];

  const staticPages:
    MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified:
        new Date(),
      changeFrequency:
        "daily",
      priority:
        1,
    },

    {
      url:
        `${baseUrl}/about`,
      lastModified:
        new Date(),
      changeFrequency:
        "monthly",
      priority:
        0.6,
    },

    {
      url:
        `${baseUrl}/privacy`,
      lastModified:
        new Date(),
      changeFrequency:
        "monthly",
      priority:
        0.3,
    },

    {
      url:
        `${baseUrl}/cookies`,
      lastModified:
        new Date(),
      changeFrequency:
        "monthly",
      priority:
        0.3,
    },

    {
      url:
        `${baseUrl}/terms`,
      lastModified:
        new Date(),
      changeFrequency:
        "monthly",
      priority:
        0.3,
    },
  ];

  const productPages:
    MetadataRoute.Sitemap =
    products.map(
      (slug) => ({
        url:
          `${baseUrl}/products/${slug}`,

        lastModified:
          new Date(),

        changeFrequency:
          "daily",

        priority:
          0.8,
      })
    );

  return [
    ...staticPages,
    ...productPages,
  ];
}
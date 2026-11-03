import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { venues } from "@/lib/venue-data";
import { guideArticles } from "@/lib/guide-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.seo.siteUrl;
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1, alternates: { languages: { en: `${base}/`, ar: `${base}/ar`, "x-default": `${base}/` } } },
    { url: `${base}/#tonight`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/#venues`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/#events`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/#vip`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/#celebrations`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/#night-edit`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/#locations`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/#about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/#faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const venueRoutes: MetadataRoute.Sitemap = venues.map((v) => ({
    url: `${base}/#venue-${v.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const guideRoutes: MetadataRoute.Sitemap = guideArticles.map((a) => ({
    url: `${base}/#guide-${a.slug}`,
    lastModified: a.reviewedDate,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...venueRoutes, ...guideRoutes];
}

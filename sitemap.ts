import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://kortex.rafa-mori.dev';
  return [
    { url: `${baseUrl}`, lastModified: new Date() },
    { url: `${baseUrl}/dashboard`, lastModified: new Date() },
    { url: `${baseUrl}/monitor`, lastModified: new Date() },
    { url: `${baseUrl}/analytics`, lastModified: new Date() },
    { url: `${baseUrl}/servers`, lastModified: new Date() },
    { url: `${baseUrl}/api-config`, lastModified: new Date() },
    { url: `${baseUrl}/settings`, lastModified: new Date() },
    { url: `${baseUrl}/login`, lastModified: new Date() },
  ];
}

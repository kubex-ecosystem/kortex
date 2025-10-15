export type SitemapEntry = {
  url: string;
  lastModified: string;
};

const resolveBaseUrl = () => {
  const envRecord = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined>; };
  }).process?.env;

  return envRecord?.VITE_BASE_URL || envRecord?.BASE_URL || 'https://dev.kubex.world';
};

export default function sitemap(): SitemapEntry[] {
  const baseUrl = resolveBaseUrl();
  const now = new Date().toISOString();

  return [
    { url: `${baseUrl}`, lastModified: now },
    { url: `${baseUrl}/dashboard`, lastModified: now },
    { url: `${baseUrl}/monitor`, lastModified: now },
    { url: `${baseUrl}/analytics`, lastModified: now },
    { url: `${baseUrl}/servers`, lastModified: now },
    { url: `${baseUrl}/api-config`, lastModified: now },
    { url: `${baseUrl}/settings`, lastModified: now },
    { url: `${baseUrl}/login`, lastModified: now },
    { url: `${baseUrl}/prompt-engineering`, lastModified: now }
  ];
}

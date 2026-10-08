import type { MetadataRoute } from 'next';
import { MANAGER_PATH, RIVALS_PATH } from '@/lib/constants/routes';
import { SITE_URL } from '@/lib/constants/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}${MANAGER_PATH}`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}${RIVALS_PATH}`, changeFrequency: 'monthly', priority: 0.8 },
  ];
}

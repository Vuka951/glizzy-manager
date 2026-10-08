import type { MetadataRoute } from 'next';
import { RIVALS_PATH } from '@/lib/constants/routes';
import { SITE_URL } from '@/lib/constants/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/preview', '/api', `${RIVALS_PATH}/`],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

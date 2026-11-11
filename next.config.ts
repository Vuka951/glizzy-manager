import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/preview/animations',
        destination: '/preview',
        permanent: true,
      },
      {
        source: '/preview/match-stats',
        destination: '/preview/match',
        permanent: true,
      },
      {
        source: '/preview/season-backdrop',
        destination: '/preview/characters',
        permanent: true,
      },
      {
        source: '/preview/achievement-toast',
        destination: '/preview/career',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { Locale } from '@/data/games/locale';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const OPEN_GRAPH_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  sr: 'sr_RS',
};

export const TRAILER_VIDEO_PATH = '/trailer/glizzy-manager-trailer.mp4';
export const TRAILER_CAPTIONS_PATH = '/trailer/glizzy-manager-trailer.vtt';
export const TRAILER_CAPTIONS_LOCALE: Locale = 'en';

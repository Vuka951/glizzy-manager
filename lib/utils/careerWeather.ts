import { WEATHER_RANGES } from '@/lib/constants/broadcastWeather';
import { seasonThemeIndex } from '@/lib/utils/cupSeason';

export type CupWeather = {
  temp: number;
  // Callers take these modulo their own pool sizes
  descIndex: number;
  lineIndex: number;
};

function hash(n: number): number {
  let x = (n ^ 0x9e3779b9) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

// One forecast per cup, the same on every screen that opens it: the year and
// season seed it, so a whole room hears one line and reads one temperature
export function cupWeather(career: { year: number; season: number }): CupWeather {
  const [min, max] = WEATHER_RANGES[seasonThemeIndex(career.season)] ?? WEATHER_RANGES[0];
  const key = career.year * 4 + career.season;
  return {
    temp: min + Math.floor(hash(key) * (max - min + 1)),
    descIndex: Math.floor(hash(key * 31 + 7) * 1000),
    lineIndex: Math.floor(hash(key * 53 + 11) * 1000),
  };
}

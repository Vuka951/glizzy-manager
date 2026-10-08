import type { SeasonRecord } from '@/lib/utils/careerSave';

export type ChartSeries = {
  slug: string;
  name: string;
  values: (number | null)[];
};

// One line per character across every recorded cup: the table place, or
// the points. Cups from before the table was recorded leave a gap
export function placeSeries(
  history: SeasonRecord[],
  slugs: string[],
  nameOf: (slug: string) => string,
  playerSlug: string,
): ChartSeries[] {
  return slugs.map((slug) => ({
    slug,
    name: nameOf(slug),
    values: history.map((record) => {
      if (record.ranks) {
        const at = record.ranks.indexOf(slug);
        return at >= 0 ? at + 1 : null;
      }
      return slug === playerSlug && record.playerPlace > 0
        ? record.playerPlace
        : null;
    }),
  }));
}

export function pointsSeries(
  history: SeasonRecord[],
  slugs: string[],
  nameOf: (slug: string) => string,
): ChartSeries[] {
  return slugs.map((slug) => ({
    slug,
    name: nameOf(slug),
    values: history.map((record) => record.points?.[slug] ?? null),
  }));
}

export function hasRecordedTables(history: SeasonRecord[]): boolean {
  return history.some((record) => record.ranks && record.points);
}

// The x axis names the year once, at its first cup
export function yearLabels(
  history: SeasonRecord[],
  format: (year: number) => string,
): string[] {
  return history.map((record, i) =>
    i === 0 || history[i - 1].year !== record.year ? format(record.year) : '',
  );
}

// An SVG path through the points that exist, lifting the pen over gaps
export function linePath(
  values: (number | null)[],
  x: (index: number) => number,
  y: (value: number) => number,
): string {
  let path = '';
  let drawing = false;
  values.forEach((value, i) => {
    if (value === null) {
      drawing = false;
      return;
    }
    path += `${drawing ? 'L' : 'M'}${x(i).toFixed(1)} ${y(value).toFixed(1)} `;
    drawing = true;
  });
  return path.trim();
}

export function ticksBetween(
  min: number,
  max: number,
  count: number,
): number[] {
  if (count < 2) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => Math.round(min + i * step));
}

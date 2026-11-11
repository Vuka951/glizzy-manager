import type { SeasonRecord, SponsorId } from '@/lib/utils/careerSave';

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

export type CupGain = {
  year: number;
  season: number;
  gain: number | null;
};

// The points one character made at each cup. The campaign opens at zero, and
// a cup that follows an unrecorded table has nothing to compare against
export function cupGains(history: SeasonRecord[], slug: string): CupGain[] {
  return history.map((record, i) => {
    const own = record.points?.[slug];
    const before = i === 0 ? 0 : history[i - 1].points?.[slug];
    return {
      year: record.year,
      season: record.season,
      gain: own === undefined || before === undefined ? null : own - before,
    };
  });
}

// The longest run of titles one character put together, read off the cups
// themselves; a save without history falls back to the streak it ended on
export function longestTitleStreak(
  history: SeasonRecord[],
  slug: string,
  currentStreak: number,
): number {
  if (history.length === 0) return currentStreak;
  let longest = 0;
  let run = 0;
  history.forEach((record) => {
    run = record.champion === slug ? run + 1 : 0;
    longest = Math.max(longest, run);
  });
  return longest;
}

export type GovernmentStint = {
  from: number;
  to: number;
  government: SponsorId[];
  primeMinister: string | null;
};

// Consecutive elections that kept the same prime minister and the same parties
// read as one stint; the last one runs to the campaign's current year
export function governmentStints(
  governments: {
    year: number;
    government: SponsorId[];
    primeMinister?: string | null;
  }[],
  lastYear: number,
): GovernmentStint[] {
  const sameParties = (a: SponsorId[], b: SponsorId[]) =>
    a.length === b.length && a.every((party) => b.includes(party));
  const stints: GovernmentStint[] = [];
  governments.forEach((g, i) => {
    const to = Math.max(g.year, (governments[i + 1]?.year ?? lastYear + 1) - 1);
    const pm = g.primeMinister ?? null;
    const open = stints[stints.length - 1];
    if (open && open.primeMinister === pm && sameParties(open.government, g.government)) {
      open.to = to;
    } else {
      stints.push({ from: g.year, to, government: g.government, primeMinister: pm });
    }
  });
  return stints;
}

export function hasRecordedTables(history: SeasonRecord[]): boolean {
  return history.some((record) => record.ranks && record.points);
}

// The x axis names the year once, at its first cup; a long campaign names
// only every few years so the labels never touch
export function yearLabels(
  history: SeasonRecord[],
  format: (year: number) => string,
  maxLabels = Infinity,
): string[] {
  const first = history[0]?.year ?? 0;
  const years = (history[history.length - 1]?.year ?? first) - first + 1;
  const step = Number.isFinite(maxLabels) ? Math.ceil(years / maxLabels) : 1;
  return history.map((record, i) =>
    (i === 0 || history[i - 1].year !== record.year) &&
    (record.year - first) % step === 0
      ? format(record.year)
      : '',
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

// Evenly spaced ticks on round numbers, from zero to at least the top value
export function roundTicks(top: number, count: number): number[] {
  const rough = Math.max(1, top) / Math.max(1, count - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((m) => m >= rough) ??
    rough;
  const ticks: number[] = [];
  for (let t = 0; ; t += step) {
    ticks.push(Math.round(t));
    if (t >= top) return ticks;
  }
}

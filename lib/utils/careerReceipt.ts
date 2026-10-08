import { GAMES_UI } from '@/data/games/locale';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { fmt, plural } from '@/lib/utils/format';

const CAREER = GAMES_UI.career;

export type ReceiptLine = { text: string; good: boolean };

// Rising CHOLESTEROL is bad news, so its chips color the other way around
export function meterDeltaLines(
  before: CharacterCareerState,
  after: CharacterCareerState,
): ReceiptLine[] {
  const labels = GAMES_UI.career.meters;
  const meters: [string, number, number, boolean][] = [
    [labels.stress, before.stress, after.stress, true],
    [labels.appetite, before.appetite, after.appetite, false],
    [labels.ambition, before.ambition, after.ambition, false],
    [labels.ego, before.ego, after.ego, false],
    [labels.fame, before.fame, after.fame, false],
  ];
  const lines: ReceiptLine[] = [];
  meters.forEach(([label, b, a, lowerIsBetter]) => {
    const delta = a - b;
    if (delta !== 0) {
      lines.push({
        text: `${label} ${delta > 0 ? '+' : ''}${delta}`,
        good: lowerIsBetter ? delta < 0 : delta > 0,
      });
    }
  });
  return lines;
}

// A small receipt for every off-season action: what moved, and by how much
export function receiptLines(
  before: CharacterCareerState | null,
  after: CharacterCareerState | null,
  moneyDelta = 0,
): ReceiptLine[] {
  const lines: ReceiptLine[] = [];
  if (before && after) {
    lines.push(...meterDeltaLines(before, after));
    const skills: [
      string,
      CharacterCareerState['livesCap'],
      CharacterCareerState['livesCap'],
    ][] = [
      [CAREER.trainings.stomach.name, before.livesCap, after.livesCap],
      [CAREER.trainings.sniffer.name, before.njuh, after.njuh],
      [CAREER.trainings.nutrition.name, before.nutrition, after.nutrition],
      [CAREER.trainings.fans.name, before.fanSkill, after.fanSkill],
    ];
    skills.forEach(([name, b, a]) => {
      if (a.level !== b.level) {
        const up = a.level > b.level;
        lines.push({
          text: fmt(
            up ? CAREER.toast.skillLevelUp : CAREER.toast.skillLevelDown,
            {
              name,
            },
          ),
          good: up,
        });
      } else if (a.progress !== b.progress) {
        lines.push({
          text: fmt(CAREER.toast.skillProgress, { name }),
          good: a.progress > b.progress,
        });
      }
    });
  }
  if (moneyDelta > 0)
    lines.push({
      text: plural(CAREER.toast.moneyUp, moneyDelta, { n: moneyDelta }),
      good: true,
    });
  if (moneyDelta < 0)
    lines.push({
      text: plural(CAREER.toast.moneyDown, moneyDelta, { n: -moneyDelta }),
      good: false,
    });
  return lines;
}

import ActionIcon, { type ActionIconKind } from '@/components/icons/ActionIcon';
import Icon from '@/components/icons/Icon';
import PortraitHead from '@/components/games/PortraitHead';
import PaperSection from '@/components/games/career/PaperSection';
import CoachTag from '@/components/games/career-mp/CoachTag';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { IconName } from '@/lib/constants/icons';
import type { CoachTagMap } from '@/lib/types/careerMp';
import { h2hFor } from '@/lib/utils/careerMatch';
import type { CharacterCareerState, SavedCareer } from '@/lib/utils/careerSave';
import { fmt, plural } from '@/lib/utils/format';

const R = GAMES_UI.career.report;
const MIN_MATCHES_FOR_RATE = 8;

type AwardKey = keyof typeof R.awards;
type Award = { key: AwardKey; slug: string; value: string };
type Glyph = { icon?: IconName; action?: ActionIconKind };
const AWARD_ICONS: Record<AwardKey, Glyph> = {
  titles: { icon: 'trophy' },
  streak: { icon: 'repeat' },
  winRate: { icon: 'swords' },
  eaten: { icon: 'hotdog' },
  fame: { icon: 'star' },
  money: { action: 'invest' },
  punished: { action: 'sabotage' },
  meltdowns: { icon: 'bolt' },
  forfeits: { action: 'rest' },
  nemesis: { icon: 'swords' },
  victim: { icon: 'check' },
};

export function winRate(ch: CharacterCareerState): number {
  const played = ch.wins + ch.losses;
  return played > 0 ? ch.wins / played : 0;
}

function best(slugs: string[], score: (slug: string) => number): string | null {
  let top: string | null = null;
  let topScore = 0;
  for (const slug of slugs) {
    const s = score(slug);
    if (s > topScore) {
      top = slug;
      topScore = s;
    }
  }
  return top;
}

// Who stood out at what across the campaign, read off the final state and
// the cups themselves; the reader's own awards are shaded
export default function CampaignAwards({
  career,
  characterBySlug,
  order,
  coaches,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  order: string[];
  coaches?: CoachTagMap;
}) {
  const playerSlug = career.playerSlug;
  const st = (slug: string) => career.characters[slug];
  const moneyOf = (slug: string) =>
    slug === playerSlug ? career.balance : (st(slug).money ?? 0);
  const vsPlayer = (slug: string) => h2hFor(career.h2h, playerSlug, slug);
  const history = career.standingsHistory;
  const others = order.filter((slug) => slug !== playerSlug);

  const awards: Award[] = [];
  const push = (
    key: AwardKey,
    slug: string | null,
    value: (ch: CharacterCareerState, slug: string) => string,
  ) => {
    if (slug) awards.push({ key, slug, value: value(st(slug), slug) });
  };
  push(
    'titles',
    best(order, (s) => st(s).titles),
    (ch) => fmt(R.awardValues.titles, { n: ch.titles }),
  );
  // The longest run of titles anyone put together, read off the cups
  // themselves; a save without history falls back to the streak it ended on
  const longestStreak = (slug: string) => {
    if (history.length === 0) return st(slug).titleStreak;
    let longest = 0;
    let run = 0;
    history.forEach((record) => {
      run = record.champion === slug ? run + 1 : 0;
      longest = Math.max(longest, run);
    });
    return longest;
  };
  push(
    'streak',
    best(order, (s) => (longestStreak(s) >= 2 ? longestStreak(s) : 0)),
    (_, slug) => fmt(R.awardValues.streak, { n: longestStreak(slug) }),
  );
  push(
    'winRate',
    best(order, (s) =>
      st(s).wins + st(s).losses >= MIN_MATCHES_FOR_RATE ? winRate(st(s)) : 0,
    ),
    (ch) =>
      fmt(R.awardValues.winRate, {
        pct: Math.round(winRate(ch) * 100),
        w: ch.wins,
        l: ch.losses,
      }),
  );
  push(
    'eaten',
    best(order, (s) => st(s).eaten ?? 0),
    (ch) => fmt(R.awardValues.eaten, { n: ch.eaten ?? 0 }),
  );
  push(
    'fame',
    best(order, (s) => st(s).fame),
    (ch) => fmt(R.awardValues.fame, { n: Math.round(ch.fame) }),
  );
  push('money', best(order, moneyOf), (_, slug) =>
    plural(R.awardValues.money, moneyOf(slug), { n: moneyOf(slug) }),
  );
  push(
    'punished',
    best(order, (s) => st(s).punishments ?? 0),
    (ch) => fmt(R.awardValues.punished, { n: ch.punishments ?? 0 }),
  );
  push(
    'meltdowns',
    best(order, (s) => st(s).meltdowns),
    (ch) => fmt(R.awardValues.meltdowns, { n: ch.meltdowns }),
  );
  push(
    'forfeits',
    best(order, (s) => st(s).forfeits + st(s).withdrawals),
    (ch) => fmt(R.awardValues.forfeits, { n: ch.forfeits + ch.withdrawals }),
  );
  push(
    'nemesis',
    best(others, (s) => vsPlayer(s)?.[1] ?? 0),
    (_, slug) => {
      const [w, l] = vsPlayer(slug) ?? [0, 0];
      return fmt(R.awardValues.nemesis, { w: l, l: w });
    },
  );
  const nemesis = awards.find((a) => a.key === 'nemesis')?.slug;
  const preyPool = others.filter((s) => s !== nemesis);
  push(
    'victim',
    best(preyPool, (s) => vsPlayer(s)?.[0] ?? 0),
    (_, slug) => {
      const [w, l] = vsPlayer(slug) ?? [0, 0];
      return fmt(R.awardValues.victim, { w, l });
    },
  );

  return (
    <PaperSection title={R.awardsTitle} icon="star">
      <div className="grid w-full gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {awards.map((award) => {
          const character = characterBySlug.get(award.slug);
          if (!character) return null;
          const mine = award.slug === playerSlug;
          const glyph = AWARD_ICONS[award.key];
          const coach = coaches?.[award.slug];
          return (
            <div
              key={award.key}
              className={`flex items-center gap-3 border-b border-slate-900/20 pb-2.5 ${
                mine ? 'bg-red-700/5' : ''
              }`}
            >
              <PortraitHead
                character={character}
                className="h-11 w-11 shrink-0 rounded-sm ring-1 ring-slate-900/30"
              />
              <span className="flex min-w-0 flex-col">
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase leading-tight tracking-[0.2em] text-red-800">
                  {glyph.icon && (
                    <Icon name={glyph.icon} className="h-3 w-3 shrink-0" />
                  )}
                  {glyph.action && (
                    <ActionIcon
                      kind={glyph.action}
                      className="h-3 w-3 shrink-0"
                    />
                  )}
                  {R.awards[award.key]}
                </span>
                <span className="flex items-center gap-1.5 truncate text-sm font-black uppercase leading-tight">
                  {character.name}
                  {coach ? (
                    <CoachTag name={coach.name} color={coach.color} onPaper />
                  ) : (
                    mine && (
                      <span className="shrink-0 rounded-sm bg-red-700 px-1 text-[8px] font-black uppercase tracking-widest text-amber-50">
                        {R.you}
                      </span>
                    )
                  )}
                </span>
                <span className="truncate text-[11px] italic text-slate-600">
                  {award.value}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </PaperSection>
  );
}

import { useEffect, type ReactNode } from 'react';
import Icon from '@/components/icons/Icon';
import PortraitHead from '@/components/games/PortraitHead';
import CoachTag from '@/components/games/career-mp/CoachTag';
import type { CoachTagMap } from '@/lib/types/careerMp';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import type { MatchTape, TapeBadge } from '@/lib/utils/matchTape';
import { fmt, ordinal } from '@/lib/utils/format';
import { characterEpithet } from '@/lib/utils/localeNames';

const B = GAMES_UI.career.broadcast;

const ROW_DELAYS = [
  '[animation-delay:120ms]',
  '[animation-delay:180ms]',
  '[animation-delay:240ms]',
  '[animation-delay:300ms]',
  '[animation-delay:360ms]',
  '[animation-delay:420ms]',
  '[animation-delay:480ms]',
  '[animation-delay:540ms]',
  '[animation-delay:600ms]',
  '[animation-delay:660ms]',
  '[animation-delay:720ms]',
  '[animation-delay:780ms]',
  '[animation-delay:840ms]',
];

// The left share of a 100% tug-of-war track, in twelfths so the widths stay
// static Tailwind classes
const BAR_STEPS = [
  'w-0',
  'w-1/12',
  'w-2/12',
  'w-3/12',
  'w-4/12',
  'w-5/12',
  'w-6/12',
  'w-7/12',
  'w-8/12',
  'w-9/12',
  'w-10/12',
  'w-11/12',
  'w-full',
];

const BADGE_TONES: Record<TapeBadge, string> = {
  inForm: 'border-green-300/40 text-green-300',
  rival: 'border-red-400/50 text-red-300',
  titleHolder: 'border-sky-200/40 text-sky-200',
};

function BadgeStrip({ badges }: { badges: TapeBadge[] }) {
  if (!badges.length) return null;
  return (
    <span className="flex flex-wrap justify-center gap-1">
      {badges.map((badge) => (
        <span
          key={badge}
          className={`rounded-full border px-1.5 py-px text-[7px] font-bold uppercase tracking-[0.14em] ${BADGE_TONES[badge]}`}
        >
          {B.badges[badge]}
        </span>
      ))}
    </span>
  );
}

function FormDots({ results }: { results: ('w' | 'l')[] }) {
  return (
    <span className="inline-flex gap-1 align-middle">
      {results.map((r, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${r === 'w' ? 'bg-green-400' : 'bg-red-900'}`}
        />
      ))}
    </span>
  );
}

function SideCard({
  character,
  side,
  reverse,
  coach = null,
}: {
  character: DuelCharacter;
  side: MatchTape['a'] | null;
  reverse?: boolean;
  coach?: CoachTagMap[string] | null;
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-center gap-1 ${reverse ? 'sm:items-start' : 'sm:items-end'}`}
    >
      <PortraitHead character={character} className="h-12 w-12 sm:h-14 sm:w-14" />
      <span
        className={`flex max-w-full items-center gap-1.5 ${reverse ? 'flex-row-reverse sm:flex-row' : ''}`}
      >
        <p className="min-w-0 truncate text-sm font-bold text-white">{character.name}</p>
        {coach && (
          <CoachTag name={coach.name} color={coach.color} connected={coach.connected} />
        )}
      </span>
      <span
        className={`h-0.5 w-10 rounded-full ${reverse ? 'bg-gradient-to-l from-red-400/80 to-rose-300/50' : 'bg-gradient-to-r from-cyan-300/50 to-sky-400/80'}`}
      />
      <p
        className={`max-w-full truncate text-[8px] font-semibold uppercase tracking-widest text-slate-400 ${reverse ? 'sm:text-left' : 'sm:text-right'}`}
      >
        {characterEpithet(character.slug)}
      </p>
      {side?.seed != null && (
        <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">
          {fmt(B.seed, { seed: ordinal(side.seed) })}
        </p>
      )}
      {side && <BadgeStrip badges={side.badges} />}
    </div>
  );
}

// Score-style facts live above the divider; the bar table below compares
// magnitudes only
type HeadlineRow = { label: string; left: ReactNode; right: ReactNode };
type BarRow = {
  label: string;
  emoji: string;
  left: string;
  right: string;
  share: number;
};

function paceOf(ch: CharacterCareerState): number | null {
  const matches = ch.wins + ch.losses;
  if (!matches || !ch.turnsPlayed) return null;
  return ch.turnsPlayed / matches;
}

function delayAt(i: number): string {
  return ROW_DELAYS[Math.min(i, ROW_DELAYS.length - 1)];
}

// The pre-match tale of the tape, a full-screen card over the broadcast
// while the commentator reads the match intro, football-broadcast style.
// Rows land one by one
export default function MatchIntroOverlay({
  a,
  b,
  moodA,
  moodB,
  tape = null,
  onClose,
  footer,
  inline = false,
  coachA = null,
  coachB = null,
}: {
  a: DuelCharacter;
  b: DuelCharacter;
  moodA: CharacterCareerState | null;
  moodB: CharacterCareerState | null;
  tape?: MatchTape | null;
  // Present when the coach opened the tape mid-match; clicking closes it
  onClose?: () => void;
  // Controls pinned under the tape while the pre-match hold is on
  footer?: ReactNode;
  // The card on its own, inside a screen, instead of over everything
  inline?: boolean;
  // A shared league: the coach behind each side
  coachA?: CoachTagMap[string] | null;
  coachB?: CoachTagMap[string] | null;
}) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const headline: HeadlineRow[] = [];
  if (moodA && moodB) {
    headline.push({
      label: B.record,
      left: `${moodA.wins}-${moodA.losses}`,
      right: `${moodB.wins}-${moodB.losses}`,
    });
    if (tape && (tape.a.edition || tape.b.edition)) {
      const record = (edition: [number, number] | null) =>
        edition ? `${edition[0]}-${edition[1]}` : '-';
      headline.push({
        label: B.edition,
        left: record(tape.a.edition),
        right: record(tape.b.edition),
      });
    }
    if (moodA.recentResults?.length || moodB.recentResults?.length) {
      headline.push({
        label: B.form,
        left: <FormDots results={moodA.recentResults ?? []} />,
        right: <FormDots results={moodB.recentResults ?? []} />,
      });
    }
  }

  const bars: BarRow[] = [];
  const shareOf = (left: number, right: number) =>
    left + right > 0 ? left / (left + right) : 0.5;
  const pushBar = (
    label: string,
    emoji: string,
    left: number,
    right: number,
    show: (v: number) => string = String,
  ) => {
    if (!left && !right) return;
    bars.push({
      label,
      emoji,
      left: show(left),
      right: show(right),
      share: shareOf(left, right),
    });
  };

  if (tape?.a.winPct != null && tape.b.winPct != null) {
    bars.push({
      label: B.chance,
      emoji: '🎲',
      left: `${tape.a.winPct}%`,
      right: `${tape.b.winPct}%`,
      share: tape.a.winPct / 100,
    });
  }
  if (moodA && moodB) {
    if (tape?.h2h) pushBar(B.h2h, '⚔️', tape.h2h[0], tape.h2h[1]);
    pushBar(B.titles, '🏆', moodA.titles, moodB.titles);
    pushBar(B.meltdowns, '🤯', moodA.meltdowns, moodB.meltdowns);
    pushBar(B.punishments, '⚖️', moodA.punishments ?? 0, moodB.punishments ?? 0);
    pushBar(
      B.forfeits,
      '🏳️',
      moodA.forfeits + moodA.withdrawals,
      moodB.forfeits + moodB.withdrawals,
    );
    pushBar(B.eaten, '🌭', moodA.eaten ?? 0, moodB.eaten ?? 0);
    const paceA = paceOf(moodA);
    const paceB = paceOf(moodB);
    if (paceA || paceB) {
      pushBar(B.pace, '⏱️', paceA ?? 0, paceB ?? 0, (v) => (v ? v.toFixed(1) : '-'));
    }
    pushBar(B.tiebreaks, '💀', moodA.tiebreaks ?? 0, moodB.tiebreaks ?? 0);
  }

  const card = (
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-md cursor-default flex-col items-center gap-2.5 overflow-y-auto rounded-2xl border border-frost-border/40 bg-slate-950/95 px-4 py-4 shadow-2xl sm:max-w-lg sm:px-6"
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={GAMES_UI.shared.close}
            className="absolute right-3 top-3 z-10 rounded-full border border-sky-200/15 bg-slate-800/60 p-1.5 text-slate-400 transition hover:border-sky-200/40 hover:text-white"
          >
            <Icon name="close" className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="flex w-full items-start justify-center gap-3">
          <SideCard character={a} side={tape?.a ?? null} coach={coachA} />
          <span className="mt-3 shrink-0 bg-gradient-to-br from-sky-300 to-red-300 bg-clip-text text-lg font-black italic uppercase text-transparent">
            vs
          </span>
          <SideCard character={b} side={tape?.b ?? null} reverse coach={coachB} />
        </div>
        {headline.length > 0 && (
          <div className="flex w-full flex-col gap-1">
            {headline.map((row, i) => (
              <div
                key={row.label}
                className={`flex w-full items-center gap-2 opacity-0 animate-[bubblein_0.3s_ease-out_forwards] ${delayAt(i)}`}
              >
                <span className="flex flex-1 items-center justify-end text-[11px] font-semibold text-slate-100 [font-variant-numeric:tabular-nums]">
                  {row.left}
                </span>
                <span className="w-24 shrink-0 text-center text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {row.label}
                </span>
                <span className="flex flex-1 items-center justify-start text-[11px] font-semibold text-slate-100 [font-variant-numeric:tabular-nums]">
                  {row.right}
                </span>
              </div>
            ))}
          </div>
        )}
        {bars.length > 0 && (
          <div className="flex w-full flex-col gap-1.5 border-t border-frost-border/20 pt-2">
            {bars.map((row, i) => (
              <div
                key={row.label}
                className={`flex w-full items-center gap-2 opacity-0 animate-[bubblein_0.3s_ease-out_forwards] ${delayAt(i + headline.length)}`}
              >
                <span className="w-11 shrink-0 text-right text-[11px] font-semibold text-slate-100 [font-variant-numeric:tabular-nums]">
                  {row.left}
                </span>
                <div className="flex min-w-0 flex-1 flex-col items-center gap-[3px]">
                  <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    <span className="mr-1">{row.emoji}</span>
                    {row.label}
                  </span>
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-800/70">
                    <div
                      className={`h-full shrink-0 rounded-l-full bg-gradient-to-r from-sky-400/90 to-cyan-300/90 ${BAR_STEPS[Math.round(row.share * (BAR_STEPS.length - 1))]}`}
                    />
                    <div className="h-full flex-1 rounded-r-full bg-gradient-to-r from-rose-300/90 to-red-400/90" />
                  </div>
                </div>
                <span className="w-11 shrink-0 text-left text-[11px] font-semibold text-slate-100 [font-variant-numeric:tabular-nums]">
                  {row.right}
                </span>
              </div>
            ))}
          </div>
        )}
        {footer && <div className="w-full pt-1">{footer}</div>}
      </div>
  );
  if (inline) return card;
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-md animate-[bubblein_0.3s_ease-out] ${onClose ? 'cursor-pointer' : ''}`}
    >
      {card}
    </div>
  );
}

'use client';

import { useState } from 'react';
import CareerToggle, {
  type CareerToggleTone,
} from '@/components/games/career/CareerToggle';
import CareerButton from '@/components/games/career/CareerButton';
import GlizzflationBetSlip from '@/components/games/career/GlizzflationBetSlip';
import GlizzflationBetTicketLine from '@/components/games/career/GlizzflationBetTicketLine';
import PortraitHead from '@/components/games/PortraitHead';
import TrendIcon from '@/components/icons/TrendIcon';
import SeatTag from '@/components/games/rooms/SeatTag';
import {
  GLIZZY_BET_PAYOUTS,
  GLIZZY_BET_STAKES,
  GLIZZY_CALLS,
  type GlizzyBet,
  type GlizzyBetResult,
  type GlizzyCall,
} from '@/data/games/careerGlizzflationBets';
import { GAMES_UI } from '@/data/games/locale';
import type { CoachColor } from '@/lib/constants/careerMp';
import {
  glizzyBetMultiplier,
  glizzyCallOf,
  glizzyMarketOpen,
} from '@/lib/utils/careerGlizzflationBets';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { characterBySlug } from '@/lib/utils/duelCharacters';
import { fmt } from '@/lib/utils/format';

const B = GAMES_UI.career.offseason.glizzflationBet;

export type GlizzyBetTicket = {
  coachId: string;
  name: string;
  color: CoachColor;
  slug: string;
  bet: GlizzyBet | null;
  last: GlizzyBetResult | null;
};

// Up is red here as on the chart: up means everything costs more
const CALL_TONE: Record<GlizzyCall, CareerToggleTone> = {
  up: 'red',
  flat: 'sky',
  down: 'emerald',
};
const STORY_LABEL: Record<GlizzyCall, string> = {
  up: B.storyUp,
  flat: B.storyFlat,
  down: B.storyDown,
};
const EYEBROW =
  'font-sign text-[13px] font-bold uppercase leading-tight tracking-[0.07em] text-slate-400';
const RULE = 'border-t border-dashed border-[#1c1408]/40';
const MULTIPLIER_STAMP =
  'rounded-[2px] border border-amber-300 px-1 font-sign text-[13px] font-bold leading-tight tabular-nums text-amber-300';

function storyLabel(pct: number): string {
  return fmt(STORY_LABEL[glizzyCallOf(pct)], { pct: Math.abs(pct) });
}

function netLabel(result: GlizzyBetResult): string {
  return result.payout > 0
    ? `+${result.payout - result.stake}`
    : `−${result.stake}`;
}

function netTone(result: GlizzyBetResult): string {
  return result.payout > 0 ? 'text-emerald-300' : 'text-red-300';
}

export default function GlizzflationBetDesk({
  career,
  onBet,
  onCancelBet,
  otherBets = [],
}: {
  career: SavedCareer;
  onBet: (call: GlizzyCall, stake: number) => void;
  onCancelBet: () => void;
  otherBets?: GlizzyBetTicket[];
}) {
  const ticket = career.glizzyBet ?? null;
  const last = career.lastGlizzyBet ?? null;
  const unlocked = glizzyMarketOpen(career);
  const open = unlocked && career.phase === 'offseason';
  const wallet = career.balance + (ticket?.stake ?? 0);
  const [call, setCall] = useState<GlizzyCall>(() => ticket?.call ?? 'up');
  const [picked, setStake] = useState(
    () => ticket?.stake ?? GLIZZY_BET_STAKES[0],
  );
  // A wallet that shrank since the pick drops the stake to what it covers
  const stake =
    wallet >= picked
      ? picked
      : [...GLIZZY_BET_STAKES].reverse().find((value) => wallet >= value) ?? picked;
  const affordable = wallet >= stake;
  const [winsBefore, winsAfter] = B.wins.split('{amount}');

  return (
    <div className="flex flex-col gap-2.5">
      {open && wallet < GLIZZY_BET_STAKES[0] ? (
        <GlizzflationBetSlip className="font-serif text-[13px] text-slate-300">
          {fmt(B.minStake, { min: GLIZZY_BET_STAKES[0] })}
        </GlizzflationBetSlip>
      ) : open ? (
        <GlizzflationBetSlip className="flex flex-col gap-2.5">
          <div role="radiogroup" className="grid grid-cols-3 gap-1.5">
            {GLIZZY_CALLS.map((id) => {
              const active = call === id;
              return (
                <CareerToggle
                  selected={active}
                  tone={CALL_TONE[id]}
                  key={id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setCall(id)}
                  className="flex flex-col items-center gap-1 py-2"
                >
                  <TrendIcon
                    direction={id}
                    className={`h-5 w-5 ${active ? '' : 'opacity-60'}`}
                  />
                  <span className="font-sign text-[13px] font-bold uppercase leading-none tracking-[0.05em]">
                    {B[id]}
                  </span>
                  <span className="font-sign text-[24px] font-bold leading-none tabular-nums">
                    {fmt(B.multiplier, { x: GLIZZY_BET_PAYOUTS[id] })}
                  </span>
                </CareerToggle>
              );
            })}
          </div>

          <div className={`flex flex-col gap-1.5 pt-2 ${RULE}`}>
            <span className={EYEBROW}>{B.stakeLabel}</span>
            <div role="radiogroup" className="grid grid-cols-5 gap-1">
              {GLIZZY_BET_STAKES.map((value) => {
                const active = stake === value;
                return (
                  <CareerToggle
                    selected={active}
                    tone="amber"
                    size="sm"
                    key={value}
                    role="radio"
                    aria-checked={active}
                    disabled={wallet < value}
                    onClick={() => setStake(value)}
                    className="min-h-11 font-sign text-[17px] tabular-nums"
                  >
                    {value}
                  </CareerToggle>
                );
              })}
            </div>
          </div>

          <div className={`flex items-center justify-between gap-3 pt-2 ${RULE}`}>
            <p className="font-serif text-[13px] font-bold text-slate-200">
              {winsBefore}
              <span className="font-sign text-[28px] font-bold leading-none tabular-nums text-amber-300">
                {Math.round(stake * GLIZZY_BET_PAYOUTS[call])}
              </span>
              {winsAfter}
            </p>
            <CareerButton
              tone="buy"
              disabled={!affordable}
              className="min-h-11 shrink-0"
              onClick={() => onBet(call, stake)}
            >
              {!affordable
                ? B.noFunds
                : ticket
                  ? B.replace
                  : fmt(B.place, { stake })}
            </CareerButton>
          </div>
        </GlizzflationBetSlip>
      ) : (
        <GlizzflationBetSlip className="font-serif text-[13px] text-slate-300">
          {unlocked ? B.closed : B.locked}
        </GlizzflationBetSlip>
      )}

      {ticket && (
        <GlizzflationBetSlip className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className={EYEBROW}>{B.ticket}</span>
            <GlizzflationBetTicketLine bet={ticket} className="text-[18px]" />
          </div>
          {open && (
            <CareerButton
              tone="quiet"
              className="min-h-11 shrink-0"
              onClick={onCancelBet}
            >
              {B.cancel}
            </CareerButton>
          )}
        </GlizzflationBetSlip>
      )}

      {last && (
        <GlizzflationBetSlip className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className={EYEBROW}>{B.last}</span>
            <GlizzflationBetTicketLine bet={last} className="text-[18px]" />
            <span className="flex items-center gap-1.5 font-serif text-[12.5px] text-slate-300">
              <TrendIcon
                direction={glizzyCallOf(last.actualPct)}
                className="h-3 w-3 shrink-0"
              />
              {fmt(B.lastStory, { actual: storyLabel(last.actualPct) })}
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={`-rotate-3 rounded-[3px] border-2 border-current px-1.5 font-sign text-[26px] font-extrabold leading-none tabular-nums ${netTone(last)}`}
            >
              {netLabel(last)}
            </span>
            {last.payout > 0 && (
              <span className={MULTIPLIER_STAMP}>
                {fmt(B.multiplier, {
                  x: glizzyBetMultiplier(last.call, last.actualPct),
                })}
              </span>
            )}
          </div>
        </GlizzflationBetSlip>
      )}

      {otherBets.length > 0 && (
        <GlizzflationBetSlip className="flex flex-col gap-1.5">
          <span className={EYEBROW}>{B.others}</span>
          {otherBets.every((row) => !row.bet && !row.last) ? (
            <span className="font-serif text-[12.5px] italic text-slate-400">
              {B.othersNone}
            </span>
          ) : (
            <ul className="flex flex-col">
              {otherBets.map((row) => (
                <li
                  key={row.coachId}
                  className="flex items-center gap-2 border-b border-[#7d93a8]/35 py-1 last:border-b-0"
                >
                  <PortraitHead
                    character={characterBySlug(row.slug)}
                    className="h-6 w-6 shrink-0"
                  />
                  <SeatTag name={row.name} color={row.color} onPaper />
                  {row.bet ? (
                    <GlizzflationBetTicketLine
                      bet={row.bet}
                      className="min-w-0 flex-1 truncate text-[15px]"
                    />
                  ) : (
                    <span className="min-w-0 flex-1 truncate font-serif text-[12.5px] italic text-slate-400">
                      {B.otherNoTicket}
                    </span>
                  )}
                  {row.last && (
                    <span
                      className={`shrink-0 font-sign text-[16px] font-bold tabular-nums ${netTone(row.last)}`}
                    >
                      {netLabel(row.last)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </GlizzflationBetSlip>
      )}
    </div>
  );
}

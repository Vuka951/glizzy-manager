'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import LawQuorumRow from '@/components/games/career/LawQuorumRow';
import LawStamp from '@/components/games/career/LawStamp';
import LawStruckBill from '@/components/games/career/LawStruckBill';
import LawVoteChamber from '@/components/games/career/LawVoteChamber';
import LawVoteToken from '@/components/games/career/LawVoteToken';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import TelevisionSet from '@/components/games/career/TelevisionSet';
import { LAW_PARTNER_PASS_SHARE } from '@/data/games/careerLaws';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { electionNightSounds } from '@/lib/constants/cutsceneSounds';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import {
  lawName,
  lawPassShare,
  lawQuorums,
  lawVerdict,
  pickedCard,
  quorumMet,
  type LawBallot,
} from '@/lib/utils/careerLaws';
import { countOrder } from '@/lib/utils/careerParliamentVote';
import type { SponsorId } from '@/lib/utils/careerSave';
import { playCutsceneClip } from '@/lib/utils/cutsceneSounds';
import { fmt } from '@/lib/utils/format';
import {
  playBooSound,
  playCheerSound,
  playPlaceSound,
} from '@/lib/utils/gameSounds';

const LAWS = GAMES_UI.career.laws;
const BALLOT = LAWS.ballot;
const VOTE = LAWS.vote;
const VERDICTS = VOTE.verdicts as Record<string, string>;
const SHORT_NAMES = GAMES_UI.career.sponsors.shortNames as Record<
  SponsorId,
  string
>;

const TOKEN_FLOW =
  'flex flex-wrap content-start items-end gap-x-3.5 gap-y-4 sm:gap-x-4';

const threshold = (share: number) =>
  fmt(BALLOT.threshold, { share: Math.round(share * 100) });

// About a second a voice, quicker for a long roll so the count stays short
const SLOT_MS = 1000;
const MIN_SLOT_MS = 450;
const COUNT_MS = 7000;
const INTRO_MS = 900;
// The drum roll between the last voice and the stamp, then the strike
// through any law the new one pushes off the books
const ROLL_AFTER_MS = 250;
const STAMP_AFTER_MS = 1400;
const STRIKE_AFTER_MS = 800;

// The law vote read out in the chamber once it is closed: the bill on the
// table, every governing coach's voice landing on its side of the board one
// at a time with the government's benches turning green or red behind them,
// the weighted tally on a bar with its three-quarter post and, in a
// coalition, the junior partners' own bar with its half post, then the
// stamp. A passed law that pushes another off the books strikes it last. The roll is fixed when
// the vote closes, so a shared room watches the same count. Every voice and
// the verdict are known up front, so the boards and the footer hold their
// final size from the first frame and nothing moves while the count runs
export default function LawVoteCutscene({
  ballot,
  seats,
  characterBySlug,
  viewerSlug,
  onClose,
}: {
  // A closed vote
  ballot: LawBallot;
  seats: Record<SponsorId, number>;
  characterBySlug: Map<string, DuelCharacter>;
  viewerSlug?: string;
  onClose: () => void;
}) {
  const [count] = useState(() => {
    const order = countOrder(
      ballot.ballots,
      ballot.outcome === 'passed' ? 'yes' : 'no',
    );
    const slot = Math.max(
      MIN_SLOT_MS,
      Math.min(SLOT_MS, Math.round(COUNT_MS / Math.max(1, order.length))),
    );
    return { order, slot };
  });
  const { order, slot } = count;
  const [landed, setLanded] = useState(0);
  const [settled, setSettled] = useState(false);
  const [struck, setStruck] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);
  const rollRef = useRef<HTMLAudioElement | null>(null);

  const card = pickedCard(ballot);
  const verdict = lawVerdict(ballot) ?? 'failed';
  const conflicts = (ballot.repealed ?? []).filter(
    (id) => card?.action === 'constitution' || id !== card?.law,
  );
  const leader = ballot.government[0];
  const theme = SPONSOR_THEMES[leader];

  const stamp = useCallback(() => {
    rollRef.current?.pause();
    setSettled(true);
    playCutsceneClip('stamp-thud', electionNightSounds.stamp);
    if (verdict === 'failed') {
      playBooSound(0.6);
      return;
    }
    playCutsceneClip('cymbal-crash', electionNightSounds.crash);
    playCheerSound(0.7);
  }, [verdict]);

  const strike = useCallback(() => {
    setStruck(true);
    playCutsceneClip('pen-scribble', electionNightSounds.ballotSlide);
  }, []);

  useEffect(() => {
    if (skipped) return;
    const timers: number[] = [];
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) {
      timers.push(
        window.setTimeout(() => {
          setLanded(order.length);
          stamp();
          setStruck(true);
        }, INTRO_MS),
      );
      return () => timers.forEach((id) => window.clearTimeout(id));
    }
    order.forEach((b, i) => {
      timers.push(
        window.setTimeout(
          () => {
            setLanded(i + 1);
            playCutsceneClip('seat-tick', electionNightSounds.seatTick);
            if (!b.human) return;
            playPlaceSound(electionNightSounds.ballotStack);
            barRef.current?.animate(
              [
                { transform: 'translateX(0)' },
                { transform: 'translateX(-5px)' },
                { transform: 'translateX(4px)' },
                { transform: 'translateX(0)' },
              ],
              { duration: 280, easing: 'ease-out' },
            );
          },
          INTRO_MS + i * slot,
        ),
      );
    });
    const last = INTRO_MS + Math.max(0, order.length - 1) * slot;
    timers.push(
      window.setTimeout(() => {
        rollRef.current = playCutsceneClip(
          'drum-roll',
          electionNightSounds.roll,
        );
      }, last + ROLL_AFTER_MS),
      window.setTimeout(stamp, last + STAMP_AFTER_MS),
    );
    if (conflicts.length > 0) {
      timers.push(
        window.setTimeout(strike, last + STAMP_AFTER_MS + STRIKE_AFTER_MS),
      );
    }
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      rollRef.current?.pause();
    };
  }, [order, slot, skipped, stamp, strike, conflicts.length]);

  const skip = useCallback(() => {
    setSkipped(true);
    setLanded(order.length);
    setStruck(true);
    if (!settled) stamp();
  }, [order.length, settled, stamp]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && event.key !== 'Enter') return;
      if (settled) onClose();
      else skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settled, onClose, skip]);

  const shown = order.slice(0, landed);
  const weightOf = (side: 'yes' | 'no', slugs?: Set<string>) =>
    shown
      .filter((b) => b.choice === side && (!slugs || slugs.has(b.slug)))
      .reduce((sum, b) => sum + b.weight, 0);
  const yes = weightOf('yes');
  const no = weightOf('no');
  const quorums = lawQuorums(ballot);
  const total = quorums.chamber.total;
  const partnerSlugs = new Set(ballot.partners ?? []);
  const partnerParties = ballot.government.slice(1);
  const result = (met: boolean) => (settled ? (met ? 'met' : 'missed') : null);
  const repeal = card?.action === 'repeal';
  const constitution = card?.action === 'constitution';
  const party = card?.action === 'constitution' ? card.party : leader;
  const title = !card
    ? ''
    : card.action === 'constitution'
      ? BALLOT.constitutionName
      : lawName(card.law);
  const verdictLine = card
    ? fmt(VERDICTS[`${card.action}-${ballot.outcome}`] ?? '', { law: title })
    : '';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-1 sm:p-3">
      <button
        aria-label={VOTE.continue}
        onClick={settled ? onClose : undefined}
        className="absolute inset-0 cursor-default bg-[#060912]/75"
      />
      <TelevisionSet
        live={VOTE.live}
        channel={`${VOTE.title} · ${VOTE.subtitle}`}
        className="z-10 max-h-[calc(94dvh/var(--game-zoom,1))] w-full max-w-[37.375rem] text-left animate-[bubblein_0.25s_ease-out]"
        controls={
          <>
            {!settled && (
              <CareerButton className="min-h-11 shrink-0" onClick={skip}>
                {VOTE.skip}
              </CareerButton>
            )}
            <CareerButton
              full
              disabled={!settled}
              className="min-h-11"
              onClick={onClose}
            >
              {VOTE.continue}
            </CareerButton>
          </>
        }
      >
        {card && (
          <div
            className={`flex shrink-0 items-center gap-3 px-4 py-2.5 ${theme.headerWash}`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-amber-50 shadow-[2px_2px_0_rgb(2_6_23/0.5)]">
              <SponsorEmblem sponsorId={party} className="h-7 w-7" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span
                className={`font-sign text-[13px] font-bold uppercase leading-tight tracking-[0.1em] ${
                  repeal || constitution ? 'text-red-300' : 'text-sky-200'
                }`}
              >
                {constitution
                  ? BALLOT.constitution
                  : repeal
                    ? BALLOT.repeal
                    : BALLOT.pass}{' '}
                · {SHORT_NAMES[party]}
              </span>
              <span className="relative self-start text-base font-black leading-tight text-white sm:text-lg">
                {title}
                {repeal && (
                  <span
                    className={`absolute inset-x-[-3px] top-1/2 h-[3px] origin-left -translate-y-1/2 -rotate-2 rounded-full bg-red-500 transition-transform duration-500 ${
                      settled && verdict === 'repealed' ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                )}
              </span>
            </span>
          </div>
        )}

        <div
          className={`relative flex min-h-0 flex-col gap-3 overflow-y-auto px-3 pb-4 pt-3 sm:px-5 ${theme.wash}`}
        >
          <div className="relative mx-auto w-full max-w-md">
            <LawVoteChamber
              seats={seats}
              government={ballot.government}
              yes={yes}
              no={no}
              total={total}
              className="max-h-40 sm:max-h-44"
            />
            {settled && (
              <div className="absolute inset-x-0 bottom-[8%] z-20 flex justify-center">
                <LawStamp
                  verdict={verdict}
                  text={VOTE.stamps[verdict]}
                  size="lg"
                  slam={!skipped}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <LawQuorumRow
              parties={ballot.government}
              label={BALLOT.government}
              yes={yes}
              no={no}
              total={total}
              needed={quorums.chamber.needed}
              threshold={threshold(lawPassShare(ballot))}
              result={result(quorumMet(quorums.chamber))}
              tally
              barRef={barRef}
            />
            {quorums.partners && (
              <LawQuorumRow
                parties={partnerParties}
                label={partnerParties.map((id) => SHORT_NAMES[id]).join(' + ')}
                yes={weightOf('yes', partnerSlugs)}
                no={weightOf('no', partnerSlugs)}
                total={quorums.partners.total}
                needed={quorums.partners.needed}
                threshold={threshold(LAW_PARTNER_PASS_SHARE)}
                result={result(quorumMet(quorums.partners))}
                size="sm"
                tally
              />
            )}
          </div>

          {order.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {(['yes', 'no'] as const).map((side) => (
                <div
                  key={side}
                  className={`grid rounded-[4px] p-2.5 pb-3.5 sm:p-3 sm:pb-3.5 ${
                    side === 'yes' ? 'bg-[#0a2a1d]' : 'bg-[#2c0f10]'
                  }`}
                >
                  <div
                    aria-hidden
                    className={`invisible col-start-1 row-start-1 ${TOKEN_FLOW}`}
                  >
                    {order.map((b) => (
                      <LawVoteToken
                        key={b.slug}
                        ballot={b}
                        character={undefined}
                        animate={false}
                      />
                    ))}
                  </div>
                  <div
                    className={`col-start-1 row-start-1 ${TOKEN_FLOW} ${
                      side === 'yes' ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {shown
                      .filter((b) => b.choice === side)
                      .map((b) => (
                        <LawVoteToken
                          key={b.slug}
                          ballot={b}
                          character={characterBySlug.get(b.slug)}
                          own={b.slug === viewerSlug}
                          animate={!skipped}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 bg-[#0a0f1d] px-3 py-2.5 sm:px-5">
          <span className="grid text-sm font-black leading-tight text-slate-100">
            <span aria-hidden className="invisible col-start-1 row-start-1">
              {verdictLine}
            </span>
            <span
              key={settled ? 'verdict' : 'counting'}
              className="col-start-1 row-start-1 animate-[bubblein_0.3s_ease-out]"
            >
              {settled ? verdictLine : VOTE.counting}
            </span>
          </span>
          {conflicts.length > 0 && (
            <div className="grid">
              <div
                aria-hidden
                className="invisible col-start-1 row-start-1 flex flex-wrap gap-2"
              >
                {conflicts.map((id) => (
                  <LawStruckBill key={id} law={id} animate={false} />
                ))}
              </div>
              {struck && (
                <div className="col-start-1 row-start-1 flex flex-wrap gap-2">
                  {conflicts.map((id) => (
                    <LawStruckBill key={id} law={id} animate={!skipped} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </TelevisionSet>
    </div>
  );
}

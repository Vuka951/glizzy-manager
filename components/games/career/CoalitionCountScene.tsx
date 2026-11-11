'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import BallotBox from '@/components/games/career/BallotBox';
import BallotOfficial from '@/components/games/career/BallotOfficial';
import BallotVoter from '@/components/games/career/BallotVoter';
import CoalitionCountSlip from '@/components/games/career/CoalitionCountSlip';
import CoalitionCountTotals from '@/components/games/career/CoalitionCountTotals';
import CoalitionEmblems from '@/components/games/career/CoalitionEmblems';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { electionNightSounds } from '@/lib/constants/cutsceneSounds';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import {
  coalitionPartners,
  type CoalitionBallot,
} from '@/lib/utils/careerCoalition';
import { countOrder, tallyBallots } from '@/lib/utils/careerParliamentVote';
import type { SponsorId } from '@/lib/utils/careerSave';
import { playCutsceneClip } from '@/lib/utils/cutsceneSounds';
import { playCheerSound, playPlaceSound } from '@/lib/utils/gameSounds';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const COALITION = GAMES_UI.career.election.coalition;

// One coach every slot, quicker for a long list so the count stays short
const SLOT_MS = 1200;
const MIN_SLOT_MS = 600;
const COUNT_MS = 10000;
const SETTLE_PAUSE_MS = 650;
const REDUCED_SETTLE_MS = 400;

// A coach's walk, as fractions of his slot: up to the table, the slip up
// over the slot, through it, and away. He is still leaving while the next
// one walks in
const ARRIVE = 0.42;
const RAISE = 0.56;
const HOLD = 0.62;
const LAND = 0.72;
const LEAVE = 0.84;
const SPAN = 1.36;
const STEP = 0.07;

// Where the slip rides relative to the slot, in stage widths and heights:
// in his hand at the chest, then high over the box, then down inside it
const HAND_X = -9;
const HAND_Y = 26;
const WALK_IN_X = -62;
const WALK_OUT_X = 100;

function at(slot: number, fraction: number): number {
  return Math.round(slot * fraction);
}

// The bob of his stride on the way in and on the way out, flat while he
// stands at the box and leaning into it as the slip goes in
function strideFrames(slot: number): [number, Keyframe][] {
  const frames: [number, Keyframe][] = [];
  const walk = (from: number, to: number) => {
    let up = false;
    for (let f = from; f < to - STEP / 2; f += STEP) {
      frames.push([
        at(slot, f),
        {
          transform: up
            ? 'translateY(-4%) rotate(2deg)'
            : 'translateY(0) rotate(-2deg)',
        },
      ]);
      up = !up;
    }
    frames.push([at(slot, to), { transform: 'translateY(0) rotate(0deg)' }]);
  };
  walk(0, ARRIVE);
  frames.push(
    [at(slot, RAISE), { transform: 'translateY(-2%) rotate(5deg)' }],
    [at(slot, LAND), { transform: 'translateY(0) rotate(3deg)' }],
    [at(slot, LEAVE), { transform: 'translateY(0) rotate(0deg)' }],
  );
  walk(LEAVE + 0.02, SPAN);
  return frames;
}

function choreography(slot: number): Record<string, SceneAnimationSpec> {
  const total = at(slot, SPAN);
  return {
    'voter-walk': sceneTimeline(total, [
      [0, { transform: `translateX(${WALK_IN_X}%)`, opacity: 1 }],
      [at(slot, ARRIVE), { transform: 'translateX(0)', opacity: 1 }],
      [at(slot, LEAVE), { transform: 'translateX(0)', opacity: 1 }],
      [total, { transform: `translateX(${WALK_OUT_X}%)`, opacity: 1 }],
    ]),
    'voter-stride': sceneTimeline(total, strideFrames(slot)),
    'slip-path': sceneTimeline(total, [
      [
        0,
        {
          transform: `translate(${WALK_IN_X + HAND_X}%, ${HAND_Y}%)`,
          opacity: 1,
        },
      ],
      [
        at(slot, ARRIVE),
        { transform: `translate(${HAND_X}%, ${HAND_Y}%)`, opacity: 1 },
      ],
      [at(slot, RAISE), { transform: 'translate(-1%, -8%)', opacity: 1 }],
      [at(slot, HOLD), { transform: 'translate(0, -8%)', opacity: 1 }],
      [at(slot, LAND - 0.03), { transform: 'translate(0, 8%)', opacity: 1 }],
      [at(slot, LAND), { transform: 'translate(0, 14%)', opacity: 0 }],
      [total, { transform: 'translate(0, 14%)', opacity: 0 }],
    ]),
  };
}

// The partner vote counted at the ballot box: the list's coaches walk up
// one at a time, hold up a slip with the partner they picked and drop it
// in. The totals fill under the stage as each slip lands, and the winner is
// stamped once the last one is in. The roll is fixed when the vote closes,
// so everyone in a shared room watches the same count
export default function CoalitionCountScene({
  ballot,
  seats,
  characterBySlug,
  viewerSlug,
  onSettled,
}: {
  // A closed vote
  ballot: CoalitionBallot;
  seats: Record<SponsorId, number>;
  characterBySlug: Map<string, DuelCharacter>;
  viewerSlug?: string;
  onSettled: () => void;
}) {
  const [count] = useState(() => {
    const order = countOrder(ballot.ballots, ballot.winner);
    const slot = Math.max(
      MIN_SLOT_MS,
      Math.min(SLOT_MS, Math.round(COUNT_MS / Math.max(1, order.length))),
    );
    return { ballot, order, slot, specs: choreography(slot) };
  });
  const { order, slot } = count;
  const leader = count.ballot.leader;
  const winner = count.ballot.winner;
  const [landed, setLanded] = useState(0);
  const [settled, setSettled] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLSpanElement | null>(null);
  const stampRef = useRef<HTMLDivElement | null>(null);
  const onSettledRef = useRef(onSettled);
  useSceneAnimation(root, count.specs);

  useEffect(() => {
    onSettledRef.current = onSettled;
  }, [onSettled]);

  const settle = useCallback(() => {
    setSettled(true);
    playCutsceneClip('stamp-thud', electionNightSounds.stamp);
    playCutsceneClip('cymbal-crash', electionNightSounds.crash);
    playCheerSound(0.7);
    onSettledRef.current();
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
          settle();
        }, REDUCED_SETTLE_MS),
      );
      return () => timers.forEach((id) => window.clearTimeout(id));
    }
    order.forEach((b, i) => {
      const start = i * slot;
      timers.push(
        window.setTimeout(
          () =>
            playCutsceneClip('paper-flutter', electionNightSounds.ballotFlutter),
          start + at(slot, RAISE - 0.08),
        ),
        window.setTimeout(() => {
          setLanded(i + 1);
          playCutsceneClip('hit-envelope-slide', electionNightSounds.ballotSlide);
          if (b.weight > 1) playPlaceSound(electionNightSounds.ballotStack);
          boxRef.current?.animate(
            [
              { transform: 'translateY(0) scaleY(1)' },
              {
                transform:
                  b.weight > 1
                    ? 'translateY(3%) scaleY(0.95)'
                    : 'translateY(1.5%) scaleY(0.98)',
              },
              { transform: 'translateY(0) scaleY(1)' },
            ],
            { duration: 260, easing: 'ease-out' },
          );
        }, start + at(slot, LAND)),
      );
    });
    timers.push(
      window.setTimeout(
        settle,
        (order.length - 1) * slot + at(slot, LAND) + SETTLE_PAUSE_MS,
      ),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [order, slot, skipped, settle]);

  useEffect(() => {
    const el = stampRef.current;
    if (!settled || !el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const slam = el.animate(
      [
        { transform: 'scale(2.6) rotate(-14deg)', opacity: 0 },
        { transform: 'scale(0.92) rotate(-8deg)', opacity: 1, offset: 0.7 },
        { transform: 'scale(1) rotate(-8deg)', opacity: 1 },
      ],
      { duration: 380, easing: 'cubic-bezier(0.5, 0, 0.75, 0)' },
    );
    return () => slam.cancel();
  }, [settled]);

  const skip = () => {
    setSkipped(true);
    setLanded(order.length);
    if (!settled) settle();
  };

  const shown = order.slice(0, landed);
  const tally = tallyBallots(shown, count.ballot.options);
  const totalWeight = order.reduce((sum, b) => sum + b.weight, 0);
  const theme = SPONSOR_THEMES[leader];

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div
        ref={root}
        className="relative h-52 w-full overflow-hidden rounded-[4px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 sm:h-64"
      >
        <span
          className={`absolute inset-x-[16%] top-[8%] h-[4%] rounded-full opacity-70 ${theme.stripe}`}
        />
        <span className="absolute left-[30%] top-0 h-[78%] w-[40%] bg-gradient-to-b from-amber-200/20 to-amber-200/0 [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />
        <span className="absolute left-1/2 top-0 h-[5%] w-[8%] -translate-x-1/2 rounded-b-full bg-slate-600" />
        {['left-[4%]', 'right-[4%]'].map((side) => (
          <span
            key={side}
            className={`absolute bottom-[30%] h-[44%] w-[11%] rounded-t-md border border-slate-600/50 bg-slate-800/80 ${side}`}
          >
            <span className="absolute inset-x-[10%] top-[8%] h-[60%] rounded-sm bg-gradient-to-b from-slate-600/60 to-slate-700/40" />
          </span>
        ))}
        <span className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-b from-slate-800 to-slate-900 shadow-[0_-8px_24px_rgba(2,6,23,0.6)]" />

        {!skipped &&
          order.map((b, i) => (
            <div
              key={b.slug}
              data-anim="voter-walk"
              data-anim-delay={i * slot}
              className="absolute inset-0 z-10 opacity-0"
            >
              <div className="absolute bottom-[16%] left-[31%] aspect-[3/4] h-[56%] -translate-x-1/2 sm:h-[62%]">
                <div
                  data-anim="voter-stride"
                  data-anim-delay={i * slot}
                  className="h-full w-full origin-bottom"
                >
                  <BallotVoter
                    character={characterBySlug.get(b.slug)}
                    slug={b.slug}
                    party={leader}
                    own={b.slug === viewerSlug}
                    auto={b.auto === true}
                  />
                </div>
              </div>
            </div>
          ))}
        {!skipped &&
          order.map((b, i) => (
            <div
              key={b.slug}
              data-anim="slip-path"
              data-anim-delay={i * slot}
              className="absolute inset-0 z-20 opacity-0"
            >
              <div className="absolute bottom-[66%] left-1/2 aspect-[3/4] h-[17%] -translate-x-1/2">
                <CoalitionCountSlip
                  partners={coalitionPartners(b.choice ?? '')}
                  weight={b.weight}
                  className="h-full w-full"
                />
              </div>
            </div>
          ))}

        <div className="absolute bottom-[30%] left-[74%] z-[15] hidden aspect-[4/5] h-[36%] -translate-x-1/2 sm:block">
          <div data-anim="nod" className="h-full w-full origin-bottom">
            <BallotOfficial />
          </div>
        </div>
        <div className="absolute bottom-[36%] left-1/2 z-30 aspect-[5/4] h-[30%] -translate-x-1/2">
          <span ref={boxRef} className="block h-full w-full origin-bottom">
            <BallotBox
              leader={leader}
              slips={shown.map((b) => b.weight)}
            />
          </span>
        </div>
        <div className="absolute inset-x-[15%] bottom-[32%] z-40 h-[4%] rounded-sm bg-gradient-to-b from-amber-700 to-amber-800 shadow-md" />
        <div className="absolute inset-x-[17%] bottom-[8%] z-40 h-[24.5%] overflow-hidden bg-gradient-to-b from-amber-900 to-amber-950 shadow-xl">
          <span className={`absolute inset-x-0 top-0 h-[12%] ${theme.stripe}`} />
        </div>

        {settled && winner && (
          <div className="absolute left-1/2 top-[16%] z-50 -translate-x-1/2">
            <div
              ref={stampRef}
              className="flex rotate-[-8deg] items-center gap-1.5 rounded-[4px] border-[3px] border-red-400 bg-slate-950 px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5"
            >
              <CoalitionEmblems
                leader={null}
                partners={[leader, ...coalitionPartners(winner)]}
                size="h-4 w-4 sm:h-6 sm:w-6"
              />
              <span className="font-sign text-[15px] font-extrabold uppercase leading-none tracking-[0.12em] text-red-300 sm:text-xl sm:tracking-[0.16em]">
                {COALITION.stamp}
              </span>
            </div>
          </div>
        )}

        {!settled && (
          <CareerButton
            size="sm"
            className="absolute right-2 top-2 z-50"
            onClick={skip}
          >
            {COALITION.skip}
          </CareerButton>
        )}
      </div>
      <CoalitionCountTotals
        leader={leader}
        options={count.ballot.options}
        seats={seats}
        tally={tally}
        totalWeight={totalWeight}
        winner={settled ? winner : null}
      />
    </div>
  );
}

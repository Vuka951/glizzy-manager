import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import MoodBubble from '@/components/games/career/MoodBubble';
import MoodCharacterEffects from '@/components/games/career/MoodCharacterEffects';
import SponsorActorGear from '@/components/games/career/SponsorActorGear';
import TownEscort from '@/components/games/career/town/TownEscort';
import TownEscortDog from '@/components/games/career/town/TownEscortDog';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import { useSeatColors } from '@/components/games/rooms/seatColors';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { SEAT_COLOR_CLASSES } from '@/lib/constants/rooms';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import {
  TOWN_ART_SIZE,
  TOWN_LAYOUTS,
  type TownBuildingId,
  type TownLayoutKey,
} from '@/lib/constants/townLayout';
import {
  TOWN_MOOD_BITS,
  TOWN_MOOD_DIRECT_DY,
  TOWN_MOOD_DWELL,
  TOWN_MOOD_GAITS,
  TOWN_MOOD_RETURN_CHANCE,
  TOWN_MOOD_STOPS,
  type TownMoodBit,
  type TownMoodStop,
} from '@/lib/constants/townMoodRoutines';
import type { TownTrip } from '@/lib/types/town';
import {
  careerMoodActivityFor,
  careerMoodAnimationFor,
  type CareerMoodActivity,
} from '@/lib/utils/careerMood';
import type { CharacterCareerState, SponsorId } from '@/lib/utils/careerSave';
import { prefersReducedMotion } from '@/lib/utils/motion';
import {
  townDoor,
  townRoute,
  type TownPoint as Point,
} from '@/lib/utils/townFlow';

const PORTRAIT_POSES: Partial<Record<CareerMoodActivity, string>> = {
  defeated: 'origin-center rotate-[82deg] scale-x-110 scale-y-75 saturate-50',
  relaxed: 'origin-bottom-left -rotate-12',
  proud: 'origin-bottom scale-110 saturate-125',
  sick: 'saturate-75',
};

// About a quarter bigger than the league's walkers, enough to pick him out
// without towering over them
const SIZES: Record<
  TownLayoutKey,
  {
    portrait: string;
    glow: string;
    escortLeft: string;
    escortRight: string;
    dogLeft: string;
    dogRight: string;
    dogPastLeft: string;
    dogPastRight: string;
    bubble: string;
  }
> = {
  desk: {
    portrait: 'h-[40px] w-[40px]',
    glow: 'w-10',
    escortLeft: '-left-[15px] h-[34px] w-[17px]',
    escortRight: '-right-[15px] h-[34px] w-[17px]',
    dogLeft: '-left-[23px] h-[20px] w-[23px]',
    dogRight: '-right-[23px] h-[20px] w-[23px]',
    dogPastLeft: '-left-[38px] h-[20px] w-[23px]',
    dogPastRight: '-right-[38px] h-[20px] w-[23px]',
    bubble: '',
  },
  phone: {
    portrait: 'h-[26px] w-[26px]',
    glow: 'w-7',
    escortLeft: '-left-[10px] h-[22px] w-[11px]',
    escortRight: '-right-[10px] h-[22px] w-[11px]',
    dogLeft: '-left-[15px] h-[13px] w-[15px]',
    dogRight: '-right-[15px] h-[13px] w-[15px]',
    dogPastLeft: '-left-[25px] h-[13px] w-[15px]',
    dogPastRight: '-right-[25px] h-[13px] w-[15px]',
    bubble: 'origin-bottom-left scale-[0.8]',
  },
};

// Canvas pixels per millisecond. The phone canvas is drawn larger on screen,
// so he covers fewer canvas pixels to keep the same pace
const WALK_SPEED: Record<TownLayoutKey, number> = { desk: 0.35, phone: 0.18 };
const DOOR_PAUSE_MS = 450;
const ISLAND_AWAY_MS = 3600;
const FADE_MS = 300;
const NEUTRAL_FRAME: Keyframe = {
  transform: 'translate(0, 0) rotate(0deg) scale(1)',
  opacity: 1,
};

function spotFor(layout: TownLayoutKey, activity: CareerMoodActivity): Point {
  const { x, y } = TOWN_LAYOUTS[layout].spots[activity];
  return { x, y };
}

function busDoor(layout: TownLayoutKey): Point {
  const { x, y } = TOWN_LAYOUTS[layout].cupBus.door;
  return { x, y };
}

// Feet order, except on the fountain (he stands on top of it) and when he
// hides behind the nearest building in front of his spot
function restingZ(layout: TownLayoutKey, activity: CareerMoodActivity): number {
  const L = TOWN_LAYOUTS[layout];
  if (activity === 'proud') return L.fountain.ground + 1;
  return stopZ(layout, L.spots[activity]);
}

function stopZ(layout: TownLayoutKey, spot: TownMoodStop): number {
  const L = TOWN_LAYOUTS[layout];
  if (!spot.behind) return Math.round(spot.y) + 1;
  let front: number | null = null;
  for (const id of Object.keys(L.buildings) as TownBuildingId[]) {
    const b = L.buildings[id];
    const right = b.x + TOWN_ART_SIZE[id].w * b.scale;
    if (spot.x < b.x || spot.x > right || b.ground <= spot.y) continue;
    if (front === null || b.ground < front) front = b.ground;
  }
  return (front ?? Math.round(spot.y)) - 20;
}

function randomBetween([low, high]: readonly [number, number]): number {
  return low + Math.random() * (high - low);
}

export default function TownWalker({
  character,
  mood,
  sponsorId,
  layout,
  escorted,
  escortDog,
  trip,
  boarding,
  onArrive,
  onTripEnd,
  onBoarded,
}: {
  character: DuelCharacter;
  mood: CharacterCareerState;
  sponsorId: SponsorId | null;
  layout: TownLayoutKey;
  escorted: boolean;
  escortDog: boolean;
  trip: TownTrip | null;
  // He walks to the cup bus's door and gets on; he stays aboard
  boarding: boolean;
  onArrive: (trip: TownTrip) => void;
  onTripEnd: (trip: TownTrip) => void;
  onBoarded: () => void;
}) {
  const targetActivity = careerMoodActivityFor(mood);
  const tripKey = trip?.key ?? null;
  const [displayedActivity, setDisplayedActivity] =
    useState<CareerMoodActivity>(targetActivity);
  const [visualsActive, setVisualsActive] = useState(false);
  const [walking, setWalking] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  // Out on a mood's errand: the bubble and effects stay on while they walk, and
  // the gait follows the mood
  const [strolling, setStrolling] = useState(false);
  // Doing one of the mood's bits, so the lying or leaning pose of its own spot
  // does not apply
  const [onBit, setOnBit] = useState(false);
  const ambientMotion = useAmbientMotion();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const actorRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<Animation | null>(null);
  const transitionRef = useRef<Animation | null>(null);
  const hideRef = useRef<Animation | null>(null);
  const gaitRef = useRef<Animation | null>(null);
  const moodVersionRef = useRef(0);
  const moodStoppedRef = useRef(true);
  const displayedRef = useRef(displayedActivity);
  const facingLeftRef = useRef(false);
  const posRef = useRef<Point | null>(null);
  const posLayoutRef = useRef<TownLayoutKey | null>(null);
  const restingRef = useRef<{
    activity: CareerMoodActivity;
    layout: TownLayoutKey;
  } | null>(null);
  const genRef = useRef(0);
  const runningGenRef = useRef<number | null>(null);
  const handledTripRef = useRef<number | null>(null);
  const tripProgressRef = useRef<{ key: number; arrived: boolean } | null>(
    null,
  );
  const kickRef = useRef<() => void>(() => {});
  const wakeRef = useRef<(() => void) | null>(null);
  const awayStopRef = useRef<TownMoodStop | null>(null);
  const bitRef = useRef<TownMoodBit | null>(null);
  const ambientRef = useRef(ambientMotion);

  const targetRef = useRef(targetActivity);
  const tripRef = useRef(trip);
  const boardingRef = useRef(boarding);
  const boardedRef = useRef(false);
  const layoutRef = useRef(layout);
  const onArriveRef = useRef(onArrive);
  const onTripEndRef = useRef(onTripEnd);
  const onBoardedRef = useRef(onBoarded);

  useLayoutEffect(() => {
    targetRef.current = targetActivity;
    tripRef.current = trip;
    boardingRef.current = boarding;
    layoutRef.current = layout;
    onArriveRef.current = onArrive;
    onTripEndRef.current = onTripEnd;
    onBoardedRef.current = onBoarded;
    ambientRef.current = ambientMotion;
  });

  useLayoutEffect(() => {
    genRef.current += 1;
    const gen = genRef.current;
    const alive = () => genRef.current === gen;
    const timers = new Set<number>();
    const pending = new Set<() => void>();
    let raf = 0;

    const place = (p: Point, z: number) => {
      const el = rootRef.current;
      if (!el) return;
      posRef.current = p;
      posLayoutRef.current = layoutRef.current;
      el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      el.style.zIndex = String(z);
    };

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const done = () => {
          pending.delete(done);
          resolve();
        };
        pending.add(done);
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          done();
        }, ms);
        timers.add(timer);
      });

    // Ease back to a neutral stance and drop the pose, bubble and effects
    const stopMood = (duration: number) => {
      const el = actorRef.current;
      moodVersionRef.current += 1;
      moodStoppedRef.current = true;
      setVisualsActive(false);
      if (!el) return Promise.resolve();
      const style = window.getComputedStyle(el);
      const from: Keyframe = {
        transform: style.transform === 'none' ? 'none' : style.transform,
        opacity: Number(style.opacity),
      };
      transitionRef.current?.cancel();
      loopRef.current?.cancel();
      loopRef.current = null;
      gaitRef.current?.cancel();
      gaitRef.current = null;
      if (prefersReducedMotion()) {
        transitionRef.current = null;
        return Promise.resolve();
      }
      const back = el.animate([from, NEUTRAL_FRAME], {
        duration,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      });
      transitionRef.current = back;
      return back.finished.then(
        () => undefined,
        () => undefined,
      );
    };

    // Blend from wherever he is into the loop, then hand over to an endless
    // copy of the loop. A bit is one of the mood's other moves, in place of
    // the loop of its own spot
    const startMood = (activity: CareerMoodActivity, bit?: TownMoodBit) => {
      const el = actorRef.current;
      moodVersionRef.current += 1;
      const version = moodVersionRef.current;
      moodStoppedRef.current = false;
      displayedRef.current = activity;
      bitRef.current = bit ?? null;
      setDisplayedActivity(activity);
      setOnBit(Boolean(bit));
      if (!el || prefersReducedMotion()) {
        transitionRef.current?.cancel();
        loopRef.current?.cancel();
        transitionRef.current = null;
        loopRef.current = null;
        requestAnimationFrame(() => {
          if (moodVersionRef.current === version) setVisualsActive(true);
        });
        return;
      }
      const style = window.getComputedStyle(el);
      const entranceFrame: Keyframe =
        style.transform === 'none'
          ? NEUTRAL_FRAME
          : { transform: style.transform, opacity: Number(style.opacity) };
      transitionRef.current?.cancel();
      loopRef.current?.cancel();
      loopRef.current = null;
      gaitRef.current?.cancel();
      gaitRef.current = null;
      const { duration, keyframes } = bit ?? careerMoodAnimationFor(activity);
      const entranceDuration = 850;
      const combinedDuration = entranceDuration + duration;
      const loopStartOffset = entranceDuration / combinedDuration;
      const combinedKeyframes: Keyframe[] = [
        {
          ...entranceFrame,
          offset: 0,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        },
        ...keyframes.map((frame, index) => {
          const loopOffset =
            typeof frame.offset === 'number'
              ? frame.offset
              : index / Math.max(1, keyframes.length - 1);
          return {
            ...frame,
            offset: loopStartOffset + loopOffset * (1 - loopStartOffset),
            easing: frame.easing ?? 'ease-in-out',
          };
        }),
      ];
      const transition = el.animate(combinedKeyframes, {
        duration: combinedDuration,
        easing: 'linear',
        fill: 'forwards',
      });
      transitionRef.current = transition;
      transition.onfinish = () => {
        if (moodVersionRef.current !== version) return;
        const loop = el.animate(keyframes, {
          duration,
          iterations: Infinity,
          easing: 'ease-in-out',
        });
        loop.pause();
        loop.currentTime = 0;
        loopRef.current = loop;
        requestAnimationFrame(() => {
          if (moodVersionRef.current !== version) return;
          loop.play();
          transition.cancel();
          if (transitionRef.current === transition)
            transitionRef.current = null;
        });
      };
      requestAnimationFrame(() => {
        if (moodVersionRef.current === version) setVisualsActive(true);
      });
    };

    const setFacing = (left: boolean) => {
      if (facingLeftRef.current === left) return;
      facingLeftRef.current = left;
      setFacingLeft(left);
    };

    // Walk the road to wherever `resolve` points. A layout switch mid-walk
    // snaps them to the same target on the new canvas. On an errand they
    // walk in the mood's gait, go straight there when it is close, keep
    // facing the way they came and give up as soon as something else comes up
    const walkTo = (
      resolve: () => Point,
      errand?: { activity: CareerMoodActivity; abort: () => boolean },
    ) =>
      new Promise<void>((done) => {
        const startLayout = layoutRef.current;
        const target = resolve();
        const from = posRef.current;
        if (
          !from ||
          posLayoutRef.current !== startLayout ||
          prefersReducedMotion()
        ) {
          place(target, Math.round(target.y) + 1);
          done();
          return;
        }
        const legs =
          errand && Math.abs(from.y - target.y) <= TOWN_MOOD_DIRECT_DY
            ? [target]
            : townRoute(TOWN_LAYOUTS[startLayout].road, from, target);
        void stopMood(250);
        setWalking(true);
        const gait = errand ? TOWN_MOOD_GAITS[errand.activity] : null;
        if (errand) setStrolling(true);
        if (gait) {
          gaitRef.current = actorRef.current?.animate(gait.step.keyframes, {
            duration: gait.step.duration,
            iterations: Infinity,
            easing: 'ease-in-out',
          }) ?? null;
        }
        const speed = WALK_SPEED[startLayout] * (gait?.speed ?? 1);
        let leg = 0;
        let pos = from;
        let last: number | null = null;
        const finish = () => {
          pending.delete(finish);
          setWalking(false);
          setStrolling(false);
          if (!errand) setFacing(false);
          done();
        };
        pending.add(finish);
        const frame = (now: number) => {
          if (!alive()) return;
          if (errand?.abort()) {
            finish();
            return;
          }
          if (layoutRef.current !== startLayout) {
            const snapped = resolve();
            place(snapped, Math.round(snapped.y) + 1);
            finish();
            return;
          }
          const dt = last === null ? 16 : Math.min(64, now - last);
          last = now;
          let budget = dt * speed;
          while (budget > 0 && leg < legs.length) {
            const to = legs[leg];
            const dx = to.x - pos.x;
            const dy = to.y - pos.y;
            const d = Math.hypot(dx, dy);
            if (dx < -0.5) setFacing(true);
            else if (dx > 0.5) setFacing(false);
            if (d <= budget) {
              pos = to;
              budget -= d;
              leg += 1;
            } else {
              pos = {
                x: pos.x + (dx * budget) / d,
                y: pos.y + (dy * budget) / d,
              };
              budget = 0;
            }
          }
          place(pos, Math.round(pos.y) + 1);
          if (leg >= legs.length) {
            finish();
            return;
          }
          raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      });

    const goHome = async () => {
      const activity = targetRef.current;
      const L = layoutRef.current;
      const spot = spotFor(L, activity);
      const pos = posRef.current;
      restingRef.current = null;
      const atSpot =
        posLayoutRef.current === L &&
        pos !== null &&
        Math.hypot(pos.x - spot.x, pos.y - spot.y) < 1;
      if (!atSpot) {
        await walkTo(() => spotFor(layoutRef.current, activity));
      } else if (
        displayedRef.current !== activity &&
        !moodStoppedRef.current
      ) {
        // Idle and frantic share a spot: blend through neutral in place
        await stopMood(700);
      }
      if (!alive()) return;
      const settledLayout = layoutRef.current;
      place(spotFor(settledLayout, activity), restingZ(settledLayout, activity));
      if (
        moodStoppedRef.current ||
        displayedRef.current !== activity ||
        bitRef.current
      )
        startMood(activity);
      awayStopRef.current = null;
      restingRef.current = { activity, layout: settledLayout };
    };

    // The mood's errands: stay a while, then head for one of its stops or back
    // to its own spot and do something there. Anything else coming up, a trip,
    // the bus, a new mood, ends it on the spot
    const wander = async () => {
      const activity = targetRef.current;
      const L = layoutRef.current;
      const abort = () =>
        !alive() ||
        targetRef.current !== activity ||
        layoutRef.current !== L ||
        boardingRef.current ||
        !ambientRef.current ||
        (tripRef.current !== null &&
          tripRef.current.key !== handledTripRef.current);
      const away = awayStopRef.current;
      const dwell = away ? TOWN_MOOD_DWELL.stop : TOWN_MOOD_DWELL.home;
      const until = performance.now() + randomBetween(dwell);
      // A kick only means something changed, so the wait resumes if it was
      // nothing that concerns them
      while (!abort() && performance.now() < until) {
        await new Promise<void>((resolve) => {
          const end = () => {
            window.clearTimeout(timer);
            timers.delete(timer);
            pending.delete(end);
            wakeRef.current = null;
            resolve();
          };
          const timer = window.setTimeout(end, until - performance.now());
          timers.add(timer);
          pending.add(end);
          wakeRef.current = end;
        });
      }
      if (abort()) return;
      const stops = TOWN_MOOD_STOPS[L][activity].filter((stop) => stop !== away);
      const goBack =
        stops.length === 0 ||
        (away !== null && Math.random() < TOWN_MOOD_RETURN_CHANCE);
      const stop = goBack
        ? null
        : stops[Math.floor(Math.random() * stops.length)];
      const target = stop ?? spotFor(L, activity);
      await walkTo(() => target, { activity, abort });
      if (abort()) return;
      awayStopRef.current = stop;
      if (stop) {
        const bits = TOWN_MOOD_BITS[activity];
        place(stop, stopZ(L, stop));
        startMood(activity, bits[Math.floor(Math.random() * bits.length)]);
      } else {
        place(spotFor(L, activity), restingZ(L, activity));
        startMood(activity);
      }
    };

    const sailAway = async () => {
      const el = rootRef.current;
      if (!el) return;
      const duration = prefersReducedMotion() ? 0 : FADE_MS;
      hideRef.current?.cancel();
      hideRef.current = el.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration,
        fill: 'forwards',
      });
      await wait(ISLAND_AWAY_MS);
      if (!alive()) return;
      const hidden = hideRef.current;
      const back = el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration,
        fill: 'forwards',
      });
      hidden?.cancel();
      hideRef.current = back;
      back.finished.then(
        () => back.cancel(),
        () => undefined,
      );
    };

    const takeTrip = async (current: TownTrip) => {
      const resumed =
        tripProgressRef.current?.key === current.key &&
        tripProgressRef.current.arrived;
      tripProgressRef.current = { key: current.key, arrived: resumed };
      if (!resumed) {
        await walkTo(() => townDoor(layoutRef.current, current.building));
        if (!alive()) return;
        tripProgressRef.current = { key: current.key, arrived: true };
        onArriveRef.current(current);
        if (current.island) await sailAway();
        else await wait(DOOR_PAUSE_MS);
        if (!alive()) return;
      }
      await goHome();
      if (!alive()) return;
      tripProgressRef.current = null;
      onTripEndRef.current(current);
    };

    const board = async () => {
      await walkTo(() => busDoor(layoutRef.current));
      if (!alive()) return;
      const el = rootRef.current;
      boardedRef.current = true;
      if (el) {
        hideRef.current?.cancel();
        hideRef.current = el.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: prefersReducedMotion() ? 0 : FADE_MS,
          fill: 'forwards',
        });
      }
      onBoardedRef.current();
    };

    // One errand at a time: a trip runs to its end before he heads for a
    // mood spot that changed on the way
    const run = async () => {
      if (runningGenRef.current === gen) return;
      runningGenRef.current = gen;
      try {
        while (alive() && !boardedRef.current) {
          const current = tripRef.current;
          if (current && current.key !== handledTripRef.current) {
            handledTripRef.current = current.key;
            await takeTrip(current);
            continue;
          }
          if (boardingRef.current) {
            await board();
            break;
          }
          const rest = restingRef.current;
          if (
            rest &&
            rest.activity === targetRef.current &&
            rest.layout === layoutRef.current &&
            posLayoutRef.current === layoutRef.current
          ) {
            if (ambientRef.current && !prefersReducedMotion()) {
              await wander();
              continue;
            }
            if (!awayStopRef.current) break;
          }
          await goHome();
        }
      } finally {
        if (runningGenRef.current === gen) runningGenRef.current = null;
      }
    };

    kickRef.current = () => {
      wakeRef.current?.();
      void run();
    };

    const L = layoutRef.current;
    if (!posRef.current || posLayoutRef.current !== L) {
      const activity = targetRef.current;
      place(spotFor(L, activity), restingZ(L, activity));
      restingRef.current = { activity, layout: L };
    } else if (rootRef.current) {
      const { x, y } = posRef.current;
      rootRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
    if (restingRef.current) startMood(restingRef.current.activity);
    void run();

    return () => {
      genRef.current += 1;
      kickRef.current = () => {};
      if (tripProgressRef.current) handledTripRef.current = null;
      timers.forEach((timer) => window.clearTimeout(timer));
      cancelAnimationFrame(raf);
      pending.forEach((resolve) => resolve());
      transitionRef.current?.cancel();
      loopRef.current?.cancel();
      hideRef.current?.cancel();
      gaitRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    kickRef.current();
  }, [targetActivity, tripKey, layout, boarding, ambientMotion]);

  const sizes = SIZES[layout];
  // The portrait's own pale rim inside one colored ring marks him as yours,
  // as the match table marks your man: sky in single player, your seat's
  // color in a shared room
  const seat = useSeatColors()[character.slug];
  const ring = `ring-2 ${seat ? SEAT_COLOR_CLASSES[seat.color].ring : 'ring-sky-300'}`;
  const hop = !walking
    ? ''
    : strolling
      ? TOWN_MOOD_GAITS[displayedActivity].hop
      : 'motion-safe:animate-[fanhop_0.34s_ease-in-out_infinite] motion-lite:animate-none!';
  const moodShown = visualsActive || strolling;
  // The dog trails behind them, outside the bodyguards when there are any
  const dogSpot = facingLeft
    ? escorted
      ? sizes.dogPastRight
      : sizes.dogRight
    : escorted
      ? sizes.dogPastLeft
      : sizes.dogLeft;

  return (
    <div
      ref={rootRef}
      data-town-walker
      className="pointer-events-none absolute left-0 top-0"
    >
      <div className="absolute bottom-0 left-0 -translate-x-1/2">
        <span
          aria-hidden="true"
          className="absolute -bottom-1.5 left-[12%] right-[12%] h-2.5 rounded-full bg-black/40 blur-[2px]"
        />
        {escortDog && (
          <span
            className={`absolute bottom-0 ${dogSpot} ${hop} [animation-delay:-0.1s]`}
          >
            <TownEscortDog flip={!facingLeft} />
          </span>
        )}
        {escorted && (
          <>
            <span className={`absolute bottom-0 ${sizes.escortLeft} ${hop}`}>
              <TownEscort side="left" />
            </span>
            <span
              className={`absolute bottom-0 ${sizes.escortRight} ${hop} [animation-delay:-0.17s]`}
            >
              <TownEscort side="right" />
            </span>
          </>
        )}
        <div className={`relative ${hop}`}>
          <div
            ref={actorRef}
            data-mood-actor
            data-mood-activity={displayedActivity}
            data-mood-transition={
              walking ? 'walking' : visualsActive ? 'active' : 'centering'
            }
            className="relative"
          >
            <div
              data-mood-portrait
              className={`relative transition-[filter,rotate,scale,transform] duration-[850ms] ease-out ${
                visualsActive && !onBit
                  ? (PORTRAIT_POSES[displayedActivity] ?? '')
                  : 'origin-center rotate-0 scale-100 saturate-100'
              }`}
            >
              {sponsorId && (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -bottom-1 left-1/2 h-3 -translate-x-1/2 rounded-full blur-md ${sizes.glow} ${SPONSOR_THEMES[sponsorId].actorGlow}`}
                />
              )}
              <div
                className={`relative transition-transform duration-200 ${facingLeft ? '-scale-x-100' : ''}`}
              >
                <PortraitHead
                  character={character}
                  className={`${sizes.portrait} ${ring}`}
                />
                {sponsorId && <SponsorActorGear sponsorId={sponsorId} variant="seat" />}
              </div>
            </div>
            <MoodCharacterEffects
              activity={displayedActivity}
              active={moodShown}
              ambient
            />
            <MoodBubble
              ch={mood}
              small
              className={`transition-opacity duration-500 ${sizes.bubble} ${moodShown ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

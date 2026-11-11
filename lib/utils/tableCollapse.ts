import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';
import {
  tableCollapseBeats as beats,
  type TableCollapse,
} from '@/lib/constants/tableCollapse';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const STEP_MS = 120;
// Far enough left that the crew starts and ends off any stage width
const CREW_OFF = 'translateX(-460px)';

export function tableCollapseOf(variant: string | undefined): TableCollapse {
  return variant === 'puke' ? 'puke' : 'cholesterol';
}

// A bob on every other step while the crew walks, flat while it stands
function walkSteps(from: number, to: number): [number, Keyframe][] {
  const frames: [number, Keyframe][] = [];
  for (let at = from; at + STEP_MS <= to; at += STEP_MS * 2) {
    frames.push(
      [at, { transform: 'translateY(0)' }],
      [at + STEP_MS, { transform: 'translateY(-3px)' }],
    );
  }
  frames.push([to, { transform: 'translateY(0)' }]);
  return frames;
}

// The moves TableCollapse names, laid out on a scene clock of totalMs
export function tableCollapseAnimations(
  totalMs: number,
): Record<string, SceneAnimationSpec> {
  const { bites, burst, faceplant, lift, heave, spray, slide } = beats;
  return {
    gobble: sceneTimeline(totalMs, [
      [0, { transform: 'translateY(0) rotate(0deg)' }],
      ...bites.flatMap((bite): [number, Keyframe][] => [
        [bite - 120, { transform: 'translateY(0) rotate(0deg)' }],
        [bite, { transform: 'translateY(4px) rotate(6deg)' }],
        [bite + 160, { transform: 'translateY(0) rotate(0deg)' }],
      ]),
      [totalMs, { transform: 'translateY(0) rotate(0deg)' }],
    ]),
    ...Object.fromEntries(
      bites.map((bite, i) => [
        `eaten-${i}`,
        sceneTimeline(totalMs, [
          [0, { opacity: 1 }],
          [bite - 40, { opacity: 1 }],
          [bite, { opacity: 0 }],
          [totalMs, { opacity: 0 }],
        ]),
      ]),
    ),

    'gauge-fill': sceneTimeline(totalMs, [
      [0, { transform: 'scaleY(0.3)' }],
      [burst - 100, { transform: 'scaleY(1)' }],
      [totalMs, { transform: 'scaleY(1)' }],
    ]),
    'gauge-burst': sceneTimeline(totalMs, [
      [0, { opacity: 1, transform: 'translateX(0) scale(1)' }],
      [burst - 500, { opacity: 1, transform: 'translateX(0) scale(1)' }],
      [burst - 400, { opacity: 1, transform: 'translateX(-2px) scale(1)' }],
      [burst - 300, { opacity: 1, transform: 'translateX(2px) scale(1.05)' }],
      [burst - 200, { opacity: 1, transform: 'translateX(-2px) scale(1.05)' }],
      [burst - 100, { opacity: 1, transform: 'translateX(2px) scale(1.1)' }],
      [burst, { opacity: 1, transform: 'translateX(0) scale(1.2)' }],
      [burst + 40, { opacity: 0, transform: 'translateX(0) scale(1.6)' }],
      [totalMs, { opacity: 0, transform: 'translateX(0) scale(1.6)' }],
    ]),
    'bang-pop': sceneTimeline(totalMs, [
      [0, { opacity: 0, transform: 'scale(0.4)' }],
      [burst, { opacity: 0, transform: 'scale(0.4)' }],
      [burst + 100, { opacity: 1, transform: 'scale(1.1)' }],
      [burst + 450, { opacity: 1, transform: 'scale(1)' }],
      [burst + 600, { opacity: 0, transform: 'scale(1)' }],
      [totalMs, { opacity: 0, transform: 'scale(1)' }],
    ]),
    'red-flush': sceneTimeline(totalMs, [
      [0, { opacity: 0 }],
      [bites[0], { opacity: 0 }],
      [burst, { opacity: 0.7 }],
      [totalMs, { opacity: 0.7 }],
    ]),
    tremble: sceneTimeline(
      totalMs,
      [
        [0, { transform: 'translateX(0)' }],
        [burst - 500, { transform: 'translateX(0)' }],
        ...[0, 1, 2, 3, 4].map((i): [number, Keyframe] => [
          burst - 440 + i * 90,
          { transform: `translateX(${i % 2 ? 2 : -2}px)` },
        ]),
        [burst, { transform: 'translateX(0)' }],
        [totalMs, { transform: 'translateX(0)' }],
      ],
      'linear',
    ),
    'x-in': sceneTimeline(totalMs, [
      [0, { opacity: 0 }],
      [burst + 50, { opacity: 0 }],
      [burst + 100, { opacity: 1 }],
      [totalMs, { opacity: 1 }],
    ]),
    // He drops face first into his plate and stays there until the crew
    // lifts him, when the man on the stretcher takes his place
    slump: sceneTimeline(totalMs, [
      [0, { opacity: 1, transform: 'translate(0, 0) rotate(0deg)' }],
      [burst, { opacity: 1, transform: 'translate(0, 0) rotate(0deg)' }],
      [faceplant, { opacity: 1, transform: 'translate(6px, 10px) rotate(58deg)' }],
      [lift, { opacity: 1, transform: 'translate(6px, 10px) rotate(58deg)' }],
      [lift + 100, { opacity: 0, transform: 'translate(0, -6px) rotate(40deg)' }],
      [totalMs, { opacity: 0, transform: 'translate(0, -6px) rotate(40deg)' }],
    ]),
    'crew-walk': sceneTimeline(totalMs, [
      [0, { transform: CREW_OFF }],
      [beats.crewIn, { transform: CREW_OFF }],
      [beats.crewSet, { transform: 'translateX(0)' }],
      [beats.carry, { transform: 'translateX(0)' }],
      [beats.gone, { transform: CREW_OFF }],
      [totalMs, { transform: CREW_OFF }],
    ]),
    'crew-step': sceneTimeline(totalMs, [
      [0, { transform: 'translateY(0)' }],
      ...walkSteps(beats.crewIn, beats.crewSet),
      ...walkSteps(beats.carry, beats.gone),
      [totalMs, { transform: 'translateY(0)' }],
    ]),
    'on-stretcher': sceneTimeline(totalMs, [
      [0, { opacity: 0, transform: 'translateY(10px)' }],
      [lift, { opacity: 0, transform: 'translateY(10px)' }],
      [lift + 60, { opacity: 1, transform: 'translateY(6px)' }],
      [lift + 180, { opacity: 1, transform: 'translateY(0)' }],
      [totalMs, { opacity: 1, transform: 'translateY(0)' }],
    ]),

    'belly-swell': sceneTimeline(totalMs, [
      [0, { transform: 'scaleX(1)' }],
      [bites[0], { transform: 'scaleX(1)' }],
      [heave, { transform: 'scaleX(1.45)' }],
      [spray + 400, { transform: 'scaleX(1.15)' }],
      [totalMs, { transform: 'scaleX(1.15)' }],
    ]),
    'green-flush': sceneTimeline(totalMs, [
      [0, { opacity: 0 }],
      [bites[0], { opacity: 0 }],
      [heave, { opacity: 0.6 }],
      [totalMs, { opacity: 0.6 }],
    ]),
    bloat: sceneTimeline(totalMs, [
      [0, { transform: 'scale(1, 1)' }],
      [heave - 400, { transform: 'scale(1, 1)' }],
      [heave - 50, { transform: 'scale(1.14, 0.94)' }],
      [spray, { transform: 'scale(0.96, 1.04)' }],
      [spray + 200, { transform: 'scale(1, 1)' }],
      [totalMs, { transform: 'scale(1, 1)' }],
    ]),
    heave: sceneTimeline(totalMs, [
      [0, { transform: 'translate(0, 0) rotate(0deg)' }],
      [heave - 100, { transform: 'translate(0, 0) rotate(0deg)' }],
      [heave, { transform: 'translate(0, 0) rotate(-6deg)' }],
      [spray, { transform: 'translate(4px, 2px) rotate(20deg)' }],
      [spray + 450, { transform: 'translate(4px, 2px) rotate(20deg)' }],
      [slide, { transform: 'translate(0, 0) rotate(4deg)' }],
      [beats.underTable, { transform: 'translate(-4px, 110px) rotate(-14deg)' }],
      [totalMs, { transform: 'translate(-4px, 110px) rotate(-14deg)' }],
    ]),
    spray: sceneTimeline(totalMs, [
      [0, { opacity: 0, transform: 'rotate(28deg) scaleX(0)' }],
      [spray, { opacity: 1, transform: 'rotate(28deg) scaleX(0)' }],
      [spray + 150, { opacity: 1, transform: 'rotate(28deg) scaleX(1)' }],
      [spray + 450, { opacity: 1, transform: 'rotate(34deg) scaleX(1)' }],
      [slide, { opacity: 0, transform: 'rotate(40deg) scaleX(0.6)' }],
      [totalMs, { opacity: 0, transform: 'rotate(40deg) scaleX(0.6)' }],
    ]),
    puddle: sceneTimeline(totalMs, [
      [0, { opacity: 0, transform: 'scale(0.2, 0.4)' }],
      [spray + 100, { opacity: 0, transform: 'scale(0.2, 0.4)' }],
      [spray + 200, { opacity: 1, transform: 'scale(0.5, 0.7)' }],
      [slide, { opacity: 1, transform: 'scale(1, 1)' }],
      [totalMs, { opacity: 1, transform: 'scale(1.15, 1)' }],
    ]),
  };
}

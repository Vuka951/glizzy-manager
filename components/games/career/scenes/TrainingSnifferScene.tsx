'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import LevelUpBurst from '@/components/games/career/scenes/LevelUpBurst';
import SniffScent from '@/components/games/match/SniffScent';
import BowlIcon from '@/components/icons/BowlIcon';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import NoseIcon from '@/components/icons/NoseIcon';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const REVEAL_MS = 2600;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  // The nose works the row of bowls left to right, then settles on the middle one
  patrol: {
    keyframes: [
      { transform: 'translateX(-72px) rotate(-8deg)', offset: 0 },
      { transform: 'translateX(-30px) rotate(6deg)', offset: 0.28 },
      { transform: 'translateX(72px) rotate(-6deg)', offset: 0.62 },
      { transform: 'translateX(4px) rotate(4deg)', offset: 0.9 },
      { transform: 'translateX(0) rotate(0deg)', offset: 1 },
    ],
    options: { duration: REVEAL_MS, easing: 'ease-in-out', fill: 'both' },
  },
  sniff: {
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.08) translateY(-2px)', offset: 0.5 },
      { transform: 'scale(1)' },
    ],
    options: { duration: 380, iterations: Infinity, easing: 'ease-in-out' },
  },
  lift: {
    keyframes: [
      { transform: 'translateY(0) rotate(0deg)' },
      { transform: 'translateY(-38px) rotate(-22deg)' },
    ],
    options: {
      duration: 500,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  lamp: {
    keyframes: [
      { opacity: 0.55 },
      { opacity: 0.7 },
      { opacity: 0.5 },
      { opacity: 0.65 },
    ],
    options: { duration: 2400, iterations: Infinity, easing: 'ease-in-out' },
  },
};

const BOWLS = ['left-[22%]', 'left-1/2', 'left-[78%]'];

export default function TrainingSnifferScene({
  character,
  outcome,
}: ActionSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const bad = outcome === 'bad';
  const levelUp = outcome === 'level-up';
  useSceneAnimation(root, CUSTOM, [outcome]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900"
        floor="bg-slate-800/90"
      >
        {/* a single hanging lamp over the table */}
        <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2 bg-slate-500" />
        <div className="absolute left-1/2 top-7 h-3 w-14 -translate-x-1/2 rounded-b-full bg-amber-200 shadow-[0_0_18px_rgba(253,230,138,0.6)]" />
        <div
          data-anim="lamp"
          className="absolute left-1/2 top-9 h-[70%] w-[62%] -translate-x-1/2 bg-gradient-to-b from-amber-200/25 via-amber-200/8 to-transparent [clip-path:polygon(38%_0,62%_0,100%_100%,0_100%)]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,6,23,0.75)_100%)]" />

        {/* the table and the three overturned bowls */}
        <div className="absolute inset-x-[8%] bottom-[18%] h-4 rounded-md bg-amber-900/80 shadow-lg" />
        {BOWLS.map((cls, i) => {
          const middle = i === 1;
          const lifts = middle || levelUp;
          const liftDelay = REVEAL_MS + (middle ? 0 : i === 0 ? 400 : 700);
          return (
            <div
              key={cls}
              className={`absolute bottom-[24%] -translate-x-1/2 ${cls}`}
            >
              {lifts && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                  {bad ? (
                    <span
                      data-anim="smoke"
                      data-anim-delay={REVEAL_MS + 100}
                      className="block h-5 w-5 rounded-full bg-slate-500/70 opacity-0 blur-[2px]"
                    />
                  ) : (
                    <span
                      data-anim="pop-in"
                      data-anim-delay={liftDelay + 100}
                      className="block opacity-0"
                    >
                      <GlizzyIcon
                        variant={levelUp ? 1 : i}
                        className="h-6 w-10 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]"
                      />
                    </span>
                  )}
                </div>
              )}
              <div
                data-anim={lifts ? 'lift' : undefined}
                data-anim-delay={liftDelay}
                className="relative origin-bottom-left"
              >
                <BowlIcon className="h-10 w-10 rotate-180 drop-shadow-lg" />
              </div>
              {lifts && !bad && (
                <SniffScent
                  direction="up"
                  className="-top-6 left-1/2 -translate-x-1/2"
                />
              )}
            </div>
          );
        })}

        {/* the trainee, nose first */}
        <SceneActor
          character={character}
          className="bottom-[36%] left-1/2 -translate-x-1/2"
          anim="patrol"
          pose="origin-bottom"
        >
          <span
            data-anim="sniff"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2"
          >
            <NoseIcon className="h-6 w-6 text-amber-200 drop-shadow-md" />
          </span>
          {levelUp && <LevelUpBurst delay={REVEAL_MS + 900} />}
          {bad && (
            <span
              data-anim="shake"
              data-anim-delay={REVEAL_MS}
              className="absolute inset-0 rounded-full"
            />
          )}
        </SceneActor>
      </SceneFrame>
    </div>
  );
}

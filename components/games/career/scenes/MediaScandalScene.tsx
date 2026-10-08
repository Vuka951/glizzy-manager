'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const BACKFIRE_MS = 2600;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'fly-page': {
    keyframes: [
      { transform: 'translate(-40px, 30px) rotate(-30deg)', opacity: 0 },
      {
        transform: 'translate(20px, -10px) rotate(10deg)',
        opacity: 1,
        offset: 0.25,
      },
      {
        transform: 'translate(120px, -50px) rotate(50deg)',
        opacity: 1,
        offset: 0.75,
      },
      { transform: 'translate(180px, -90px) rotate(80deg)', opacity: 0 },
    ],
    options: { duration: 2800, iterations: Infinity, easing: 'ease-in-out' },
  },
  swagger: {
    keyframes: [
      { transform: 'rotate(-8deg) translateY(0)' },
      { transform: 'rotate(8deg) translateY(-4px)', offset: 0.5 },
      { transform: 'rotate(-8deg) translateY(0)' },
    ],
    options: { duration: 900, iterations: Infinity, easing: 'ease-in-out' },
  },
  ember: {
    keyframes: [
      { transform: 'translateY(0) scale(1)', opacity: 0 },
      { transform: 'translateY(-14px) scale(1.1)', opacity: 1, offset: 0.25 },
      { transform: 'translateY(-60px) scale(0.3)', opacity: 0 },
    ],
    options: { duration: 1300, iterations: Infinity, easing: 'ease-out' },
  },
  smoke: {
    keyframes: [
      { transform: 'translateY(0) scale(0.5)', opacity: 0 },
      { transform: 'translateY(-20px) scale(1)', opacity: 0.6, offset: 0.3 },
      { transform: 'translateY(-70px) scale(1.8)', opacity: 0 },
    ],
    options: { duration: 2600, iterations: Infinity, easing: 'ease-out' },
  },
};

const PAGES = [
  { cls: 'left-[8%] bottom-[30%]', delay: 0 },
  { cls: 'left-[22%] bottom-[22%]', delay: 900 },
  { cls: 'left-[36%] bottom-[34%]', delay: 1700 },
];
const FLASHES = [
  { cls: 'left-[10%] top-[20%]', delay: 0 },
  { cls: 'right-[10%] top-[26%]', delay: 350 },
  { cls: 'left-[30%] top-[50%]', delay: 650 },
  { cls: 'right-[28%] top-[56%]', delay: 950 },
];
const EMBERS = [
  'left-[40%]',
  'left-[50%]',
  'left-[60%]',
  'left-[46%]',
  'left-[56%]',
];

export default function MediaScandalScene({
  character,
  outcome,
}: ActionSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const bad = outcome === 'bad';
  useSceneAnimation(root, CUSTOM, [outcome]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-red-950 via-slate-900 to-slate-900"
        floor="bg-slate-800/90"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(239,68,68,0.18),transparent_60%)]" />

        {FLASHES.map((f) => (
          <span
            key={f.cls}
            data-anim="flash"
            data-anim-delay={f.delay}
            data-anim-duration={1300}
            className={`absolute z-30 h-12 w-12 rounded-full bg-slate-50 opacity-0 blur-md ${f.cls}`}
          />
        ))}

        {/* tabloid pages caught in the wind */}
        {PAGES.map((p) => (
          <span
            key={p.cls}
            data-anim="fly-page"
            data-anim-delay={p.delay}
            className={`absolute z-10 h-9 w-7 rounded-sm bg-amber-50 opacity-0 shadow-md ${p.cls}`}
          >
            <span className="absolute inset-x-1 top-1 h-1 bg-slate-900" />
            <span className="absolute inset-x-1 top-3 h-px bg-slate-400" />
            <span className="absolute inset-x-1 top-4 h-px bg-slate-400" />
            <span className="absolute inset-x-1 top-5 h-px bg-slate-400" />
          </span>
        ))}

        {/* the culprit, strutting for the cameras */}
        <SceneActor
          character={character}
          className="bottom-[22%] left-1/2 -translate-x-1/2"
          anim={bad ? 'swagger gray-out' : 'swagger'}
          animDelay={bad ? `0 ${BACKFIRE_MS}` : undefined}
          pose="origin-bottom"
        >
          <span className="absolute left-1/2 top-[34%] h-3 w-[86%] -translate-x-1/2 rounded-full bg-slate-950 shadow" />
        </SceneActor>

        {!bad &&
          [
            'right-[16%] bottom-[40%]',
            'right-[26%] bottom-[34%]',
            'right-[10%] bottom-[30%]',
          ].map((cls, i) => (
            <span
              key={cls}
              data-anim="float-up"
              data-anim-delay={600 + i * 500}
              className={`absolute z-30 h-4 w-7 rounded-sm bg-emerald-400 shadow ${cls}`}
            >
              <span className="absolute inset-x-1 top-1/2 h-1.5 -translate-y-1/2 rounded-full border border-emerald-800/60" />
            </span>
          ))}

        {bad && (
          <>
            {EMBERS.map((cls, i) => (
              <span
                key={cls}
                data-anim="ember"
                data-anim-delay={BACKFIRE_MS + i * 240}
                className={`absolute bottom-[24%] z-30 h-3 w-2 rounded-t-full bg-gradient-to-t from-red-500 via-orange-400 to-amber-200 opacity-0 ${cls}`}
              />
            ))}
            {['left-[42%]', 'left-[54%]'].map((cls, i) => (
              <span
                key={cls}
                data-anim="smoke"
                data-anim-delay={BACKFIRE_MS + 400 + i * 900}
                className={`absolute bottom-[40%] z-30 h-8 w-8 rounded-full bg-slate-500/70 opacity-0 blur-sm ${cls}`}
              />
            ))}
            <span
              data-anim="fade-in"
              data-anim-delay={BACKFIRE_MS + 200}
              className="absolute inset-0 z-20 bg-slate-950/50 opacity-0"
            />
          </>
        )}
      </SceneFrame>
    </div>
  );
}

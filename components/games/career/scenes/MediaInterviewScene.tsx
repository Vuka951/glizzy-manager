'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import Icon from '@/components/icons/Icon';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';

const FLASHES = [
  { cls: 'left-[6%] top-[22%]', delay: 0, dur: 2200 },
  { cls: 'right-[8%] top-[30%]', delay: 700, dur: 1900 },
  { cls: 'left-[20%] top-[55%]', delay: 1300, dur: 2500 },
  { cls: 'right-[22%] top-[58%]', delay: 400, dur: 2100 },
];

export default function MediaInterviewScene({ character }: ActionSceneProps) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900"
        floor="bg-slate-800/90"
      >
        {/* the press wall with the league watermark */}
        <div className="absolute inset-x-[10%] top-[6%] grid h-[56%] grid-cols-4 place-items-center rounded-md border border-slate-700/60 bg-slate-900/80 opacity-80">
          {Array.from({ length: 8 }, (_, i) => (
            <GlizzyIcon
              key={i}
              variant={0}
              className="h-4 w-7 opacity-30 grayscale"
            />
          ))}
        </div>

        {/* camera flashes */}
        {FLASHES.map((f) => (
          <span
            key={f.cls}
            data-anim="flash"
            data-anim-delay={f.delay}
            data-anim-duration={f.dur}
            className={`absolute z-30 h-10 w-10 rounded-full bg-slate-50 opacity-0 blur-md ${f.cls}`}
          />
        ))}
        <span
          data-anim="flash"
          data-anim-delay={900}
          data-anim-duration={2300}
          className="pointer-events-none absolute inset-0 z-30 bg-slate-50/20 opacity-0"
        />

        {/* the live badge */}
        <div className="absolute left-3 top-3 z-40 flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-1 shadow-lg">
          <span data-anim="blink" className="h-2 w-2 rounded-full bg-white" />
          <span className="h-1.5 w-6 rounded-full bg-red-300/70" />
        </div>

        {/* the mic stand */}
        <div className="absolute bottom-[18%] left-1/2 z-30 h-[16%] w-1 -translate-x-1/2 bg-slate-500" />
        <div className="absolute bottom-[16%] left-1/2 z-30 h-2 w-10 -translate-x-1/2 rounded-full bg-slate-600" />
        <span className="absolute bottom-[31%] left-1/2 z-30 -translate-x-1/2">
          <Icon
            name="microphone"
            className="h-7 w-7 text-slate-200 drop-shadow"
          />
        </span>

        {/* the interviewee, nodding along */}
        <SceneActor
          character={character}
          className="bottom-[26%] left-1/2 -translate-x-1/2"
          anim="nod"
          pose="origin-bottom"
        />

        {/* the press pit: three heads with notepads */}
        {['left-[10%]', 'left-[26%]', 'right-[12%]'].map((cls, i) => (
          <div key={cls} className={`absolute bottom-[10%] z-40 ${cls}`}>
            <span className="block h-10 w-10 rounded-full bg-slate-700 ring-2 ring-slate-950/70" />
            <span
              data-anim="scribble"
              data-anim-delay={i * 90}
              className="absolute -right-3 top-3 h-5 w-4 origin-bottom-left rounded-sm bg-slate-100 shadow"
            >
              <span className="absolute inset-x-0.5 top-1 h-px bg-slate-400" />
              <span className="absolute inset-x-0.5 top-2 h-px bg-slate-400" />
              <span className="absolute inset-x-0.5 top-3 h-px bg-slate-400" />
            </span>
          </div>
        ))}

        <div className="absolute inset-x-0 bottom-0 z-50 h-4 border-t border-sky-300/30 bg-slate-950/90" />
      </SceneFrame>
    </div>
  );
}

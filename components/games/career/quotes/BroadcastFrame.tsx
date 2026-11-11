'use client';

import { useRef } from 'react';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import Icon from '@/components/icons/Icon';
import { GAMES_UI } from '@/data/games/locale';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const QUOTE = GAMES_UI.career.quoteCutscene;

const BUMPER_MS = 950;
// Past this many characters the headline steps down a size so a long name
// still fits the lower third in two lines
const LONG_HEADLINE_CHARS = 28;
const LOWER_THIRD_AT_MS = 820;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  'power-on': {
    keyframes: [
      { transform: 'scaleY(0.02)', opacity: 1 },
      { transform: 'scaleY(1)', opacity: 0.8, offset: 0.45 },
      { transform: 'scaleY(1)', opacity: 0 },
    ],
    options: { duration: 380, easing: 'ease-out', fill: 'both' },
  },
  'bumper-cover': {
    keyframes: [
      { opacity: 1, clipPath: 'inset(0 0 0 0)' },
      { opacity: 1, clipPath: 'inset(0 0 0 0)', offset: 0.78 },
      { opacity: 1, clipPath: 'inset(0 0 0 100%)' },
    ],
    options: {
      duration: BUMPER_MS,
      easing: 'cubic-bezier(0.6, 0, 0.8, 0.4)',
      fill: 'both',
    },
  },
  'bumper-band': {
    keyframes: [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
    options: {
      duration: 220,
      delay: 60,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  'bumper-slam': {
    keyframes: [
      { transform: 'scale(2.6)', opacity: 0 },
      { transform: 'scale(0.94)', opacity: 1, offset: 0.7 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    options: {
      duration: 320,
      delay: 140,
      easing: 'cubic-bezier(0.3, 0, 0.2, 1)',
      fill: 'both',
    },
  },
  'bumper-jolt': {
    keyframes: [
      { transform: 'translate(0, 0)' },
      { transform: 'translate(-3px, 2px)' },
      { transform: 'translate(3px, -2px)' },
      { transform: 'translate(0, 0)' },
    ],
    options: { duration: 160, delay: 360, easing: 'linear' },
  },
  'lower-third-in': {
    keyframes: [
      { transform: 'translateX(-105%)' },
      { transform: 'translateX(0)' },
    ],
    options: {
      duration: 420,
      delay: LOWER_THIRD_AT_MS,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
    },
  },
  ticker: {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-50%)' },
    ],
    options: { duration: 16000, iterations: Infinity, easing: 'linear' },
  },
};

// A breaking news interrupt around a quote scene: the bumper slams in over
// the picture while the line is still waiting, then the live bug, the lower
// third with the scene's headline, the subtitle box that carries the line
// and the ticker
export default function BroadcastFrame({
  children,
  headline,
  subtitle,
  ticker = QUOTE.ticker,
}: {
  children: React.ReactNode;
  headline?: string;
  subtitle?: React.ReactNode;
  ticker?: string[];
}) {
  const overlay = useRef<HTMLDivElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  useSceneAnimation(overlay, CUSTOM);
  useSceneAnimation(chrome, CUSTOM);
  const title = headline || GAMES_UI.cup.studio.title;
  const tickerItems = [title, ...ticker, title, ...ticker];

  return (
    <div className="relative bg-slate-950">
      <div className="relative isolate">
        {children}
        <div
          ref={overlay}
          className="pointer-events-none absolute inset-0 z-[60] overflow-hidden"
        >
          <div
            data-anim="bumper-cover"
            className="absolute inset-0 flex items-center justify-center bg-slate-950/90 opacity-0"
          >
            <div
              data-anim="bumper-band"
              className="absolute inset-x-[-8%] top-1/2 h-[42%] origin-left -translate-y-1/2 -rotate-3 bg-red-600 shadow-[0_3px_0_#7f1d1d,0_-3px_0_#7f1d1d]"
            />
            <div
              data-anim="bumper-jolt"
              className="relative flex flex-col items-center gap-1.5"
            >
              <span className="h-0.5 w-3/4 bg-slate-50/80" />
              <span
                data-anim="bumper-slam"
                className="whitespace-nowrap font-sign text-4xl font-extrabold uppercase italic tracking-tight text-slate-50 drop-shadow-[0_3px_0_rgba(2,6,23,0.7)] sm:text-6xl"
              >
                {QUOTE.breaking}
              </span>
              <span className="h-0.5 w-3/4 bg-slate-50/80" />
            </div>
          </div>

          <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-[2px] bg-red-600 px-1.5 py-0.5 font-sign text-[12px] font-bold uppercase leading-tight tracking-[0.1em] text-slate-50 shadow-[0_2px_0_rgb(2_6_23/0.7)] sm:left-3 sm:top-3 sm:px-2 sm:text-[13px]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-50" />
            {GAMES_UI.cup.studio.live}
          </span>

          <div
            data-anim="power-on"
            className="absolute inset-0 bg-slate-50 opacity-0"
          />
        </div>
      </div>

      <div ref={chrome} className="relative z-10 -mt-3 overflow-hidden">
        <div
          data-anim="lower-third-in"
          className="flex items-stretch pr-3 shadow-[0_-2px_0_rgb(2_6_23/0.7)] sm:pr-6"
        >
          <span className="flex shrink-0 items-center bg-red-600 px-2.5 py-1 font-sign text-[13px] font-extrabold uppercase italic leading-none tracking-[0.08em] text-slate-50 sm:px-3 sm:text-sm">
            {QUOTE.breaking}
          </span>
          <span
            className={`line-clamp-2 min-w-0 flex-1 text-balance bg-slate-100 px-3 py-1 font-sign font-bold uppercase leading-tight text-slate-950 ${
              title.length > LONG_HEADLINE_CHARS
                ? 'text-[12px] tracking-normal sm:text-[14px] sm:tracking-wide'
                : 'text-[14px] tracking-wide sm:text-[16px]'
            }`}
          >
            {title}
          </span>
        </div>

        <div className="flex min-h-[4.5rem] items-center border-l-4 border-red-600 bg-slate-900 px-3 py-2 sm:px-4">
          {subtitle}
        </div>

        <div className="flex h-6 items-stretch border-t border-red-600/60 bg-slate-950">
          <span className="z-10 flex shrink-0 items-center bg-red-600 px-2 text-slate-50">
            <Icon name="trophy" className="h-3 w-3" />
          </span>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div data-anim="ticker" className="flex h-full w-max">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  aria-hidden={copy === 1}
                  className="flex h-full items-center"
                >
                  {tickerItems.map((item, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-3 whitespace-nowrap pl-3 pr-3 font-sign text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-300"
                    >
                      <span className="h-1.5 w-1.5 bg-red-500" />
                      {item}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRef } from 'react';
import SceneActor from '@/components/games/career/scenes/SceneActor';
import SceneFrame from '@/components/games/career/scenes/SceneFrame';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import ActionIcon from '@/components/icons/ActionIcon';
import BowlIcon from '@/components/icons/BowlIcon';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import type { InvestmentId } from '@/data/games/careerInvestments';
import type { ActionSceneProps } from '@/lib/constants/careerScenes';
import type { SceneAnimationSpec } from '@/lib/constants/sceneAnimations';

const SIGN_MS = 1600;
const SIGN_DELAY = 900;

const CUSTOM: Record<string, SceneAnimationSpec> = {
  sign: {
    keyframes: [{ strokeDashoffset: 180 }, { strokeDashoffset: 0 }],
    options: {
      duration: SIGN_MS,
      easing: 'ease-in-out',
      fill: 'both',
      delay: SIGN_DELAY,
    },
  },
  pen: {
    keyframes: [
      {
        transform: 'translate(-30px, -20px) rotate(-30deg)',
        opacity: 0,
        offset: 0,
      },
      { transform: 'translate(0, 0) rotate(-30deg)', opacity: 1, offset: 0.2 },
      {
        transform: 'translate(14px, 6px) rotate(-26deg)',
        opacity: 1,
        offset: 0.45,
      },
      {
        transform: 'translate(34px, -4px) rotate(-34deg)',
        opacity: 1,
        offset: 0.7,
      },
      {
        transform: 'translate(58px, 2px) rotate(-30deg)',
        opacity: 1,
        offset: 0.9,
      },
      {
        transform: 'translate(80px, -30px) rotate(-30deg)',
        opacity: 0,
        offset: 1,
      },
    ],
    options: {
      duration: SIGN_MS + 700,
      easing: 'ease-in-out',
      fill: 'both',
      delay: SIGN_DELAY - 300,
    },
  },
  coin: {
    keyframes: [
      { transform: 'translate(0, 0) rotateY(0deg)', opacity: 0 },
      {
        transform: 'translate(20px, -26px) rotateY(180deg)',
        opacity: 1,
        offset: 0.35,
      },
      {
        transform: 'translate(64px, 6px) rotateY(540deg)',
        opacity: 1,
        offset: 0.85,
      },
      { transform: 'translate(64px, 6px) rotateY(540deg)', opacity: 0 },
    ],
    options: { duration: 1300, easing: 'ease-in-out', fill: 'both' },
  },
  seal: {
    keyframes: [
      { transform: 'rotate(-14deg) scale(2.4)', opacity: 0 },
      { transform: 'rotate(-14deg) scale(1)', opacity: 1 },
    ],
    options: {
      duration: 320,
      easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
      fill: 'both',
      delay: SIGN_DELAY + SIGN_MS + 200,
    },
  },
};

function InvestmentEmblem({ id }: { id: InvestmentId }) {
  if (id === 'security')
    return <ActionIcon kind="guard" className="h-7 w-7 text-emerald-700" />;
  if (id === 'spa') {
    return (
      <span className="relative block">
        <BowlIcon className="h-7 w-7" />
        <span
          data-anim="drift"
          className="absolute -top-2 left-2 h-2 w-2 rounded-full bg-slate-200/80"
        />
      </span>
    );
  }
  if (id === 'assistant') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect
          x="5"
          y="3"
          width="14"
          height="18"
          rx="2"
          className="fill-emerald-700"
        />
        <rect
          x="9"
          y="1.5"
          width="6"
          height="3"
          rx="1"
          className="fill-emerald-900"
        />
        <path
          d="M8 9h8M8 12.5h8M8 16h5"
          className="stroke-emerald-100"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path
        d="M12 4c-5 0-8 4-8 8s3 8 8 8 8-4 8-8-3-8-8-8z"
        className="fill-emerald-700"
      />
      <circle cx="12" cy="12" r="4" className="fill-emerald-100" />
      <circle cx="12" cy="12" r="1.8" className="fill-emerald-950" />
      <path
        d="M3 12h2M19 12h2M12 3v2M12 19v2"
        className="stroke-emerald-700"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function InvestScene({
  character,
  investmentId,
}: ActionSceneProps & { investmentId: InvestmentId }) {
  const root = useRef<HTMLDivElement | null>(null);
  useSceneAnimation(root, CUSTOM, [investmentId]);

  return (
    <div ref={root}>
      <SceneFrame
        indoor="bg-gradient-to-b from-slate-900 via-emerald-950/40 to-slate-900"
        floor="bg-amber-950"
      >
        {/* the office: a framed diploma and a plant */}
        <div className="absolute left-[8%] top-[10%] h-12 w-16 rounded-sm border-2 border-amber-700 bg-amber-50/90">
          <span className="absolute inset-x-2 top-2 h-1 bg-slate-900/70" />
          <span className="absolute inset-x-2 top-4 h-px bg-slate-400" />
          <span className="absolute inset-x-2 top-5 h-px bg-slate-400" />
          <span className="absolute bottom-1 right-2 h-3 w-3 rounded-full bg-red-600" />
        </div>
        <div className="absolute bottom-[18%] right-[6%] h-8 w-8 rounded-t-sm rounded-b-lg bg-amber-800" />
        <span
          data-anim="sway"
          className="absolute bottom-[28%] right-[6%] block h-12 w-8 origin-bottom rounded-[50%_50%_0_0] bg-emerald-600"
        />

        {/* the desk */}
        <div className="absolute inset-x-[10%] bottom-[18%] h-6 rounded-t-md bg-gradient-to-b from-amber-800 to-amber-950 shadow-xl" />

        {/* the contract sliding onto the desk, then signed and sealed */}
        <div
          data-anim="rise-in"
          className="absolute bottom-[26%] left-[36%] z-20 h-28 w-40 rounded-sm bg-amber-50 p-2 opacity-0 shadow-2xl"
        >
          <span className="block h-1.5 w-[55%] rounded-full bg-slate-800" />
          <span className="mt-1.5 block h-px w-full bg-slate-300" />
          <span className="mt-1 block h-px w-[90%] bg-slate-300" />
          <span className="mt-1 block h-px w-[95%] bg-slate-300" />
          <span className="mt-1 block h-px w-[70%] bg-slate-300" />
          <svg
            viewBox="0 0 120 30"
            className="absolute bottom-3 left-2 h-8 w-28"
            aria-hidden="true"
          >
            <path
              data-anim="sign"
              d="M4 22c8-14 14-14 12 0s8-20 16-6 4 14 12 2 10-14 14 0 2 12 12 4 8-8 20-10 10 4 22 2"
              className="fill-none stroke-sky-900"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="180"
            />
          </svg>
          <span
            data-anim="seal"
            className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-full border-4 border-emerald-700 bg-emerald-100 opacity-0 shadow-lg"
          >
            <InvestmentEmblem id={investmentId} />
          </span>
        </div>
        <svg
          data-anim="pen"
          viewBox="0 0 12 40"
          className="absolute bottom-[34%] left-[40%] z-30 h-10 w-3 origin-bottom opacity-0 drop-shadow"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="2"
            width="6"
            height="28"
            rx="2"
            className="fill-slate-900"
          />
          <path d="M3 30l3 9 3-9z" className="fill-amber-300" />
          <rect x="3" y="2" width="6" height="5" className="fill-red-600" />
        </svg>

        {/* the investor, coins sliding over */}
        <SceneActor
          character={character}
          className="bottom-[26%] left-[10%]"
          anim="nod"
          pose="origin-bottom"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              data-anim="coin"
              data-anim-delay={200 + i * 260}
              className="absolute bottom-2 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-600 bg-amber-300 opacity-0 shadow"
            >
              <GlizzyIcon variant={0} className="h-2 w-3.5" />
            </span>
          ))}
        </SceneActor>
      </SceneFrame>
    </div>
  );
}

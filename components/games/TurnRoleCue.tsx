import type { Ref } from 'react';
import BubbleTail from '@/components/games/BubbleTail';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import { GAMES_UI } from '@/data/games/locale';

export type TurnRole = 'placing' | 'guessing';

export default function TurnRoleCue({
  role,
  glizzyVariant,
  glizzies = 1,
  glizzyRef,
  compact = false,
  tailSide,
  className = '',
}: {
  role: TurnRole;
  glizzyVariant: number;
  // Sudden death hides two at once
  glizzies?: 1 | 2;
  glizzyRef?: Ref<HTMLDivElement>;
  compact?: boolean;
  tailSide: 'left' | 'right';
  className?: string;
}) {
  const placing = role === 'placing';

  return (
    <div
      data-turn-role={role}
      className={`pointer-events-none z-30 ${className}`}
      aria-label={placing ? GAMES_UI.duel.roles.placing : GAMES_UI.duel.roles.guessing}
    >
      <span
        className={`relative flex items-center justify-center gap-0.5 rounded-full border shadow-md backdrop-blur-sm ${
          compact
            ? glizzies === 2
              ? 'h-6 w-12'
              : 'h-6 w-8'
            : glizzies === 2
              ? 'h-7 w-14'
              : 'h-7 w-9'
        } ${tailSide === 'left' ? 'pr-1.5' : 'pl-1.5'} ${
          placing
            ? 'border-amber-300/50 bg-amber-950/90'
            : 'border-cyan-300/50 bg-slate-950/90'
        }`}
      >
        <BubbleTail
          side={tailSide}
          className={
            placing
              ? 'fill-amber-950 stroke-amber-300/50'
              : 'fill-slate-950 stroke-cyan-300/50'
          }
        />
        {placing ? (
          <>
            <div
              ref={glizzyRef}
              data-role-glizzy
              className="relative z-10 animate-spin [animation-duration:1.8s] motion-reduce:animate-none"
            >
              <GlizzyIcon
                variant={glizzyVariant}
                className={`-translate-y-px ${compact ? 'h-3.5 w-5' : 'h-4 w-6'}`}
              />
            </div>
            {glizzies === 2 && (
              <div className="relative z-10 animate-spin [animation-delay:-0.9s] [animation-duration:1.8s] motion-reduce:animate-none">
                <GlizzyIcon
                  variant={glizzyVariant}
                  className={`-translate-y-px ${compact ? 'h-3.5 w-5' : 'h-4 w-6'}`}
                />
              </div>
            )}
          </>
        ) : (
          <span className="flex translate-y-px items-center gap-0.5">
            <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-200 [animation-duration:1s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-200 [animation-delay:120ms] [animation-duration:1s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-cyan-200 [animation-delay:240ms] [animation-duration:1s]" />
          </span>
        )}
      </span>
    </div>
  );
}

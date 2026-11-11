'use client';

import CareerIconButton from '@/components/games/career/CareerIconButton';
import { useCareerFrames } from '@/components/games/career/careerFrames';
import StreetModal from '@/components/games/career/street/StreetModal';
import Icon from '@/components/icons/Icon';
import { GAMES_UI } from '@/data/games/locale';

// Overlay panel every game opens its secondary screens in: settings, info
// and purchase dialogs sit on top of the scene instead of stacking below it.
// The career and Rivals hang theirs on the street board; the Duel and the Cup
// keep the frosted panel
export default function GameModal({
  title,
  wide = false,
  board = false,
  flush = false,
  titleExtra,
  headerExtra,
  stripe,
  badge,
  onClose,
  children,
}: {
  title: string;
  wide?: boolean;
  // One fixed size whatever the content, wider on large screens, so tabbed
  // panels do not jump; the body is laid out to fill it and scrolls itself
  board?: boolean | 'tall';
  // Sits beside the title; headerExtra sits at the far right by the close
  titleExtra?: React.ReactNode;
  headerExtra?: React.ReactNode;
  // The body is one object filling the board edge to edge, street look only
  flush?: boolean;
  // A sponsor's colours painted along the board's seam, street look only
  stripe?: string;
  badge?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const street = useCareerFrames() === 'street';
  if (street) {
    return (
      <StreetModal
        title={title}
        wide={wide}
        board={board}
        flush={flush}
        titleExtra={titleExtra}
        headerExtra={headerExtra}
        stripe={stripe}
        badge={badge}
        onClose={onClose}
      >
        {children}
      </StreetModal>
    );
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <button
        aria-label={GAMES_UI.shared.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300 starting:opacity-0"
      />
      <div
        className={`relative z-10 w-full rounded-3xl border border-frost-border/40 bg-slate-900 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.85),inset_0_1px_0_rgb(255_255_255/0.06)] transition-[opacity,translate,scale] duration-300 ease-out starting:translate-y-4 starting:scale-[0.97] starting:opacity-0 motion-reduce:transition-none ${
          board
            ? 'flex h-[calc(100dvh/var(--game-zoom,1)_-_9rem)] max-w-sm flex-col overflow-hidden lg:h-[min(calc(100dvh/var(--game-zoom,1)_-_9rem),34rem)] lg:max-w-4xl phone-landscape:h-[calc(100dvh/var(--game-zoom,1)_-_1.5rem)] phone-landscape:max-w-2xl'
            : `max-h-[calc(85vh/var(--game-zoom,1))] phone-landscape:max-h-[calc(100dvh/var(--game-zoom,1)_-_1.5rem)] overflow-y-auto overflow-x-hidden ${wide ? 'max-w-2xl' : 'max-w-sm'}`
        }`}
      >
        <div
          className={`relative p-4 sm:p-5 ${board ? 'flex min-h-0 flex-1 flex-col' : ''}`}
        >
          <div
            className="relative mb-4 flex items-center gap-2.5"
          >
            {badge && (
              <span className="flex shrink-0 items-center rounded-full bg-slate-950/60 p-1 ring-1 ring-frost-border/20">
                {badge}
              </span>
            )}
            <span
              className={`min-w-0 font-black leading-tight tracking-tight [overflow-wrap:anywhere] ${headerExtra ? 'text-sm sm:text-lg' : 'text-base sm:text-lg'} text-sky-200 [text-shadow:0_0_14px_color-mix(in_srgb,currentColor_40%,transparent)] `}
            >
              {title}
            </span>
            {titleExtra && (
              <span className="flex shrink-0 items-center">{titleExtra}</span>
            )}
            {headerExtra && (
              <span className="ml-auto min-w-0">{headerExtra}</span>
            )}
            <CareerIconButton
              label={GAMES_UI.shared.close}
              onClick={onClose}
              className={headerExtra ? '' : 'ml-auto'}
            >
              <Icon name="close" className="h-3.5 w-3.5" />
            </CareerIconButton>
          </div>
          <div className={`relative ${board ? 'min-h-0 flex-1' : ''}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

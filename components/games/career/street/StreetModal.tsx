'use client';

import { useRef } from 'react';
import CareerIconButton from '@/components/games/career/CareerIconButton';
import StreetBoard from '@/components/games/career/street/StreetBoard';
import StreetSignPlate from '@/components/games/career/street/StreetSignPlate';
import useBoardFocus from '@/components/games/career/street/useBoardFocus';
import Icon from '@/components/icons/Icon';
import { GAMES_UI } from '@/data/games/locale';
import { WOOD_PLANKS } from '@/lib/utils/careerFrameClasses';

// A secondary screen of the career: the town stays in sight behind a dimmed
// street, and the board takes the place of a floating card
export default function StreetModal({
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
  board?: boolean | 'tall';
  flush?: boolean;
  titleExtra?: React.ReactNode;
  headerExtra?: React.ReactNode;
  stripe?: string;
  badge?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  useBoardFocus(boardRef, onClose);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 pt-6">
      <button
        aria-label={GAMES_UI.shared.close}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#060912]/75 transition-opacity duration-200 starting:opacity-0"
      />
      <StreetBoard
        ref={boardRef}
        dialogLabel={title}
        className={`z-10 flex w-full flex-col transition-[opacity,translate] duration-200 ease-out starting:-translate-y-3 starting:opacity-0 motion-reduce:transition-none ${
          board
            ? `h-[calc(100dvh/var(--game-zoom,1)_-_10rem)] max-w-sm lg:max-w-4xl phone-landscape:h-[calc(100dvh/var(--game-zoom,1)_-_2.25rem)] phone-landscape:max-w-2xl ${
                board === 'tall'
                  ? 'lg:h-[min(calc(100dvh/var(--game-zoom,1)_-_10rem),40rem)]'
                  : 'lg:h-[min(calc(100dvh/var(--game-zoom,1)_-_10rem),36rem)]'
              }`
            : `max-h-[calc(80vh/var(--game-zoom,1))] phone-landscape:max-h-[calc(100dvh/var(--game-zoom,1)_-_2.25rem)] ${wide ? 'max-w-2xl' : 'max-w-sm'}`
        }`}
      >
        <div
          className={`relative flex shrink-0 items-center gap-2 px-1.5 pb-2.5 sm:gap-2.5 ${headerExtra ? 'flex-wrap sm:flex-nowrap' : ''}`}
        >
          <StreetSignPlate badge={badge}>{title}</StreetSignPlate>
          {titleExtra && (
            <span className="flex shrink-0 items-center">{titleExtra}</span>
          )}
          {headerExtra && (
            <span className="order-last ml-auto w-full min-w-0 rounded-[4px] bg-[#1f140b] px-2 py-1 shadow-[inset_0_1px_3px_rgb(0_0_0/0.8),0_1px_0_rgb(255_255_255/0.08)] sm:order-none sm:w-auto">
              {headerExtra}
            </span>
          )}
          {stripe && (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 bottom-0.5 h-[3px] opacity-90 ${stripe}`}
            />
          )}
          <CareerIconButton
            label={GAMES_UI.shared.close}
            size="lg"
            onClick={onClose}
            className={`ml-auto pointer-coarse:-my-1 pointer-coarse:h-11 pointer-coarse:w-11 ${headerExtra ? 'sm:ml-0' : ''}`}
          >
            <Icon name="close" className="h-4 w-4" />
          </CareerIconButton>
        </div>
        <div
          className={`relative flex min-h-0 flex-1 flex-col rounded-[4px] border-t-[3px] border-[#b8862f] shadow-[inset_0_3px_8px_rgb(0_0_0/0.55)] ${WOOD_PLANKS}`}
        >
          <div
            className={`relative min-h-0 flex-1 ${flush ? '' : 'p-3 sm:p-3.5'} ${board ? 'flex flex-col' : 'overflow-y-auto overflow-x-hidden'}`}
          >
            {children}
          </div>
        </div>
      </StreetBoard>
    </div>
  );
}

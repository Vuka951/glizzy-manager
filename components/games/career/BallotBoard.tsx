'use client';

import { useRef } from 'react';
import CareerIconButton from '@/components/games/career/CareerIconButton';
import StreetBoard from '@/components/games/career/street/StreetBoard';
import StreetSignPlate from '@/components/games/career/street/StreetSignPlate';
import useBoardFocus from '@/components/games/career/street/useBoardFocus';
import Icon from '@/components/icons/Icon';
import { GAMES_UI } from '@/data/games/locale';
import { WOOD_PLANKS } from '@/lib/utils/careerFrameClasses';

// The board a vote or a state decree is posted on, over the dimmed street. A
// vote cannot be walked away from, so only a dialog with onClose gets a close
// key and a backdrop that closes it. The body scrolls, the footer stays
export default function BallotBoard({
  title,
  badge,
  aside,
  seam,
  width = 'max-w-2xl',
  onClose,
  footer,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  aside?: React.ReactNode;
  seam?: React.ReactNode;
  width?: string;
  onClose?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  useBoardFocus(boardRef, onClose);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 pt-6">
      {onClose ? (
        <button
          aria-label={GAMES_UI.shared.close}
          tabIndex={-1}
          onClick={onClose}
          className="absolute inset-0 cursor-default bg-[#060912]/75"
        />
      ) : (
        <div className="absolute inset-0 bg-[#060912]/75" />
      )}
      <StreetBoard
        ref={boardRef}
        dialogLabel={title}
        className={`z-10 flex max-h-[calc(92dvh/var(--game-zoom,1))] w-full flex-col text-left transition-[opacity,translate] duration-200 ease-out starting:-translate-y-3 starting:opacity-0 motion-reduce:transition-none phone-landscape:max-h-[calc(100dvh/var(--game-zoom,1)_-_2.25rem)] ${width}`}
      >
        <div className="relative flex shrink-0 items-center gap-2 px-1.5 pb-2.5 sm:gap-2.5">
          <StreetSignPlate badge={badge}>{title}</StreetSignPlate>
          {(aside || onClose) && (
            <span className="ml-auto flex shrink-0 items-center gap-1.5">
              {aside}
              {onClose && (
                <CareerIconButton
                  label={GAMES_UI.shared.close}
                  size="lg"
                  onClick={onClose}
                  className="pointer-coarse:-my-1 pointer-coarse:h-11 pointer-coarse:w-11"
                >
                  <Icon name="close" className="h-4 w-4" />
                </CareerIconButton>
              )}
            </span>
          )}
          {seam}
        </div>
        <div
          className={`relative flex min-h-0 flex-1 flex-col rounded-[4px] border-t-[3px] border-[#b8862f] shadow-[inset_0_3px_8px_rgb(0_0_0/0.55)] ${WOOD_PLANKS}`}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden p-3 sm:p-3.5">
            {children}
          </div>
          {footer && (
            <div className="flex shrink-0 flex-col gap-2 border-t-2 border-[#1f140b] p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.07)] sm:px-3.5">
              {footer}
            </div>
          )}
        </div>
      </StreetBoard>
    </div>
  );
}

'use client';

import { useState } from 'react';
import GameModal from '@/components/games/GameModal';
import CareerButton from '@/components/games/career/CareerButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import { GAMES_UI } from '@/data/games/locale';

const C = GAMES_UI.rooms.close;

// The host's kill switch: the button opens a confirm modal, the modal closes
// the room for everyone
export default function CloseRoomButton({
  confirm,
  hint,
  onClose,
  busy = false,
}: {
  // The question the confirm modal asks, in the game's own words
  confirm: string;
  hint?: string;
  onClose: () => void;
  busy?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <CareerButton
        tone="danger"
        title={hint}
        onClick={() => setConfirming(true)}
        className="min-h-11"
      >
        {C.button}
      </CareerButton>
      {confirming && (
        <GameModal title={C.button} onClose={() => setConfirming(false)}>
          <div className="flex flex-col items-center gap-3">
            <PaperSheet className="w-full px-4 py-3 text-center font-serif text-[15px] font-semibold text-slate-200">
              {confirm}
            </PaperSheet>
            <div className="flex flex-wrap justify-center gap-2">
              <CareerButton
                tone="danger"
                disabled={busy}
                onClick={() => {
                  setConfirming(false);
                  onClose();
                }}
                className="min-h-11"
              >
                {C.yes}
              </CareerButton>
              <CareerButton
                tone="quiet"
                onClick={() => setConfirming(false)}
                className="min-h-11"
              >
                {C.no}
              </CareerButton>
            </div>
          </div>
        </GameModal>
      )}
    </>
  );
}

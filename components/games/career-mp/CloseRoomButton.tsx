'use client';

import { useState } from 'react';
import GameModal from '@/components/games/GameModal';
import { GAMES_UI } from '@/data/games/locale';

const C = GAMES_UI.careerMp.close;

// The host's kill switch: the button opens a confirm modal, the modal closes
// the room for everyone; on paper the button is printed in ink, elsewhere it
// sits on the dark card
export default function CloseRoomButton({
  onClose,
  busy = false,
  onPaper = false,
}: {
  onClose: () => void;
  busy?: boolean;
  onPaper?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        title={C.hint}
        className={`text-[11px] font-bold transition ${
          onPaper
            ? 'text-red-700 underline decoration-red-700/40 underline-offset-4 hover:text-red-900'
            : 'rounded-lg border border-red-400/25 bg-slate-900/60 px-3 py-1 uppercase tracking-widest text-red-200 hover:border-red-300/60 hover:text-white'
        }`}
      >
        {C.button}
      </button>
      {confirming && (
        <GameModal title={C.button} onClose={() => setConfirming(false)}>
          <div className="flex flex-col items-center gap-3">
            <p className="text-center text-sm font-semibold text-red-200">
              {C.confirm}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                disabled={busy}
                onClick={() => {
                  setConfirming(false);
                  onClose();
                }}
                className="rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-semibold text-red-200 transition hover:border-red-500/60 hover:text-white disabled:opacity-50"
              >
                {C.yes}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-4 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-sky-200/40 hover:text-white"
              >
                {C.no}
              </button>
            </div>
          </div>
        </GameModal>
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameModal from '@/components/games/GameModal';
import { GAMES_UI } from '@/data/games/locale';
import { RIVALS_PATH } from '@/lib/constants/routes';

const MP = GAMES_UI.careerMp;
export const CLOSED_PARAM = 'closed';

// A room the host shut sends its coaches back here with a flag in the
// address; the flag opens this notice once and is dropped on dismissal
export default function RoomClosedNotice() {
  const router = useRouter();
  const params = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !params.has(CLOSED_PARAM)) return null;
  const dismiss = () => {
    setDismissed(true);
    router.replace(RIVALS_PATH);
  };
  return (
    <GameModal title={MP.lobby.title} onClose={dismiss}>
      <div className="flex flex-col items-center gap-3">
        <p className="text-center text-sm font-semibold text-slate-200">
          {MP.close.closed}
        </p>
        <button
          onClick={dismiss}
          className="rounded-lg border border-sky-200/20 bg-slate-800/60 px-4 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-sky-200/40 hover:text-white"
        >
          {GAMES_UI.shared.close}
        </button>
      </div>
    </GameModal>
  );
}

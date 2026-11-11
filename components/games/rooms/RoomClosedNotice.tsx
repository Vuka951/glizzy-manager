'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import GameModal from '@/components/games/GameModal';
import CareerButton from '@/components/games/career/CareerButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import { GAMES_UI } from '@/data/games/locale';
import { ROOM_CLOSED_PARAM } from '@/lib/constants/rooms';

// A room the host shut sends its seats back to the lobby with a flag in the
// address; the flag opens this notice once and is dropped on dismissal
export default function RoomClosedNotice({
  lobbyPath,
  title,
}: {
  lobbyPath: string;
  title: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || !params.has(ROOM_CLOSED_PARAM)) return null;
  const dismiss = () => {
    setDismissed(true);
    router.replace(lobbyPath);
  };
  return (
    <GameModal title={title} onClose={dismiss}>
      <div className="flex flex-col items-center gap-3">
        <PaperSheet className="w-full px-4 py-3 text-center font-serif text-[15px] font-semibold text-slate-200">
          {GAMES_UI.rooms.close.closed}
        </PaperSheet>
        <CareerButton tone="quiet" onClick={dismiss} className="min-h-11">
          {GAMES_UI.shared.close}
        </CareerButton>
      </div>
    </GameModal>
  );
}

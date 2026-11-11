'use client';

import { useState } from 'react';
import GameModal from '@/components/games/GameModal';
import BracketGuidePanel from '@/components/games/career/BracketGuidePanel';
import InfoButton from '@/components/games/career/InfoButton';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';

const G = GAMES_UI.career.table.bracketGuide;

export default function BracketGuideButton({
  order,
  characterBySlug,
  playerSlug,
}: {
  order: string[];
  characterBySlug: Map<string, DuelCharacter>;
  playerSlug: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <InfoButton label={G.button} onClick={() => setOpen(true)} />
      {open && (
        <GameModal title={G.title} wide onClose={() => setOpen(false)}>
          <BracketGuidePanel
            order={order}
            characterBySlug={characterBySlug}
            playerSlug={playerSlug}
          />
        </GameModal>
      )}
    </>
  );
}

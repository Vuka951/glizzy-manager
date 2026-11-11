'use client';

import { useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import CareerIconButton from '@/components/games/career/CareerIconButton';
import ActionReceipt, {
  type ActionReceiptToast,
} from '@/components/games/career/ActionReceipt';
import GamesScale from '@/components/games/GamesScale';
import SponsorModal from '@/components/games/career/SponsorModal';
import TownCalendarCompactRow from '@/components/games/career/town/TownCalendarCompactRow';
import TownHudRail from '@/components/games/career/town/TownHudRail';
import Icon from '@/components/icons/Icon';
import { GAMES_UI } from '@/data/games/locale';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { fullscreenHost, subscribeFullscreen } from '@/lib/utils/fullscreen';
import { effectiveZoom } from '@/lib/utils/zoom';

const TOWN = GAMES_UI.career.town;

// The running quarter under the top bar on a walnut rail, with the window's
// log of receipts one tap away beside it. The log opens on the page's
// fullscreen host, since the town stage contains anything fixed inside it
export default function TownCalendarRow({
  career,
  compact = false,
  receipts = [],
}: {
  career: SavedCareer;
  compact?: boolean;
  receipts?: ActionReceiptToast[];
}) {
  const [logOpen, setLogOpen] = useState(false);
  const host = useSyncExternalStore(
    subscribeFullscreen,
    fullscreenHost,
    () => null,
  );
  const sponsorId =
    career.characters[career.playerSlug]?.sponsor?.sponsorId ?? null;
  const log = (
    <SponsorModal
      sponsorId={sponsorId}
      title={TOWN.log}
      onClose={() => setLogOpen(false)}
    >
      <div className="flex flex-col gap-3 pb-1">
        {receipts.map((receipt, i) => (
          <ActionReceipt key={receipts.length - i} toast={receipt} />
        ))}
      </div>
    </SponsorModal>
  );
  return (
    <TownHudRail
      className={`flex items-center gap-1.5 py-1.5 ${
        compact ? 'w-full px-2.5 min-[380px]:px-3.5' : 'mx-auto w-fit px-3.5'
      }`}
    >
      <div className="min-w-0 flex-1">
        <TownCalendarCompactRow career={career} stretch={compact} />
      </div>
      <CareerIconButton
        label={TOWN.log}
        size="lg"
        onClick={() => setLogOpen(true)}
        disabled={receipts.length === 0}
        className="relative"
      >
        <Icon name="scroll" className="h-4 w-4" />
        {receipts.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-b from-[#e8c066] to-[#a8782a] px-1 font-sign text-[12px] font-bold leading-none tabular-nums text-[#2a1a0a] shadow-[0_1px_0_rgb(0_0_0/0.6)]">
            {receipts.length}
          </span>
        )}
      </CareerIconButton>
      {logOpen &&
        host &&
        createPortal(
          effectiveZoom(host) === 1 ? <GamesScale>{log}</GamesScale> : log,
          host,
        )}
    </TownHudRail>
  );
}

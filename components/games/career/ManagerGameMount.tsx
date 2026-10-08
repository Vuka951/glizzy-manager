'use client';

import GliziCareerGame from '@/components/games/career/GliziCareerGame';
import ClientOnly from '@/components/shared/ClientOnly';
import { CHARACTER_ROSTER } from '@/data/games/roster';

// The game reads its text and its roster from the browser's dictionary, so
// it mounts client-side; the fallback keeps the page from collapsing
export default function ManagerGameMount() {
  return (
    <ClientOnly fallback={<div className="min-h-96 w-full" />}>
      <GliziCareerGame characters={CHARACTER_ROSTER} />
    </ClientOnly>
  );
}

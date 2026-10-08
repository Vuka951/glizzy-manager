'use client';

import dynamic from 'next/dynamic';
import { CHARACTER_ROSTER } from '@/data/games/roster';

// The lab rolls random spot variants and commentary draws at render time, so
// it can never hydrate cleanly; render it client-only
const BroadcastPreviewLab = dynamic(
  () => import('@/components/preview/BroadcastPreviewLab'),
  { ssr: false },
);

export default function BroadcastPreviewLoader() {
  return <BroadcastPreviewLab characters={CHARACTER_ROSTER} />;
}

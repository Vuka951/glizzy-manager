'use client';

import RivalChoiceDialog from '@/components/games/career/RivalChoiceDialog';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { RivalCandidate } from '@/lib/utils/careerSave';

// The new-year shortlist, answered with a server action
export default function RivalPickDialog({
  candidates,
  characterBySlug,
  playerSlug,
  onChoose,
}: {
  candidates: RivalCandidate[];
  characterBySlug: Map<string, DuelCharacter>;
  playerSlug: string;
  onChoose: (slug: string) => void;
}) {
  return (
    <RivalChoiceDialog
      candidates={candidates}
      characterBySlug={characterBySlug}
      player={characterBySlug.get(playerSlug)}
      onChoose={onChoose}
    />
  );
}

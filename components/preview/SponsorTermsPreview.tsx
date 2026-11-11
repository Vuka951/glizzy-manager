import CharacterDossier from '@/components/games/career/CharacterDossier';
import SponsorInfoPanel from '@/components/games/career/SponsorInfoPanel';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { newCharacterState } from '@/lib/utils/careerMeters';
import { FULL_REVEAL } from '@/lib/utils/careerScouting';

export default function SponsorTermsPreview({
  character,
}: {
  character: DuelCharacter;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-sky-200/10 bg-slate-950/60 p-4">
        <CharacterDossier
          character={character}
          state={{
            ...newCharacterState(character.slug),
            sponsor: { sponsorId: 'yellow' },
            partyStatus: 'partner',
          }}
          place={3}
          reveal={FULL_REVEAL}
          scoutLevel={0}
          isPlayer
          isRival={false}
          year={3}
        />
      </div>
      <div className="rounded-2xl border border-sky-200/10 bg-slate-950/60 p-4">
        <SponsorInfoPanel />
      </div>
    </div>
  );
}

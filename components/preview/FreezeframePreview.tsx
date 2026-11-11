import FreezeframeGraphic from '@/components/games/career/FreezeframeGraphic';
import type { DuelCharacter } from '@/data/games/glizzyDuel';

const FREEZEFRAME_SCENES = [
  'champion',
  'place-finalist',
  'place-semis',
  'place-quarters',
  'place-early',
  'stress',
  'signing',
  'signing-blue',
  'signing-green',
  'signing-yellow',
  'signing-red',
  'caught',
  'blocked',
  'evidence-failed',
  'yellow-debt-warning',
  'yellow-run-over',
  'binge',
  'police',
  'meltdown',
  'fired',
  'stamp-banned',
  'stamp-allowed',
  'stamp-investigation',
  'crying',
  'heartbreak',
  'interview',
  'statement',
  'scandal-flash',
  'poison-glizi',
  'poison-kafana',
  'witch-curse',
  'nutrition-bribed',
  'demons',
  'beast',
  'rumor',
  'police-tax',
  'police-stash',
  'police-island',
  'police-smuggling',
  'table-up',
  'table-down',
  'fact-record',
  'fact-record-down',
  'no-appetite',
  'fact-ambition',
  'fact-ambition-low',
  'fact-ego',
  'fact-ego-low',
  'fact-fame',
  'fact-fame-low',
  'train-stomach',
  'train-sniffer',
  'train-nutrition',
  'train-fans',
  'train-down-stomach',
  'train-down-sniffer',
  'train-down-nutrition',
  'train-down-fans',
];

export default function FreezeframePreview({
  characters,
}: {
  characters: DuelCharacter[];
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      {FREEZEFRAME_SCENES.map((scene, i) => (
        <div key={scene} className="flex flex-col items-center gap-1">
          <FreezeframeGraphic
            scene={scene}
            character={characters[i % characters.length]}
          />
          <span className="font-mono text-[9px] text-slate-500">{scene}</span>
        </div>
      ))}
    </div>
  );
}

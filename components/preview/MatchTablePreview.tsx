'use client';

import MatchTableStage from '@/components/preview/MatchTableStage';
import { sampleCareer } from '@/components/preview/sampleCareer';
import { previewLead } from '@/components/preview/previewRoster';
import { SEASON_THEME_INDEX } from '@/data/games/careerSeasons';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { seasonName } from '@/lib/utils/localeNames';
import type { MatchEventKind } from '@/lib/utils/tournamentSim';

const EVENTS: MatchEventKind[] = ['police', 'meltdown', 'tiebreak', 'removed'];

const skill = (level: number) => ({ level, progress: 0 });

export default function MatchTablePreview({
  characters,
}: {
  characters: DuelCharacter[];
}) {
  const top = previewLead(characters);
  const bottom = characters.find((c) => c.slug !== top.slug) ?? top;
  const third =
    characters.find((c) => c.slug !== top.slug && c.slug !== bottom.slug) ??
    bottom;
  const career = sampleCareer({ slugs: [top.slug, bottom.slug, third.slug] });
  const topState: CharacterCareerState = {
    ...career.characters[top.slug],
    livesCap: skill(3),
    njuh: skill(3),
    nutrition: skill(2),
    fanSkill: skill(2),
    stress: 14,
    fame: 84,
  };
  const bottomState: CharacterCareerState = {
    ...career.characters[bottom.slug],
    livesCap: skill(1),
    njuh: skill(0),
    nutrition: skill(0),
    fanSkill: skill(1),
    stress: 93,
    appetite: 12,
    fame: 38,
  };

  return (
    <div className="flex flex-col gap-6">
      {EVENTS.map((event, season) => {
        const theme = SEASON_THEME_INDEX[season];
        return (
          <div key={season} className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-slate-300">
              {seasonName(season)}
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              <MatchTableStage
                theme={theme}
                top={top}
                bottom={bottom}
                topState={topState}
                bottomState={bottomState}
                phase={{ kind: 'think', seeker: 'bottom' }}
                round={2}
              />
              <MatchTableStage
                theme={theme}
                top={top}
                bottom={bottom}
                topState={topState}
                bottomState={bottomState}
                phase={{ kind: 'reveal', seeker: 'top', spot: 'sock', hit: true }}
                round={3}
              />
              <MatchTableStage
                theme={theme}
                top={top}
                bottom={bottom}
                topState={topState}
                bottomState={bottomState}
                phase={{ kind: 'idle' }}
                round={3}
                event={event}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

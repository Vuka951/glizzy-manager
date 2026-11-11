import { useEffect, useMemo, useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import PortraitHead from '@/components/games/PortraitHead';
import PressConferenceStage from '@/components/games/career/PressConferenceStage';
import RivalChoiceOption from '@/components/games/career/RivalChoiceOption';
import StreetBoard from '@/components/games/career/street/StreetBoard';
import StreetSignPlate from '@/components/games/career/street/StreetSignPlate';
import TypedNotice from '@/components/games/career/TypedNotice';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import {
  RIVAL_LOSS_EGO,
  RIVAL_LOSS_STRESS,
  RIVAL_WIN_EGO,
  RIVAL_WIN_FAME,
  RIVAL_WIN_MONEY,
} from '@/data/games/careerRivals';
import { GAMES_UI } from '@/data/games/locale';
import { NOTICE_HEADING, NOTICE_TEXT } from '@/lib/constants/typedNotice';
import { STREET_TRAY, WOOD_PLANKS } from '@/lib/utils/careerFrameClasses';
import type { RivalCandidate } from '@/lib/utils/careerSave';
import { fmt, plural } from '@/lib/utils/format';

const RIVAL = GAMES_UI.career.rival;
const HELP = RIVAL.help;

// How long the room waits after the question before the answer is due
const PICKER_DELAY_MS = 1200;

// The new-year press conference: a reporter asks who the player is going to
// hate this year, he picks a name off the shortlist and calls it out
export default function RivalChoiceDialog({
  candidates,
  characterBySlug,
  player,
  onChoose,
}: {
  candidates: RivalCandidate[];
  characterBySlug: Map<string, DuelCharacter>;
  player: DuelCharacter | undefined;
  onChoose: (slug: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const shortlist = useMemo(
    () =>
      candidates
        .map((candidate) => ({
          ...candidate,
          character: characterBySlug.get(candidate.slug),
        }))
        .filter(
          (
            candidate
          ): candidate is RivalCandidate & { character: DuelCharacter } =>
            Boolean(candidate.character)
        ),
    [candidates, characterBySlug]
  );
  const rival = chosen === null ? null : shortlist[chosen];

  useEffect(() => {
    const timer = window.setTimeout(() => setPickerOpen(true), PICKER_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 pt-6">
      <div className="absolute inset-0 bg-[#060912]/75" />
      <StreetBoard className="z-10 flex max-h-[calc(90dvh/var(--game-zoom,1))] w-full max-w-lg flex-col animate-[bubblein_0.25s_ease-out] motion-reduce:animate-none">
        <div className="flex shrink-0 items-center px-1.5 pb-2.5">
          <StreetSignPlate>{RIVAL.title}</StreetSignPlate>
        </div>
        <div
          className={`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden rounded-[4px] border-t-[3px] border-[#b8862f] p-3 shadow-[inset_0_3px_8px_rgb(0_0_0/0.55)] ${WOOD_PLANKS}`}
        >
          <div className="relative">
            <PressConferenceStage
              player={player}
              pointing={rival !== null}
              announced={rival !== null}
              angry={rival !== null}
            >
              {pickerOpen && rival === null && (
                <>
                  <span className="absolute left-[60%] top-[47%] flex h-[9%] w-[7%] animate-[bubblein_0.3s_ease-out] items-center justify-center rounded-full border-2 border-[#1c1408] bg-[#f1e8d3] font-sign text-[12px] font-extrabold text-[#1c1408] sm:text-sm">
                    ?
                  </span>
                  <span className="absolute left-[58.5%] top-[53.5%] h-2 w-2 animate-[bubblein_0.3s_ease-out] rounded-full border-2 border-[#1c1408] bg-[#f1e8d3]" />
                  <span className="absolute left-[56.5%] top-[57%] h-1.5 w-1.5 animate-[bubblein_0.3s_ease-out] rounded-full border-2 border-[#1c1408] bg-[#f1e8d3]" />
                </>
              )}
              {rival === null ? (
                <p className={`absolute bottom-[13%] left-[3%] max-w-[30%] animate-[bubblein_0.3s_ease-out] rounded-[9px] border-2 border-[#1c1408] bg-[#f1e8d3] px-2 py-1.5 font-serif text-[12.5px] font-bold leading-snug text-[#1c1408] ${pickerOpen ? 'max-sm:hidden' : ''}`}>
                  {RIVAL.question}
                  <span className="absolute -bottom-[7px] left-4 h-3 w-3 rotate-45 border-b-2 border-r-2 border-[#1c1408] bg-[#f1e8d3]" />
                </p>
              ) : (
                <>
                  <div className="absolute left-[5%] top-[13%] flex max-w-[54%] animate-[bubblein_0.3s_ease-out] items-center gap-1.5 rounded-[3px] border-2 border-[#a11919] bg-[#f1e8d3] p-1.5 shadow-[0_3px_0_rgb(0_0_0/0.5)] sm:max-w-[42%]">
                    <PortraitHead
                      character={rival.character}
                      className="aspect-square w-9 shrink-0"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-serif text-[14px] font-bold leading-tight text-[#1c1408]">
                        {rival.character.name}
                      </span>
                      <span className="block font-sign text-[13px] font-extrabold uppercase leading-tight tracking-[0.1em] text-[#a11919]">
                        {RIVAL.stamp}
                      </span>
                    </span>
                  </div>
                  <span className="absolute left-[30%] top-[35%] h-2.5 w-2.5 animate-[bubblein_0.3s_ease-out] rounded-full border-2 border-[#a11919] bg-[#f1e8d3]" />
                  <span className="absolute left-[37%] top-[45%] h-1.5 w-1.5 animate-[bubblein_0.3s_ease-out] rounded-full border-2 border-[#a11919] bg-[#f1e8d3]" />
                </>
              )}
              {rival !== null && (
                <CareerButton
                  tone="danger"
                  className="absolute bottom-[3%] left-1/2 z-30 min-h-11 -translate-x-1/2 animate-[bubblein_0.3s_ease-out]"
                  onClick={() => onChoose(rival.slug)}
                >
                  {RIVAL.continue}
                </CareerButton>
              )}
            </PressConferenceStage>
            {pickerOpen && rival === null && (
              <div
                className={`absolute left-1/2 top-3 z-20 w-[94%] -translate-x-1/2 animate-[bubblein_0.25s_ease-out] p-1.5 sm:top-8 sm:w-[86%] ${STREET_TRAY}`}
              >
                <p className="px-1 pb-1 font-sign text-[14px] font-bold uppercase leading-none tracking-[0.07em] text-[#fdf0c8]">
                  {RIVAL.pick}
                </p>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-stretch">
                  {shortlist.map((candidate, index) => (
                    <RivalChoiceOption
                      key={candidate.slug}
                      character={candidate.character}
                      reason={candidate.reason}
                      onChoose={() => setChosen(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <TypedNotice className="flex flex-col gap-1.5 pt-4">
            <span className={NOTICE_HEADING}>{HELP.title}</span>
            <p className={NOTICE_TEXT}>
              {plural(HELP.win, RIVAL_WIN_MONEY, {
                fame: RIVAL_WIN_FAME,
                ego: RIVAL_WIN_EGO,
                money: RIVAL_WIN_MONEY,
              })}
              <br />
              {fmt(HELP.loss, {
                stress: RIVAL_LOSS_STRESS,
                egoLoss: RIVAL_LOSS_EGO,
              })}
              <br />
              {HELP.plot}
            </p>
          </TypedNotice>
        </div>
      </StreetBoard>
    </div>
  );
}

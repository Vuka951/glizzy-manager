import { useEffect, useMemo, useState } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import PressConferenceStage from '@/components/games/career/PressConferenceStage';
import RivalChoiceOption from '@/components/games/career/RivalChoiceOption';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import {
  RIVAL_LOSS_EGO,
  RIVAL_LOSS_STRESS,
  RIVAL_WIN_EGO,
  RIVAL_WIN_FAME,
  RIVAL_WIN_MONEY,
} from '@/data/games/careerRivals';
import { GAMES_UI } from '@/data/games/locale';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-3xl border border-frost-border/40 bg-gradient-to-br from-card-strong/60 via-card-deep/80 to-card-strong/60 p-4 shadow-2xl backdrop-blur-sm animate-[bubblein_0.25s_ease-out]">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-300">
          {RIVAL.title}
        </p>
        <div className="relative">
          <PressConferenceStage
            player={player}
            pointing={rival !== null}
            announced={rival !== null}
            angry={rival !== null}
          >
            {pickerOpen && rival === null && (
              <>
                <span className="absolute left-[60%] top-[44%] flex h-[9%] w-[7%] animate-[bubblein_0.3s_ease-out] items-center justify-center rounded-full border-2 border-frost-border/70 bg-slate-50 text-[10px] font-black text-slate-800 sm:text-xs">
                  ?
                </span>
                <span className="absolute left-[58.5%] top-[51%] h-2 w-2 animate-[bubblein_0.3s_ease-out] rounded-full border-2 border-frost-border/70 bg-slate-50" />
                <span className="absolute left-[56.5%] top-[55%] h-1.5 w-1.5 animate-[bubblein_0.3s_ease-out] rounded-full border-2 border-frost-border/70 bg-slate-50" />
              </>
            )}
            {!(pickerOpen && rival === null) && (
              <div className="pointer-events-none absolute right-[4%] top-[11%] hidden max-w-[40%] text-right sm:block">
                <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-sky-200/70 sm:text-[9px]">
                  {HELP.title}
                </p>
                <p className="mt-0.5 text-[6px] leading-relaxed text-sky-200/50 sm:text-[8px]">
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
              </div>
            )}
            {rival === null ? (
              <p className="absolute bottom-[13%] left-[3%] max-w-[62%] animate-[bubblein_0.3s_ease-out] rounded-2xl border border-slate-300 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold leading-snug text-slate-900 shadow-lg sm:max-w-[54%]">
                {RIVAL.question}
                <span className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 border-b border-r border-slate-300 bg-slate-50" />
              </p>
            ) : (
              <>
                <div className="absolute left-[5%] top-[13%] flex max-w-[54%] sm:max-w-[42%] animate-[bubblein_0.3s_ease-out] items-center gap-1.5 rounded-[1.4rem] border-2 border-red-300 bg-slate-50 p-1.5 shadow-xl">
                  <PortraitHead
                    character={rival.character}
                    className="aspect-square w-9 shrink-0 ring-2 ring-red-400"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black uppercase leading-tight text-red-500">
                      {rival.character.name}
                    </span>
                    <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      {RIVAL.stamp}
                    </span>
                  </span>
                </div>
                <span className="absolute left-[30%] top-[35%] h-2.5 w-2.5 animate-[bubblein_0.3s_ease-out] rounded-full border-2 border-red-300 bg-slate-50" />
                <span className="absolute left-[37%] top-[45%] h-1.5 w-1.5 animate-[bubblein_0.3s_ease-out] rounded-full border-2 border-red-300 bg-slate-50" />
              </>
            )}
            {rival !== null && (
              <button
                onClick={() => onChoose(rival.slug)}
                className="absolute bottom-[3%] left-1/2 z-30 -translate-x-1/2 animate-[bubblein_0.3s_ease-out] rounded-lg border border-red-300/60 bg-red-400/25 px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-red-100 sm:px-4 sm:py-1 backdrop-blur-sm transition hover:border-red-300 hover:bg-red-400/40 hover:text-white"
              >
                {RIVAL.continue}
              </button>
            )}
          </PressConferenceStage>
          {pickerOpen && rival === null && (
            <div className="absolute left-1/2 top-10 z-20 w-[90%] sm:w-[84%] -translate-x-1/2 animate-[bubblein_0.25s_ease-out] rounded-2xl border border-frost-border/40 bg-card-deep/95 p-1.5 shadow-2xl backdrop-blur-sm">
              <p className="px-1 pb-1 text-[7px] font-bold uppercase leading-none tracking-[0.25em] text-red-300 sm:text-[9px]">
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
        <div className="sm:hidden">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-sky-200/80">
            {HELP.title}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-sky-200/70">
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
        </div>
      </div>
    </div>
  );
}

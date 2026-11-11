import PortraitHead from '@/components/games/PortraitHead';
import SeatTag from '@/components/games/rooms/SeatTag';
import BracketGuideButton from '@/components/games/career/BracketGuideButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import PrimeMinisterTag from '@/components/games/career/PrimeMinisterTag';
import SponsorBadge from '@/components/games/career/SponsorBadge';
import { COACH_COLOR_CLASSES } from '@/lib/constants/careerMp';
import type { CoachTagMap } from '@/lib/types/careerMp';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { careerPoints, rankBySeeding } from '@/lib/utils/careerPoints';
import { GAMES_UI } from '@/data/games/locale';

const TABLE = GAMES_UI.career.table;

// The league's standings, kept by hand in the federation's ledger: ruled rows,
// the place numbers in a margin behind a red line and the coach's row marked
// with a highlighter
export default function CareerTable({
  characters,
  characterBySlug,
  playerSlug,
  lastCupRanks,
  rivalSlug,
  onSelect,
  coaches,
  primeMinisterSlug = null,
}: {
  characters: Record<string, CharacterCareerState>;
  characterBySlug: Map<string, DuelCharacter>;
  playerSlug: string;
  lastCupRanks?: string[];
  rivalSlug?: string | null;
  // The row doubles as the way into a character's file when there is one
  onSelect?: (slug: string) => void;
  // A shared league: every human's character carries his coach's tag
  coaches?: CoachTagMap;
  primeMinisterSlug?: string | null;
}) {
  const order = rankBySeeding(
    characters,
    coaches ? new Set(Object.keys(coaches)) : playerSlug,
  );
  return (
    <PaperSheet className="w-full overflow-x-auto px-3 pb-4 pt-3 sm:px-4">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-sign text-[13px] font-semibold uppercase tracking-[0.06em] text-slate-400">
        {rivalSlug && characters[rivalSlug] && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-3.5 w-3.5 border border-[#b91c1c]/60 bg-[#b91c1c]/20"
              aria-hidden="true"
            />
            {TABLE.rival}
          </span>
        )}
        <span className="ml-auto">
          <BracketGuideButton
            order={order}
            characterBySlug={characterBySlug}
            playerSlug={playerSlug}
          />
        </span>
      </div>
      <table className="w-full min-w-96 text-left">
        <thead>
          <tr className="border-b-[3px] border-double border-[#1c1408]/70 font-sign text-[13px] font-bold uppercase tracking-[0.08em] text-slate-300">
            <th className="w-11 border-r-2 border-r-[#b91c1c]/50 pb-1 pl-2.5 pr-2">#</th>
            <th className="pb-1 pl-2.5 pr-2">{TABLE.headers.character}</th>
            <th className="pb-1 pr-2 text-center">{TABLE.headers.points}</th>
            <th className="pb-1 pr-2 text-center">{TABLE.headers.titles}</th>
            <th className="pb-1 pr-2 text-center">{TABLE.headers.record}</th>
            <th className="pb-1 pr-2 text-center">
              {TABLE.headers.punishments}
            </th>
            <th className="pb-1 text-center">{TABLE.headers.sponsor}</th>
          </tr>
        </thead>
        <tbody>
          {order.map((slug, i) => {
            const state = characters[slug];
            const character = characterBySlug.get(slug);
            if (!character) return null;
            const isPlayer = slug === playerSlug;
            const punishments = state.punishments ?? 0;
            const prevRank = lastCupRanks ? lastCupRanks.indexOf(slug) : -1;
            const movement = prevRank >= 0 ? prevRank - i : 0;
            const coach = coaches?.[slug];
            const portraitClass = coach
              ? `h-6 w-6 ring-2 ${COACH_COLOR_CLASSES[coach.color].ring}`
              : 'h-6 w-6 ring-1 ring-[#1c1408]/50';
            return (
              <tr
                key={slug}
                className={`border-b border-[#7d93a8]/35 font-serif text-[13px] ${
                  isPlayer
                    ? 'bg-[#fde047]/55 font-bold text-slate-100'
                    : slug === rivalSlug
                      ? 'bg-[#b91c1c]/15 text-slate-100'
                      : 'text-slate-200'
                }`}
              >
                <td className="border-r-2 border-r-[#b91c1c]/50 py-1 pl-2.5 pr-2 font-sign text-[15px] font-semibold tabular-nums text-slate-300">
                  <span className="inline-flex items-baseline gap-1">
                    {i + 1}
                    {movement !== 0 && (
                      <span
                        className={`text-[10px] font-bold ${
                          movement > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {movement > 0 ? '▲' : '▼'}
                        {Math.abs(movement)}
                      </span>
                    )}
                  </span>
                </td>
                <td className={`py-1 pl-2.5 pr-2 ${onSelect ? 'pointer-coarse:py-0' : ''}`}>
                  {onSelect ? (
                    <button
                      onClick={() => onSelect(slug)}
                      className="flex w-full items-center gap-2 text-left transition hover:text-[#1e3a8a] pointer-coarse:min-h-11"
                    >
                      <PortraitHead
                        character={character}
                        className={portraitClass}
                      />
                      <span className="truncate underline decoration-[#1c1408]/30 decoration-dotted underline-offset-[3px]">
                        {character.name}
                      </span>
                      {slug === primeMinisterSlug && <PrimeMinisterTag />}
                      {coach && <SeatTag name={coach.name} color={coach.color} connected={coach.connected} />}
                    </button>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PortraitHead
                        character={character}
                        className={portraitClass}
                      />
                      <span className="truncate">{character.name}</span>
                      {slug === primeMinisterSlug && <PrimeMinisterTag />}
                      {coach && <SeatTag name={coach.name} color={coach.color} connected={coach.connected} />}
                    </span>
                  )}
                </td>
                <td className="py-1 pr-2 text-center font-sign text-[17px] font-bold tabular-nums text-sky-300">
                  {careerPoints(state)}
                </td>
                <td className="py-1 pr-2 text-center font-sign text-[15px] font-semibold tabular-nums">
                  {state.titles > 0 ? state.titles : ''}
                  {state.titleStreak >= 2 && (
                    <span className="ml-1 text-amber-300">
                      x{state.titleStreak}
                    </span>
                  )}
                </td>
                <td className="py-1 pr-2 text-center font-sign text-[15px] font-semibold tabular-nums">
                  {state.wins}-{state.losses}
                </td>
                <td className="py-1 pr-2 text-center font-sign text-[15px] font-semibold tabular-nums text-red-300">
                  {punishments > 0 ? punishments : ''}
                </td>
                <td className="py-1 text-center text-slate-500">
                  {state.sponsor ? (
                    <span className="inline-flex justify-center">
                      <SponsorBadge sponsorId={state.sponsor.sponsorId} />
                    </span>
                  ) : (
                    TABLE.noSponsor
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </PaperSheet>
  );
}

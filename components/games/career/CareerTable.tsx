import PortraitHead from '@/components/games/PortraitHead';
import CoachTag from '@/components/games/career-mp/CoachTag';
import SponsorBadge from '@/components/games/career/SponsorBadge';
import { COACH_COLOR_CLASSES } from '@/lib/constants/careerMp';
import type { CoachTagMap } from '@/lib/types/careerMp';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { careerPoints, rankBySeeding } from '@/lib/utils/careerPoints';
import { GAMES_UI } from '@/data/games/locale';

const TABLE = GAMES_UI.career.table;
const D = GAMES_UI.career.dossier;

export default function CareerTable({
  characters,
  characterBySlug,
  playerSlug,
  lastCupRanks,
  rivalSlug,
  onSelect,
  coaches,
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
}) {
  const order = rankBySeeding(
    characters,
    coaches ? new Set(Object.keys(coaches)) : playerSlug,
  );
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-sky-200/10 bg-slate-900/40 p-4">
      {rivalSlug && characters[rivalSlug] && (
        <div className="mb-3 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
          <span
            className="h-3 w-3 rounded-sm border border-red-500/50 bg-red-500/20"
            aria-hidden="true"
          />
          {TABLE.rival}
        </div>
      )}
      <table className="w-full min-w-96 text-left">
        <thead>
          <tr className="border-b border-sky-200/10 text-[9px] font-bold uppercase tracking-widest text-slate-500">
            <th className="pb-2 pl-3 pr-2">#</th>
            <th className="pb-2 pr-2">{TABLE.headers.character}</th>
            <th className="pb-2 pr-2 text-center">{TABLE.headers.points}</th>
            <th className="pb-2 pr-2 text-center">{TABLE.headers.titles}</th>
            <th className="pb-2 pr-2 text-center">{TABLE.headers.record}</th>
            <th className="pb-2 pr-2 text-center">
              {TABLE.headers.punishments}
            </th>
            <th className="pb-2 text-center">{TABLE.headers.sponsor}</th>
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
              ? `h-5 w-5 ring-2 ${COACH_COLOR_CLASSES[coach.color].ring}`
              : 'h-5 w-5';
            return (
              <tr
                key={slug}
                className={`border-b border-sky-200/5 text-[11px] ${
                  isPlayer
                    ? 'bg-emerald-500/10 font-bold text-emerald-200'
                    : slug === rivalSlug
                      ? 'bg-red-500/10 text-slate-200'
                      : 'text-slate-300'
                }`}
              >
                <td className="relative py-1.5 pl-3 pr-2 font-mono text-slate-500">
                  <span className="inline-flex items-baseline gap-1">
                    {i + 1}
                    {movement !== 0 && (
                      <span
                        className={`text-[8px] font-bold ${
                          movement > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {movement > 0 ? '▲' : '▼'}
                        {Math.abs(movement)}
                      </span>
                    )}
                  </span>
                </td>
                <td className="py-1.5 pr-2">
                  {onSelect ? (
                    <button
                      onClick={() => onSelect(slug)}
                      className="flex w-full items-center gap-1.5 text-left transition hover:text-white"
                    >
                      <PortraitHead
                        character={character}
                        className={portraitClass}
                      />
                      <span className="truncate underline decoration-sky-200/25 underline-offset-2">
                        {character.name}
                      </span>
                      {coach && <CoachTag name={coach.name} color={coach.color} connected={coach.connected} />}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <PortraitHead
                        character={character}
                        className={portraitClass}
                      />
                      <span className="truncate">{character.name}</span>
                      {coach && <CoachTag name={coach.name} color={coach.color} connected={coach.connected} />}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pr-2 text-center font-mono font-bold text-sky-300">
                  {careerPoints(state)}
                </td>
                <td className="py-1.5 pr-2 text-center font-mono">
                  {state.titles > 0 ? state.titles : ''}
                  {state.titleStreak >= 2 && (
                    <span className="ml-1 text-amber-300">
                      x{state.titleStreak}
                    </span>
                  )}
                </td>
                <td className="py-1.5 pr-2 text-center font-mono">
                  {state.wins}-{state.losses}
                </td>
                <td className="py-1.5 pr-2 text-center font-mono text-red-300/80">
                  {punishments > 0 ? punishments : ''}
                </td>
                <td className="py-1.5 text-center text-slate-500">
                  {state.sponsor ? (
                    <span className="inline-flex justify-center">
                      <SponsorBadge
                        sponsorId={state.sponsor.sponsorId}
                        compact
                      />
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
      <p className="mt-2 text-left text-[9px] leading-relaxed text-slate-500">
        {TABLE.pointsHint}
        {onSelect ? ` ${D.openHint}` : ''}
      </p>
    </div>
  );
}

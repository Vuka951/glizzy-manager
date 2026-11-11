import { useRef } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import TownFacadeCobweb from '@/components/games/career/town/TownFacadeCobweb';
import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import TownFacadeWeeds from '@/components/games/career/town/TownFacadeWeeds';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { SEAT_COLOR_CLASSES } from '@/lib/constants/rooms';
import { FACADE_SIGN_AT } from '@/lib/constants/townFacade';
import type { CoachTagMap } from '@/lib/types/careerMp';
import type { TownBuildingMode } from '@/lib/types/town';
import { careerPoints, rankBySeeding } from '@/lib/utils/careerPoints';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { facadeTint } from '@/lib/utils/townFacade';

const SIGNS = GAMES_UI.career.town.signs;
const ROWS = 6;

// The league billboard on the front row: a wide board on two legs with the
// top six of the table, ranked exactly as CareerTable ranks them, three down
// each of two columns. The board face is HTML over the SVG frame so the
// portraits can be the real PortraitHead; its sizes are in container units so
// it scales with the art (the box keeps the 240 by 135 aspect, 1cqw = 2.4 art
// units). Shut, its lamps go out and the table dims; abandoned, only shreds
// of old posters are left on it
export default function BillboardBuilding({
  career,
  characterBySlug,
  coaches,
  mode,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  coaches?: CoachTagMap;
  mode: TownBuildingMode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const abandoned = mode === 'abandoned';
  useBuildingMotion(ref, mode);
  const order = rankBySeeding(
    career.characters,
    coaches ? new Set(Object.keys(coaches)) : career.playerSlug,
  );
  const top = order
    .slice(0, ROWS)
    .map((slug, i) => ({ slug, rank: i + 1, character: characterBySlug.get(slug) }));

  return (
    <div ref={ref} className={`@container relative h-full w-full ${facadeTint(mode)}`}>
      <svg
        viewBox="0 0 240 135"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <ellipse cx="120" cy="132" rx="118" ry="5" className="fill-[rgba(0,0,0,0.35)]" />
        <rect x="52" y="92" width="7" height="41" className="fill-[#4b5563]" />
        <rect x="181" y="92" width="7" height="41" className="fill-[#4b5563]" />
        <path d="M55 108l126 0" className="stroke-[#374151]" strokeWidth="2" />
        <rect x="4" y="6" width="232" height="88" rx="2" className="fill-[#0b1220] stroke-[#374151]" strokeWidth="4" />
        <TownFacadeLit mode={mode} at={FACADE_SIGN_AT}>
          <path
            d="M60 2L34 94H88ZM180 2L152 94H208Z"
            className="fill-[#fef3c7] opacity-[0.07] transition-opacity duration-300 group-hover/building:opacity-[0.16]"
          />
        </TownFacadeLit>
        <path d="M60 4v-6M180 4v-6" className="stroke-[#6b7280]" strokeWidth="2" />
        <path
          d={abandoned ? 'M54 -2h12M175 -1l9 5' : 'M54 -2h12M174 -2h12'}
          className={mode === 'open' ? 'stroke-[#fde68a]' : 'stroke-[#4b5563]'}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {abandoned ? (
          <g>
            <path d="M14 22l38-2 3 18-6 4 2 12-31 3-4-14 3-6z" className="fill-[#94a3b8] opacity-40" />
            <path d="M70 14h52l-2 26-9-3-6 10-12-4-9 8-14-2z" className="fill-[#fca5a5] opacity-30" />
            <path d="M138 18l40 2-1 18-8 6 4 10-30 1-6-12z" className="fill-[#cbd5e1] opacity-35" />
            <path d="M186 50l38-3 2 30-14 4-6-6-12 7-8-10z" className="fill-[#fde68a] opacity-25" />
            <path d="M98 47l4 30 4-2-2-28z" className="fill-[#cbd5e1] opacity-40" />
            <path d="M22 32h22M22 38h16M146 26h22M146 32h14" className="stroke-[#334155]" strokeWidth="2" />
            <path d="M8 60q4 18 2 30M228 12q-3 22 0 40" className="fill-none stroke-[#7c2d12] opacity-60" strokeWidth="1.4" />
            <TownFacadeCobweb x={6} y={8} r={16} />
            <TownFacadeWeeds x={46} y={133} w={20} seed={2} />
            <TownFacadeWeeds x={176} y={133} w={20} seed={5} />
          </g>
        ) : (
          <text
            x="120"
            y="17.5"
            textAnchor="middle"
            fontSize="9"
            letterSpacing="2"
            className="fill-[#94a3b8] font-sans font-extrabold"
          >
            {SIGNS.billboard.toUpperCase()}
          </text>
        )}
      </svg>
      {!abandoned && (
        <ol
          aria-hidden="true"
          data-facade-dim={mode === 'shut' ? '' : undefined}
          data-at={FACADE_SIGN_AT}
          className={`absolute left-[4.6%] right-[4.6%] top-[17.8%] grid h-[47.4%] grid-flow-col grid-cols-2 grid-rows-3 gap-x-[1.6cqw] gap-y-[0.8cqw] ${mode === 'shut' ? 'opacity-45' : ''}`}
        >
          {top.map(({ slug, rank, character }) => {
            if (!character) return <li key={slug} />;
            const coach = coaches?.[slug];
            const mine = slug === career.playerSlug;
            return (
              <li
                key={slug}
                className={`flex min-w-0 items-center gap-[1.2cqw] rounded-[0.8cqw] px-[1cqw] ${mine ? 'bg-sky-400/20' : ''}`}
              >
                <span className="w-[3.4cqw] shrink-0 font-mono text-[3.6cqw] font-bold leading-none text-[#94a3b8]">
                  {rank}.
                </span>
                <PortraitHead
                  character={character}
                  className={`h-[5.6cqw] w-[5.6cqw] shrink-0 ${coach ? `ring-2 ${SEAT_COLOR_CLASSES[coach.color].ring}` : ''}`}
                />
                <span
                  className={`min-w-0 flex-1 truncate font-sans text-[4.6cqw] font-extrabold uppercase leading-none ${mine ? 'text-[#7dd3fc]' : 'text-[#f1f5f9]'}`}
                >
                  {character.name}
                </span>
                <span className="shrink-0 font-mono text-[4.4cqw] font-bold leading-none text-[#fde68a]">
                  {careerPoints(career.characters[slug])}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

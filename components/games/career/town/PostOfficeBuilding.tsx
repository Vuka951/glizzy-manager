import { useRef } from 'react';
import PostPigeon, {
  type PigeonPerch,
} from '@/components/games/career/town/PostPigeon';
import TownFacadeBrokenPane from '@/components/games/career/town/TownFacadeBrokenPane';
import TownFacadeCobweb from '@/components/games/career/town/TownFacadeCobweb';
import TownFacadeDoorLight from '@/components/games/career/town/TownFacadeDoorLight';
import TownFacadeLamp from '@/components/games/career/town/TownFacadeLamp';
import TownFacadeLit from '@/components/games/career/town/TownFacadeLit';
import TownFacadeNight from '@/components/games/career/town/TownFacadeNight';
import TownFacadeShutter from '@/components/games/career/town/TownFacadeShutter';
import TownFacadeWeeds from '@/components/games/career/town/TownFacadeWeeds';
import useBuildingMotion from '@/components/games/career/town/useBuildingMotion';
import MailboxIcon from '@/components/icons/MailboxIcon';
import { GAMES_UI } from '@/data/games/locale';
import {
  FACADE_NIGHT_AT,
  FACADE_SHUTTER_AT,
  FACADE_WINDOW_AT,
  FACADE_WINDOW_STEP,
} from '@/lib/constants/townFacade';
import type { TownBuildingMode } from '@/lib/types/town';
import { facadeTint } from '@/lib/utils/townFacade';

const SIGNS = GAMES_UI.career.town.signs;
const MAX_PIGEONS = 5;

// Where each pigeon perches on the cornice, which way it faces, and its bob
const PERCHES: PigeonPerch[] = [
  { x: 28, flip: false, bob: 'motion-safe:animate-[fanbob_1.6s_ease-in-out_infinite] motion-lite:animate-none!', tone: 'fill-[#a1a1aa]' },
  { x: 96, flip: true, bob: 'motion-safe:animate-[fanbob_1.9s_ease-in-out_infinite] motion-lite:animate-none! [animation-delay:0.3s]', tone: 'fill-[#d4d4d8]' },
  { x: 62, flip: false, bob: 'motion-safe:animate-[fanbob_1.4s_ease-in-out_infinite] motion-lite:animate-none! [animation-delay:0.7s]', tone: 'fill-[#e4e4e7]' },
  { x: 45, flip: true, bob: 'motion-safe:animate-[fanbob_2.1s_ease-in-out_infinite] motion-lite:animate-none! [animation-delay:0.2s]', tone: 'fill-[#9ca3af]' },
  { x: 80, flip: false, bob: 'motion-safe:animate-[fanbob_1.7s_ease-in-out_infinite] motion-lite:animate-none! [animation-delay:0.9s]', tone: 'fill-[#d4d4d8]' },
];

const WINDOWS = [22, 76];

// The yellow post office, its mailbox on a post, and a pigeon with a letter on the
// cornice for every unread letter, up to five. Shut, the shutters are down
// and the pigeons sit still; abandoned, the glass is broken and the paint
// gone grey
export default function PostOfficeBuilding({
  unread,
  mode,
}: {
  unread: number;
  mode: TownBuildingMode;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const open = mode === 'open';
  const abandoned = mode === 'abandoned';
  const pigeons = PERCHES.slice(0, Math.min(MAX_PIGEONS, Math.max(0, unread)));
  useBuildingMotion(ref, mode);
  return (
    <svg
      ref={ref}
      viewBox="0 0 120 115"
      className={`h-full w-full overflow-visible ${facadeTint(mode)}`}
      aria-hidden="true"
    >
      <ellipse cx="60" cy="112" rx="58" ry="5" className="fill-[rgba(0,0,0,0.35)]" />
      <TownFacadeLit mode={mode} at={FACADE_SHUTTER_AT}>
        <TownFacadeDoorLight cx={62} cy={112} rx={24} />
      </TownFacadeLit>
      <rect x="14" y="42" width="98" height="70" className="fill-[#a39c8d]" />
      <rect x="10" y="36" width="106" height="8" className="fill-[#6b665c]" />
      <rect x="14" y="44" width="98" height="16" className="fill-[#facc15]" />
      {abandoned && (
        <path d="M14 56l6-2 3 4 5-1 2 3H14zM84 44h10l-2 4-5-1-3 3z" className="fill-[#a39c8d]" />
      )}
      <text
        x="63"
        y="57"
        textAnchor="middle"
        fontSize="13"
        letterSpacing="2"
        className={`font-sans font-black ${abandoned ? 'fill-[#3b4a6b]' : 'fill-[#1e3a8a]'}`}
      >
        {SIGNS.post.toUpperCase()}
      </text>

      {open && (
        <rect
          x="16"
          y="62"
          width="94"
          height="34"
          className="fill-[#fbbf24] opacity-0 blur-[6px] transition-opacity duration-300 group-hover/building:opacity-40"
        />
      )}
      {WINDOWS.map((x, i) =>
        abandoned ? (
          <TownFacadeBrokenPane key={x} x={x} y={68} w={26} h={22} seed={i} />
        ) : (
          <rect
            key={x}
            x={x}
            y="68"
            width="26"
            height="22"
            className="fill-[#fbbf24] opacity-85 transition-opacity duration-300 group-hover/building:opacity-100"
          />
        ),
      )}
      <path d="M35 68v22M22 79h26M89 68v22M76 79h26" className="stroke-[#78350f]/60" strokeWidth="1.2" />
      {mode === 'shut' &&
        WINDOWS.map((x, i) => (
          <TownFacadeShutter
            key={x}
            x={x}
            y={68}
            w={26}
            h={22}
            at={FACADE_WINDOW_AT + i * FACADE_WINDOW_STEP * 2}
          />
        ))}
      <rect x="52" y="76" width="20" height="36" className="fill-[#1f2937]" />
      <rect x="52" y="76" width="20" height="3" className="fill-[#1e3a8a]" />
      <circle cx="68" cy="95" r="1.2" className="fill-[#facc15]" />
      <TownFacadeNight mode={mode} at={FACADE_NIGHT_AT}>
        <TownFacadeLamp x={62} y={70} r={1.8} drop={42} />
      </TownFacadeNight>

      <rect x="2" y="84" width="4" height="28" className="fill-[#4b5563]" />
      <svg x="-8" y="64" width="24" height="21">
        <MailboxIcon className="h-full w-full" flag={unread > 0} />
      </svg>

      {pigeons.map((p) => (
        <PostPigeon key={p.x} {...p} bob={open ? p.bob : ''} />
      ))}
      {abandoned && (
        <>
          <TownFacadeCobweb x={14.5} y={60.5} r={12} />
          <TownFacadeCobweb x={71.5} y={79.5} r={8} flip />
          <TownFacadeWeeds x={10} y={112} w={42} seed={2} />
          <TownFacadeWeeds x={74} y={112} w={38} seed={5} />
        </>
      )}
    </svg>
  );
}

import PortraitHead from '@/components/games/PortraitHead';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import Icon from '@/components/icons/Icon';
import LeafIcon from '@/components/icons/LeafIcon';
import NoseIcon from '@/components/icons/NoseIcon';
import PoliceOfficer from '@/components/games/career/PoliceOfficer';
import HandcuffsIcon from '@/components/icons/HandcuffsIcon';
import HeartbreakIcon from '@/components/icons/HeartbreakIcon';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { SponsorId } from '@/lib/utils/careerSave';

function UpArrow() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
      <path d="M6 0l5 6H8v6H4V6H1z" className="fill-emerald-400" />
    </svg>
  );
}

function DownArrow() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
      <path d="M6 12L1 6h3V0h4v6h3z" className="fill-red-400" />
    </svg>
  );
}

function ContractPaper() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <rect x="4" y="3" width="14" height="18" rx="1.5" className="fill-amber-50" />
      <path d="M7 8h8M7 11h8M7 14h5" className="stroke-slate-400" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 17q3 -2 6 0" className="fill-none stroke-slate-800" strokeWidth="1.2" />
      <path d="M14 20l6-6 2 2-6 6-2.6.6z" className="fill-amber-500" />
    </svg>
  );
}

function BingeFace({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 40 32" className={className} aria-hidden="true">
      <circle cx="16" cy="12" r="10" className="fill-lime-300" />
      <circle cx="12" cy="10" r="1.6" className="fill-slate-800" />
      <circle cx="20" cy="10" r="1.6" className="fill-slate-800" />
      <path
        d="M11 17q5 4 10 0"
        className="fill-none stroke-slate-800"
        strokeWidth="1.6"
        transform="rotate(180 16 18)"
      />
      <path d="M18 20q4 6 12 8-6 2-14-2z" className="fill-lime-400" />
      <ellipse cx="30" cy="29" rx="8" ry="2.5" className="fill-lime-400/70" />
      <circle cx="35" cy="24" r="1.2" className="fill-lime-300" />
    </svg>
  );
}

function SceneGlyph({ scene }: { scene: string }) {
  if (scene === 'heartbreak') {
    return <HeartbreakIcon className="h-7 w-7" />;
  }
  if (scene === 'binge') {
    return <BingeFace className="h-8 w-9" />;
  }
  if (scene === 'signing') {
    return <ContractPaper />;
  }
  const signingMatch = scene.match(
    /^signing-(zidari|ostrvo|korporacija|stranka)$/,
  );
  if (signingMatch) {
    return (
      <span className="flex items-center gap-1">
        <ContractPaper />
        <SponsorEmblem
          sponsorId={signingMatch[1] as SponsorId}
          className="h-6 w-6"
        />
      </span>
    );
  }
  const statScene = scene.match(/^train-(down-)?(stomach|sniffer|nutrition|fans)$/);
  if (statScene) {
    const down = Boolean(statScene[1]);
    const stat = statScene[2];
    const glyph =
      stat === 'stomach' ? (
        <GlizzyIcon variant={0} className="h-3.5 w-6" />
      ) : stat === 'sniffer' ? (
        <NoseIcon className="h-4 w-4 text-amber-200" />
      ) : stat === 'nutrition' ? (
        <LeafIcon className="h-4 w-4 text-emerald-300" />
      ) : (
        <Icon name="megaphone" className="h-4 w-4 text-sky-300" />
      );
    return (
      <span className="flex flex-col items-center gap-0.5">
        {down ? <DownArrow /> : <UpArrow />}
        {glyph}
      </span>
    );
  }
  if (scene === 'place-finalist') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path d="M8 2h3l2 6-3.5 1z" className="fill-red-400" />
        <path d="M16 2h-3l-2 6 3.5 1z" className="fill-red-500" />
        <circle cx="12" cy="14.5" r="6.5" className="fill-slate-300" />
        <circle cx="12" cy="14.5" r="4.6" className="fill-slate-400" />
        <path
          d="M10 12.6q2-2.4 3.6-.4t-1.8 3.3L10 17h4.2"
          className="fill-none stroke-slate-100"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (scene === 'place-semis') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path d="M8 2h3l2 6-3.5 1z" className="fill-sky-300" />
        <path d="M16 2h-3l-2 6 3.5 1z" className="fill-sky-400" />
        <circle cx="12" cy="14.5" r="6.5" className="fill-amber-600" />
        <circle cx="12" cy="14.5" r="4.6" className="fill-amber-700" />
        <path
          d="M9 11.5l2 2.2 4-4.2"
          className="fill-none stroke-amber-200"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(0 4)"
        />
      </svg>
    );
  }
  if (scene === 'place-quarters') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <circle cx="12" cy="12" r="9" className="fill-amber-200" />
        <circle cx="9" cy="10" r="1.4" className="fill-slate-800" />
        <circle cx="15" cy="10" r="1.4" className="fill-slate-800" />
        <path
          d="M8.5 15.5h7"
          className="fill-none stroke-slate-800"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (scene === 'place-early') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path
          d="M12 6c4.5 0 8 2.6 8 6.5 0 2.8-2.2 5-5 5.4l1.2 3-2.6-2.7q-.8.1-1.6.1t-1.6-.1L7.8 21l1.2-3c-2.8-.4-5-2.6-5-5.4C4 8.6 7.5 6 12 6z"
          className="fill-red-500"
        />
        <path
          d="M10.5 6.5 9 3.5m3.4 2.6.3-3m2 3.4 2-2.2"
          className="fill-none stroke-emerald-500"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="9.5" cy="12.5" r="0.9" className="fill-amber-200" />
        <circle cx="14.5" cy="14" r="0.9" className="fill-amber-200" />
        <circle cx="12" cy="10.5" r="0.9" className="fill-amber-200" />
      </svg>
    );
  }
  if (scene === 'stress') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path
          d="M12 21S4 14.7 4 9.5C4 6.4 6.4 4 9.2 4c1.6 0 2.8 1 2.8 1s1.2-1 2.8-1C17.6 4 20 6.4 20 9.5c0 5.2-8 11.5-8 11.5z"
          className="fill-red-500"
        />
        <path
          d="M1 12h3l1.5-5L8 17l1.8-8 1.4 5h2.6l1.4-4 1.6 6 1.7-4H23"
          className="fill-none stroke-amber-300"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (scene === 'meltdown') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path
          d="M12 21S4 14.7 4 9.5C4 6.4 6.4 4 9.2 4c1.6 0 2.8 1 2.8 1s1.2-1 2.8-1C17.6 4 20 6.4 20 9.5c0 5.2-8 11.5-8 11.5z"
          className="fill-red-500"
        />
        <path
          d="M12 5.5 10.2 9.5l3.2 2.2-2.4 4.6"
          className="fill-none stroke-slate-950"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1 12h4l1.5-2.5L8 13l1.2-1.8"
          className="fill-none stroke-emerald-300"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (scene === 'train-up' || scene === 'train-down') {
    const up = scene === 'train-up';
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="2" y="10" width="3" height="8" rx="1" className="fill-slate-300" />
        <rect x="19" y="10" width="3" height="8" rx="1" className="fill-slate-300" />
        <rect x="6" y="13" width="12" height="2" className="fill-slate-300" />
        <path
          d={up ? 'M12 2l4 5h-2.5v3h-3V7H8z' : 'M12 10l4-5h-2.5V2h-3v3H8z'}
          className={up ? 'fill-emerald-400' : 'fill-red-400'}
          transform={up ? '' : 'translate(0 0)'}
        />
      </svg>
    );
  }
  if (scene === 'blocked') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path d="M12 2l8 3.5V11c0 5.2-3.4 9-8 11-4.6-2-8-5.8-8-11V5.5z" className="fill-amber-400" />
        <path d="M8.5 12l2.5 2.5 4.5-5" className="fill-none stroke-slate-900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (scene === 'caught') {
    return <HandcuffsIcon className="h-7 w-7" />;
  }
  if (scene === 'champion') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path
          d="M17 3V2H7v1H3v2.5A3.5 3.5 0 0 0 6.5 9h.3a5.5 5.5 0 0 0 3.7 3.4V15H8v3h8v-3h-2.5v-2.6A5.5 5.5 0 0 0 17.2 9h.3A3.5 3.5 0 0 0 21 5.5V3zM5 5.5V5h2v2.4A1.9 1.9 0 0 1 5 5.5zm14 0A1.9 1.9 0 0 1 17 7.4V5h2z"
          className="fill-amber-400"
        />
        <path d="M9 6q3 2.2 6 0" className="fill-none stroke-red-400" strokeWidth="1.4" strokeLinecap="round" />
        <rect x="7" y="19" width="10" height="2.5" rx="1" className="fill-amber-500" />
      </svg>
    );
  }
  if (scene === 'fired') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="5" y="2" width="1.8" height="20" rx="0.9" className="fill-slate-400" />
        <path d="M7.5 3.5h11.5l-2.6 3.6 2.6 3.6H7.5z" className="fill-slate-100" />
      </svg>
    );
  }
  if (scene === 'table-up' || scene === 'table-down') {
    const up = scene === 'table-up';
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="3" y="4.5" width="10" height="3" rx="1" className="fill-slate-200" />
        <rect x="3" y="10.5" width="10" height="3" rx="1" className="fill-slate-400" />
        <rect x="3" y="16.5" width="10" height="3" rx="1" className="fill-slate-500" />
        <path
          d={up ? 'M19 4l4.5 5.5h-3V19h-3V9.5h-3z' : 'M19 20l4.5-5.5h-3V5h-3v9.5h-3z'}
          className={up ? 'fill-emerald-400' : 'fill-red-400'}
        />
      </svg>
    );
  }
  if (scene === 'fact-record') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="4" y="13" width="3.5" height="7" className="fill-sky-300" />
        <rect x="10" y="8" width="3.5" height="12" className="fill-sky-400" />
        <rect x="16" y="4" width="3.5" height="16" className="fill-red-400" />
        <path d="M3 21h18" className="stroke-slate-300" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (scene === 'no-appetite') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <g transform="rotate(-18 12 12)">
          <ellipse cx="12" cy="12.5" rx="9" ry="4" className="fill-amber-300" />
          <ellipse cx="12" cy="10.8" rx="8" ry="1.8" className="fill-red-400" />
        </g>
        <path
          d="M4 20L20 4"
          className="fill-none stroke-red-500"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (scene === 'fact-ambition') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path
          d="M12 2s6 5.2 6 11.2a6 6 0 0 1-12 0c0-2.5 1.1-4.6 2.5-6.4.5 1 1.5 1.9 1.5 1.9C10 6.2 12 2 12 2z"
          className="fill-orange-400"
        />
        <path
          d="M12 21a3.5 3.5 0 0 0 3.5-3.6c0-2.4-2-4.2-3.5-5.3-1.5 1.1-3.5 2.9-3.5 5.3A3.5 3.5 0 0 0 12 21z"
          className="fill-amber-200"
        />
      </svg>
    );
  }
  if (scene === 'fact-ego') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path
          d="M4 17L2.5 6.5 8 10l4-6.5L16 10l5.5-3.5L20 17z"
          className="fill-amber-300"
        />
        <rect x="3.5" y="17.5" width="17" height="3.5" rx="1" className="fill-amber-400" />
        <circle cx="8" cy="14.5" r="1" className="fill-red-400" />
        <circle cx="12" cy="14.5" r="1" className="fill-sky-400" />
        <circle cx="16" cy="14.5" r="1" className="fill-red-400" />
      </svg>
    );
  }
  if (scene === 'fact-fame') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="2.5" y="7" width="19" height="12" rx="2" className="fill-slate-300" />
        <rect x="8" y="4.5" width="6" height="3.5" rx="1" className="fill-slate-400" />
        <circle cx="12" cy="13" r="4" className="fill-sky-300" />
        <circle cx="12" cy="13" r="2" className="fill-slate-800" />
        <path
          d="M19.5 1.5l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z"
          className="fill-amber-300"
        />
      </svg>
    );
  }
  if (scene === 'evidence-failed') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="5" y="3" width="13" height="17" rx="1.5" className="fill-amber-50" />
        <path
          d="M8 8h7M8 11h7M8 14h4"
          className="stroke-slate-400"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M13 13.5l7 7M20 13.5l-7 7"
          className="fill-none stroke-red-500"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (scene === 'fact-record-down') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="4" y="4" width="3.5" height="16" className="fill-sky-400" />
        <rect x="10" y="9" width="3.5" height="11" className="fill-sky-300" />
        <rect x="16" y="14" width="3.5" height="6" className="fill-red-400" />
        <path d="M3 21h18" className="stroke-slate-300" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (scene === 'fact-ego-low') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <g transform="rotate(130 12 14)">
          <path
            d="M6 16l-1-7 3.7 2.3L11.3 7l2.6 4.3L17.5 9l-1 7z"
            className="fill-amber-300"
          />
          <rect x="5.5" y="16.3" width="11.5" height="2.4" rx="0.9" className="fill-amber-400" />
        </g>
        <path
          d="M4 5.5l2 1.5M4.5 9H7M19 16.5l2-1M18.5 19.5H21"
          className="fill-none stroke-slate-400"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (scene === 'fact-fame-low') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="2.5" y="7" width="19" height="12" rx="2" className="fill-slate-400" />
        <rect x="8" y="4.5" width="6" height="3.5" rx="1" className="fill-slate-500" />
        <circle cx="12" cy="13" r="4" className="fill-slate-300" />
        <circle cx="12" cy="13" r="2" className="fill-slate-600" />
        <path
          d="M4 21L20 3"
          className="fill-none stroke-red-500"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (scene === 'poison-glizi') {
    return (
      <span className="flex flex-col items-center">
        <svg viewBox="0 0 20 7" className="h-2 w-6" aria-hidden="true">
          <path
            d="M4 6Q3 4.5 4.2 3.2T4.5 1M10 6Q9 4.5 10.2 3.2T10.5 1M16 6Q15 4.5 16.2 3.2T16.5 1"
            className="fill-none stroke-lime-400"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        <GlizzyIcon variant={0} className="h-3.5 w-6" />
      </span>
    );
  }
  if (scene === 'poison-kafana') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <ellipse cx="12" cy="17" rx="9.5" ry="3.5" className="fill-slate-200" />
        <ellipse cx="12" cy="15.5" rx="5.5" ry="2.4" className="fill-red-400" />
        <path
          d="M8 11q-1-1.5.3-2.8M12 10q-1-1.5.3-2.8M16 11q-1-1.5.3-2.8"
          className="fill-none stroke-lime-400"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <ellipse cx="18" cy="3.8" rx="1.5" ry="0.8" className="fill-slate-400/80" transform="rotate(-25 18 3.8)" />
        <ellipse cx="21" cy="3.8" rx="1.5" ry="0.8" className="fill-slate-400/80" transform="rotate(25 21 3.8)" />
        <circle cx="19.5" cy="5" r="1.4" className="fill-slate-800" />
      </svg>
    );
  }
  if (scene === 'witch-curse') {
    return (
      <span className="relative flex h-7 w-7 items-center justify-center">
        <NoseIcon className="h-5 w-5 text-amber-200" />
        <svg viewBox="0 0 24 24" className="absolute inset-0 h-7 w-7" aria-hidden="true">
          <path
            d="M18.5 1a4.5 4.5 0 1 0 4 6.5A3.6 3.6 0 0 1 18.5 1z"
            className="fill-violet-300"
          />
          <path
            d="M3.5 2l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4L1.5 4l1.4-.6z"
            className="fill-violet-400"
          />
          <path
            d="M5.5 19.5L18.5 8.5"
            className="fill-none stroke-red-500"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  if (scene === 'nutrition-bribed') {
    return (
      <span className="flex items-center -space-x-0.5">
        <LeafIcon className="h-4 w-4 text-emerald-300" />
        <svg viewBox="0 0 16 16" className="h-5 w-5" aria-hidden="true">
          <circle cx="8" cy="8" r="7" className="fill-amber-400" />
          <circle cx="8" cy="8" r="4.6" className="fill-none stroke-amber-200" strokeWidth="1.1" />
          <path
            d="M8 4.8v6.4M6.3 6h2.4a1.5 1.5 0 0 1 0 3H6.6"
            className="fill-none stroke-amber-100"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  if (scene === 'demons') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path d="M6.5 3.5l3 4.5-3.8.6z" className="fill-red-700" />
        <path d="M17.5 3.5l-3 4.5 3.8.6z" className="fill-red-700" />
        <circle cx="12" cy="14" r="7" className="fill-red-600" />
        <path
          d="M8.5 11.8l2.5 1M15.5 11.8l-2.5 1"
          className="fill-none stroke-slate-900"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="9.8" cy="13.8" r="1" className="fill-amber-300" />
        <circle cx="14.2" cy="13.8" r="1" className="fill-amber-300" />
        <path d="M9 17.5h6l-1.2 1.6-1.8-1-1.8 1z" className="fill-slate-100" />
      </svg>
    );
  }
  if (scene === 'zeka') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <ellipse cx="9" cy="5" rx="1.7" ry="4.4" className="fill-slate-300" transform="rotate(-10 9 5)" />
        <ellipse cx="15" cy="5" rx="1.7" ry="4.4" className="fill-slate-300" transform="rotate(10 15 5)" />
        <circle cx="12" cy="14.5" r="7" className="fill-slate-400" />
        <circle cx="9.5" cy="13.5" r="1.3" className="fill-red-500" />
        <circle cx="14.5" cy="13.5" r="1.3" className="fill-red-500" />
        <path d="M10.5 17.5h3l-1.5 2z" className="fill-slate-100" />
        <path
          d="M4.5 15h3M4.7 17.2l2.8-.6M19.5 15h-3M19.3 17.2l-2.8-.6"
          className="fill-none stroke-slate-300"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (scene === 'rumor') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path
          d="M9.5 3C5.4 3 2 5.6 2 8.8c0 1.9 1.2 3.6 3 4.6l-.7 3 3.5-2q.85.2 1.7.2c4.1 0 7.5-2.6 7.5-5.8S13.6 3 9.5 3z"
          className="fill-slate-300"
        />
        <circle cx="6.5" cy="8.8" r="1" className="fill-slate-600" />
        <circle cx="9.5" cy="8.8" r="1" className="fill-slate-600" />
        <circle cx="12.5" cy="8.8" r="1" className="fill-slate-600" />
        <path
          d="M17.5 12c2.5 0 4.5 1.6 4.5 3.6 0 1.2-.75 2.3-1.9 2.9l.4 2-2.3-1.3q-.35.05-.7.05c-2.5 0-4.5-1.6-4.5-3.65S15 12 17.5 12z"
          className="fill-red-400"
        />
        <path
          d="M17.5 13.8v2.2M17.5 17.4v.1"
          className="fill-none stroke-slate-50"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (scene === 'police-tax') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="4" y="2.5" width="13" height="17" rx="1.5" className="fill-amber-50" />
        <path
          d="M7 6.5h7M7 9.5h7M7 12.5h4"
          className="fill-none stroke-slate-400"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="16.5" cy="17" r="4.8" className="fill-amber-400" />
        <circle cx="16.5" cy="17" r="3.1" className="fill-none stroke-amber-200" strokeWidth="1" />
        <path
          d="M16.5 14.8v4.4M15.2 15.8h1.8a1.2 1.2 0 0 1 0 2.4h-1.5"
          className="fill-none stroke-amber-100"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (scene === 'police-stash') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="3.5" y="8.2" width="7" height="3.4" rx="1.7" className="fill-amber-500" />
        <rect x="4.1" y="7" width="6" height="2.6" rx="1.3" className="fill-red-400" />
        <rect x="12.5" y="8.2" width="7" height="3.4" rx="1.7" className="fill-amber-500" />
        <rect x="13.1" y="7" width="6" height="2.6" rx="1.3" className="fill-red-400" />
        <rect x="8" y="4.6" width="7" height="3.4" rx="1.7" className="fill-amber-500" />
        <rect x="8.6" y="3.4" width="6" height="2.6" rx="1.3" className="fill-red-400" />
        <rect x="2" y="10.8" width="19" height="10.4" rx="1" className="fill-amber-700" />
        <path
          d="M2 14.2h19M8.3 10.8v10.4M14.7 10.8v10.4"
          className="fill-none stroke-amber-900"
          strokeWidth="1.1"
        />
        <path d="M15.6 14.6l-1.6-2.4" className="fill-none stroke-slate-300" strokeWidth="0.7" />
        <g transform="rotate(-12 18.5 17.3)">
          <rect x="15" y="14.4" width="7" height="5.4" rx="0.8" className="fill-amber-50" />
          <rect x="15" y="14.4" width="7" height="1.5" rx="0.6" className="fill-red-500" />
          <path
            d="M16.3 17.3h4.4M16.3 18.5h3"
            className="fill-none stroke-slate-400"
            strokeWidth="0.7"
            strokeLinecap="round"
          />
        </g>
      </svg>
    );
  }
  if (scene === 'police-island') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path d="M1.5 22q5.3-3 10.5-3t10.5 3z" className="fill-sky-500" />
        <ellipse cx="12" cy="19.5" rx="6.5" ry="2" className="fill-amber-200" />
        <path
          d="M12.5 18.5Q12 12 13.5 8"
          className="fill-none stroke-amber-700"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M13.5 8Q9 5.5 6 7.5q3.5-4.5 7.5-1z M13.5 8q4.5-2.5 7.5-.5-3.5-4-7.5-1z M13.5 8Q12 4 8.5 3.5q4.5-1.5 6.5 3z"
          className="fill-emerald-500"
        />
      </svg>
    );
  }
  if (scene === 'police-smuggling') {
    return (
      <span className="flex flex-col items-center -space-y-0.5">
        <GlizzyIcon variant={0} className="h-3 w-5" />
        <svg viewBox="0 0 24 12" className="h-3.5 w-7" aria-hidden="true">
          <rect x="2" y="0.5" width="20" height="11" rx="1" className="fill-amber-700" />
          <path
            d="M2 4h20M8.7 0.5v11M15.4 0.5v11"
            className="fill-none stroke-amber-900"
            strokeWidth="1.1"
          />
        </svg>
      </span>
    );
  }
  if (scene === 'interview') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="9" y="2" width="6" height="11" rx="3" className="fill-slate-300" />
        <path d="M10.5 5h3M10.5 7.5h3" className="fill-none stroke-slate-500" strokeWidth="1" strokeLinecap="round" />
        <path
          d="M6 10a6 6 0 0 0 12 0"
          className="fill-none stroke-slate-400"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M12 16v4M8.5 21h7"
          className="fill-none stroke-slate-400"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (scene === 'statement') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="3.5" y="3.5" width="12" height="17" rx="1.5" className="fill-amber-50" />
        <path d="M3.5 7h12" className="fill-none stroke-slate-300" strokeWidth="1" />
        <path
          d="M6 10.5h7M6 13.5h7M6 16.5h4.5"
          className="fill-none stroke-slate-400"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <g transform="rotate(32 19 14)">
          <rect x="17.8" y="6" width="2.6" height="11" rx="0.7" className="fill-amber-400" />
          <path d="M17.8 17h2.6L19.1 20z" className="fill-amber-600" />
        </g>
      </svg>
    );
  }
  if (scene === 'scandal-flash') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path d="M19 2.2l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" className="fill-amber-300" />
        <path d="M22.3 7.5l.4.9.9.4-.9.4-.4.9-.4-.9-.9-.4.9-.4z" className="fill-amber-200" />
        <rect x="2.5" y="9" width="17" height="11" rx="2" className="fill-slate-300" />
        <rect x="7" y="6.5" width="6" height="3.5" rx="1" className="fill-slate-400" />
        <circle cx="11" cy="14.5" r="3.6" className="fill-red-400" />
        <circle cx="11" cy="14.5" r="1.8" className="fill-slate-800" />
      </svg>
    );
  }
  if (scene === 'fact-ambition-low') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <rect x="3" y="13.5" width="18" height="7" rx="3" className="fill-slate-300" />
        <rect x="3" y="13.5" width="18" height="2.5" rx="1.25" className="fill-slate-200" />
        <path
          d="M6 8.5h3.5L6 12h3.5"
          className="fill-none stroke-sky-300"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.5 3h4.5l-4.5 4.8H18"
          className="fill-none stroke-sky-400"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (scene === 'invest-security') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path d="M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" className="fill-slate-300" />
        <path d="M8.5 10h7l2.5 3v8H6v-8z" className="fill-slate-800" />
        <path d="M11 10h2l-1 5-1-3z" className="fill-slate-100" />
        <rect x="7" y="5.5" width="10" height="2" rx="1" className="fill-slate-900" />
        <path d="M15.6 6.4a2.4 2.4 0 0 1 1.9 3.8l-1 1.4" className="fill-none stroke-amber-300" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    );
  }
  if (scene === 'invest-spa') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path d="M5 13.5h14v3a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" className="fill-sky-300" />
        <rect x="3.5" y="12" width="17" height="2" rx="1" className="fill-sky-200" />
        <path d="M9 9.5q-1.6-1.6 0-3.2T9 3.1" className="fill-none stroke-slate-300" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M12.5 9.5q-1.6-1.6 0-3.2t0-3.2" className="fill-none stroke-slate-400" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M16 9.5q-1.6-1.6 0-3.2t0-3.2" className="fill-none stroke-slate-300" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  if (scene === 'invest-scout') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path d="M2.5 8.5h6.5l-.9 8a2.9 2.9 0 0 1-5.7 0z" className="fill-slate-800" />
        <path d="M15 8.5h6.5l-.9 8a2.9 2.9 0 0 1-5.7 0z" className="fill-slate-800" />
        <path d="M4.5 8.5V6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2.5M17 8.5V6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2.5" className="fill-none stroke-slate-500" strokeWidth="1.4" />
        <path d="M9 11h6" className="fill-none stroke-slate-500" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="5.7" cy="14.6" r="1.7" className="fill-amber-300" />
        <circle cx="18.3" cy="14.6" r="1.7" className="fill-amber-300" />
      </svg>
    );
  }
  if (scene === 'invest-assistant') {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
        <path d="M4 9h9l7-2.5v3.2A5.5 5.5 0 1 1 4 12z" className="fill-amber-400" />
        <circle cx="8.5" cy="12.5" r="2.4" className="fill-slate-900" />
        <rect x="13" y="4.5" width="7" height="2" rx="1" className="fill-slate-300" />
      </svg>
    );
  }
  return null;
}

const STAMP_LABELS = GAMES_UI.career.newspaper.stamps as Record<string, string>;

const STAMP_STYLES: Record<string, string> = {
  banned: 'border-red-700/80 text-red-700',
  allowed: 'border-emerald-700/80 text-emerald-700',
  investigation: 'border-red-700/80 text-red-700',
  onair: 'border-sky-700/80 text-sky-700',
};

// The inked verdict pressed straight onto the page, no photo
function StampGraphic({ kind, small }: { kind: string; small: boolean }) {
  return (
    <span
      className={`inline-block rotate-[-8deg] rounded-md border-4 font-black uppercase ${
        small ? 'px-1.5 py-0.5 text-[10px] tracking-[0.15em]' : 'px-2.5 py-1 text-sm tracking-[0.2em]'
      } ${STAMP_STYLES[kind] ?? STAMP_STYLES.banned}`}
    >
      {STAMP_LABELS[kind] ?? kind}
    </span>
  );
}

function TearDrop({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 8 14" className={className} aria-hidden="true">
      <path
        d="M4 0C4 0 0.8 5.5 0.8 8.2a3.2 3.2 0 0 0 6.4 0C7.2 5.5 4 0 4 0z"
        className="fill-sky-400"
      />
      <circle cx="2.9" cy="8.6" r="1" className="fill-sky-200" />
    </svg>
  );
}

// The paparazzi still: a slightly tilted white-framed photo of the story.
// Stamp scenes skip the photo frame entirely
export default function FreezeframeGraphic({
  scene,
  character,
  small = false,
}: {
  scene: string;
  character: DuelCharacter;
  small?: boolean;
}) {
  if (scene.startsWith('stamp-')) {
    return <StampGraphic kind={scene.slice('stamp-'.length)} small={small} />;
  }
  return (
    <div
      className={`rotate-[-2deg] rounded-sm border-4 border-slate-100 bg-slate-950 shadow-lg ${
        small ? 'p-0.5' : 'p-1'
      }`}
    >
      <div className={`flex items-center justify-center gap-1.5 ${small ? 'px-0.5' : 'px-1'}`}>
        {scene === 'police' && <PoliceOfficer />}
        <SceneGlyph scene={scene} />
        <span className="relative">
          <PortraitHead
            character={character}
            className={`${small ? 'h-8 w-8' : 'h-10 w-10'} ${
              scene === 'heartbreak' ? 'grayscale' : ''
            }`}
          />
          {scene === 'crying' && (
            <>
              <TearDrop className="absolute left-[18%] top-[44%] h-2.5 w-1.5" />
              <TearDrop className="absolute left-[28%] top-[60%] h-2 w-1" />
              <TearDrop className="absolute left-[10%] top-[66%] h-1.5 w-1" />
              <TearDrop className="absolute right-[18%] top-[50%] h-2 w-1" />
              <TearDrop className="absolute right-[26%] top-[64%] h-2.5 w-1.5" />
              <TearDrop className="absolute right-[8%] top-[70%] h-1.5 w-1" />
              <svg
                viewBox="0 0 36 8"
                className="absolute inset-x-0 -bottom-1 mx-auto h-2 w-8"
                aria-hidden="true"
              >
                <ellipse cx="18" cy="4" rx="17" ry="3.5" className="fill-sky-400/80" />
                <ellipse cx="13" cy="3.4" rx="6" ry="1.2" className="fill-sky-200/90" />
              </svg>
            </>
          )}
        </span>
        {scene === 'police' && <PoliceOfficer flip />}
      </div>
      <p
        className={`truncate pt-0.5 text-center font-mono font-bold uppercase tracking-widest text-slate-400 ${
          small ? 'max-w-20 text-[6px]' : 'max-w-24 text-[7px]'
        }`}
      >
        {character.name}
      </p>
    </div>
  );
}

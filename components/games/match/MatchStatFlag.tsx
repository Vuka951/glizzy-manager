'use client';

import { useCareerFrames } from '@/components/games/career/careerFrames';
import Icon from '@/components/icons/Icon';
import HeartIcon from '@/components/icons/HeartIcon';
import type { IconName } from '@/lib/constants/icons';
import { GAMES_UI } from '@/data/games/locale';
import type { MatchFlag, MatchFlagMeter } from '@/lib/utils/matchStats';

const FLAGS = GAMES_UI.career.matchStats.flags as Record<string, string>;

const ICON_BY_METER: Record<MatchFlagMeter, IconName | 'heart'> = {
  stress: 'heart',
  appetite: 'hotdog',
  ambition: 'bolt',
  ego: 'star',
  fame: 'megaphone',
};

const TONE = {
  danger: 'border-red-500/50 bg-red-500/15 text-red-300',
  warn: 'border-amber-400/50 bg-amber-500/15 text-amber-300',
  great: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300 ',
} as const;

// A lit lamp on the hall scoreboard
const STREET_TONE = {
  danger: 'bg-[#7f1d1d] text-[#fecaca]',
  warn: 'bg-[#78350f] text-[#fde68a]',
  great: 'bg-[#064e3b] text-[#a7f3d0]',
} as const;

// One meter that is far enough out of the ordinary to change the night, read
// as a glyph and the direction it went
export default function MatchStatFlag({ flag }: { flag: MatchFlag }) {
  const street = useCareerFrames() === 'street';
  const icon = ICON_BY_METER[flag.meter];
  return (
    <span
      title={FLAGS[flag.id]}
      className={`flex items-center gap-0.5 ${
        street
          ? `rounded-[2px] px-1 py-px ${STREET_TONE[flag.tone]}`
          : `rounded-full border px-1 py-px ${TONE[flag.tone]}`
      }`}
    >
      {icon === 'heart' ? (
        <HeartIcon
          className={`h-2.5 w-2.5 ${flag.tone === 'danger' ? 'animate-pulse' : ''}`}
        />
      ) : (
        <Icon name={icon} className="h-2.5 w-2.5" />
      )}
      <span
        className={
          street
            ? 'text-[9px] font-black leading-none'
            : 'text-[8px] font-black leading-none'
        }
      >
        {flag.dir === 'up' ? '▲' : '▼'}
      </span>
    </span>
  );
}

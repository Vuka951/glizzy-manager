import HeartIcon from '@/components/icons/HeartIcon';
import Icon from '@/components/icons/Icon';
import {
  meterTones,
  meterWidthClass,
  type MeterTone,
} from '@/components/games/career/MetersPanel';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import TownHudRail from '@/components/games/career/town/TownHudRail';
import { GAMES_UI } from '@/data/games/locale';
import type { CharacterCareerState } from '@/lib/utils/careerSave';

const M = GAMES_UI.career.meters;

const TONE_TEXT: Record<MeterTone, string> = {
  great: 'text-emerald-300',
  ok: 'text-slate-100',
  warn: 'text-amber-300',
  danger: 'text-red-400',
};
const TONE_BAR: Record<MeterTone, string> = {
  great: 'bg-emerald-400',
  ok: 'bg-slate-200',
  warn: 'bg-amber-400',
  danger: 'bg-red-500',
};

// The phone's player card: the five meters on a strip of paper along a short
// rail, a tap opens the card
export default function TownMeterStrip({
  ch,
  onOpen,
}: {
  ch: CharacterCareerState;
  onOpen: () => void;
}) {
  const tones = meterTones(ch);
  const meters = [
    {
      id: 'stress',
      label: M.stress,
      value: ch.stress,
      tone: tones.stress,
      icon: (
        <HeartIcon
          className={`h-3 w-3 ${
            tones.stress === 'danger'
              ? 'animate-pulse text-red-400'
              : 'text-slate-300'
          }`}
        />
      ),
    },
    {
      id: 'appetite',
      label: M.appetite,
      value: ch.appetite,
      tone: tones.appetite,
      icon: <Icon name="hotdog" className="h-3 w-3 text-slate-300" />,
    },
    {
      id: 'ambition',
      label: M.ambition,
      value: ch.ambition,
      tone: tones.ambition,
      icon: <Icon name="bolt" className="h-3 w-3 text-slate-300" />,
    },
    {
      id: 'ego',
      label: M.ego,
      value: ch.ego,
      tone: tones.ego,
      icon: <Icon name="star" className="h-3 w-3 text-slate-300" />,
    },
    {
      id: 'fame',
      label: M.fame,
      value: ch.fame,
      tone: tones.fame,
      icon: <Icon name="megaphone" className="h-3 w-3 text-slate-300" />,
    },
  ];

  return (
    <TownHudRail className="h-11 w-full px-2.5 py-1">
      <button
        onClick={onOpen}
        title={M.title}
        className="relative block h-full w-full before:absolute before:-inset-y-1 before:inset-x-0 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fde68a]"
      >
        <PaperSheet className="grid h-full w-full grid-cols-5 divide-x divide-slate-700/70 text-left">
          {meters.map((meter) => (
            <span
              key={meter.id}
              title={`${meter.label}: ${meter.value}`}
              className="flex min-w-0 flex-col justify-center gap-[3px] px-1.5"
            >
              <span className="flex items-center justify-between gap-1">
                {meter.icon}
                <span
                  className={`font-sign text-[14px] font-bold leading-none tabular-nums ${TONE_TEXT[meter.tone]}`}
                >
                  {meter.value}
                </span>
              </span>
              <span className="block h-[3px] overflow-hidden rounded-[1px] bg-slate-800">
                <span
                  className={`block h-full ${TONE_BAR[meter.tone]} ${meterWidthClass(meter.value)}`}
                />
              </span>
            </span>
          ))}
        </PaperSheet>
      </button>
    </TownHudRail>
  );
}

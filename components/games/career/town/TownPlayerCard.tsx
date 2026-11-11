'use client';

import CareerIconButton from '@/components/games/career/CareerIconButton';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import HeartIcon from '@/components/icons/HeartIcon';
import Icon from '@/components/icons/Icon';
import LeafIcon from '@/components/icons/LeafIcon';
import NoseIcon from '@/components/icons/NoseIcon';
import CareerMeterGauge from '@/components/games/career/CareerMeterGauge';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import TownBankScrews from '@/components/games/career/town/TownBankScrews';
import { useTownDisplay } from '@/components/games/career/town/useTownDisplay';
import {
  meterTones,
  meterWidthClass,
  type MeterTone,
} from '@/components/games/career/MetersPanel';
import { TRAINING_DEFS } from '@/data/games/careerTraining';
import { GAMES_UI } from '@/data/games/locale';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { writeGameSettings } from '@/lib/utils/gameSettings';

const M = GAMES_UI.career.meters;
const T = GAMES_UI.career.trainings;
const TOWN = GAMES_UI.career.town;

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

// The player's card as a clipboard screwed up over the scene: the five meters
// and the four trained skills on the clipped sheet, printed in ink by the
// paper's paint remap; a click opens the full card. Folded, the sheet keeps
// only the five meter values
export default function TownPlayerCard({
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
          className={`h-3.5 w-3.5 ${
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
      icon: <Icon name="hotdog" className="h-3.5 w-3.5 text-slate-300" />,
    },
    {
      id: 'ambition',
      label: M.ambition,
      value: ch.ambition,
      tone: tones.ambition,
      icon: <Icon name="bolt" className="h-3.5 w-3.5 text-slate-300" />,
    },
    {
      id: 'ego',
      label: M.ego,
      value: ch.ego,
      tone: tones.ego,
      icon: <Icon name="star" className="h-3.5 w-3.5 text-slate-300" />,
    },
    {
      id: 'fame',
      label: M.fame,
      value: ch.fame,
      tone: tones.fame,
      icon: <Icon name="megaphone" className="h-3.5 w-3.5 text-slate-300" />,
    },
  ];
  const skills = [
    {
      id: 'stomach',
      name: T.stomach.name,
      level: ch.livesCap.level,
      progress: ch.livesCap.progress,
      max: TRAINING_DEFS.stomach.maxLevel,
      icon: <GlizzyIcon variant={0} className="h-2.5 w-4" />,
    },
    {
      id: 'sniffer',
      name: T.sniffer.name,
      level: ch.njuh.level,
      progress: ch.njuh.progress,
      max: TRAINING_DEFS.sniffer.maxLevel,
      icon: <NoseIcon className="h-3 w-3 text-amber-200" />,
    },
    {
      id: 'nutrition',
      name: T.nutrition.name,
      level: ch.nutrition.level,
      progress: ch.nutrition.progress,
      max: TRAINING_DEFS.nutrition.maxLevel,
      icon: <LeafIcon className="h-3 w-3 text-emerald-300" />,
    },
    {
      id: 'fans',
      name: T.fans.name,
      level: ch.fanSkill.level,
      progress: ch.fanSkill.progress,
      max: TRAINING_DEFS.fans.maxLevel,
      icon: <Icon name="megaphone" className="h-3 w-3 text-sky-300" />,
    },
  ];

  const collapsed = useTownDisplay().card === 'collapsed';
  const toggleLabel = collapsed ? TOWN.cardExpand : TOWN.cardCollapse;

  return (
    <div
      className="relative w-full rounded-[7px] bg-[#6a4526] bg-[repeating-linear-gradient(94deg,transparent_0_17px,rgb(0_0_0/0.1)_17px_19px,transparent_19px_31px,rgb(255_255_255/0.025)_31px_32px)] px-1.5 pb-1.5 pt-3.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.16),inset_0_-2px_0_rgb(0_0_0/0.45),0_0_0_1px_#160c05,0_4px_0_rgb(2_6_23/0.55)] transition duration-200 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
    >
      <TownBankScrews brass />
      <span
        aria-hidden="true"
        className="absolute inset-x-1.5 bottom-1.5 top-3.5 rotate-[1.2deg] rounded-[2px] bg-[#d6c9ac] shadow-[0_1px_2px_rgb(0_0_0/0.5)]"
      />
      <button
        type="button"
        onClick={onOpen}
        title={M.title}
        className="relative block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fde68a]"
      >
        <PaperSheet className="flex flex-col">
          <span className="flex h-8 items-end border-b-[3px] border-double border-slate-200/70 pb-1 pl-2 pr-8">
            <span className="truncate font-serif text-[13px] font-bold leading-none text-slate-100">
              {TOWN.playerCard}
            </span>
          </span>
          {collapsed ? (
            <span className="grid grid-cols-5 gap-1 px-1.5 pb-1.5 pt-1.5">
              {meters.map((meter) => (
                <span
                  key={meter.id}
                  title={`${meter.label}: ${meter.value}`}
                  className="flex min-w-0 flex-col items-center gap-[3px]"
                >
                  {meter.icon}
                  <span
                    className={`font-sign text-[14px] font-bold leading-none tabular-nums ${TONE_TEXT[meter.tone]}`}
                  >
                    {meter.value}
                  </span>
                  <span className="block h-[3px] w-full overflow-hidden rounded-[1px] bg-slate-800">
                    <span
                      className={`block h-full ${TONE_BAR[meter.tone]} ${meterWidthClass(meter.value)}`}
                    />
                  </span>
                </span>
              ))}
            </span>
          ) : (
            <>
              <span className="flex flex-col px-2 pb-1 pt-0.5">
                {meters.map((meter) => (
                  <span
                    key={meter.id}
                    title={`${meter.label}: ${meter.value}`}
                    className="grid h-[21px] grid-cols-[14px_1fr_22px] items-center gap-1.5 border-b border-slate-700/70 last:border-b-0"
                  >
                    <span className="flex justify-center">{meter.icon}</span>
                    <CareerMeterGauge value={meter.value} tone={meter.tone} />
                    <span
                      className={`text-right font-sign text-[14px] font-bold leading-none tabular-nums ${TONE_TEXT[meter.tone]}`}
                    >
                      {meter.value}
                    </span>
                  </span>
                ))}
              </span>
              <span className="flex flex-col border-t-[3px] border-double border-slate-200/70 px-2 pb-1 pt-0.5">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    title={`${skill.name}: ${skill.level}`}
                    className="flex h-[21px] items-center gap-1.5 border-b border-slate-700/70 last:border-b-0"
                  >
                    <span className="flex w-4 shrink-0 justify-center">{skill.icon}</span>
                    <span className="min-w-0 flex-1 truncate font-sign text-[13px] font-semibold leading-none text-slate-200">
                      {skill.name}
                    </span>
                    <span className="flex shrink-0 items-center gap-[3px]">
                      {Array.from({ length: skill.max }, (_, i) => (
                        <span
                          key={i}
                          className={`h-2 w-[5px] rounded-[1px] ${
                            i < skill.level ? 'bg-slate-200' : 'bg-slate-700/70'
                          }`}
                        />
                      ))}
                    </span>
                    <span
                      className={`flex shrink-0 items-center gap-px ${skill.level < skill.max ? '' : 'invisible'}`}
                    >
                      {Array.from({ length: 3 }, (_, i) => (
                        <span
                          key={i}
                          className={`h-[3px] w-1.5 rounded-[1px] ${
                            i < skill.progress ? 'bg-sky-300' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </span>
                  </span>
                ))}
              </span>
            </>
          )}
        </PaperSheet>
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-1 left-1/2 flex h-[22px] w-14 -translate-x-1/2 items-start justify-center rounded-t-[5px] rounded-b-[2px] bg-gradient-to-b from-[#e8c066] to-[#a8782a] pt-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.5),inset_0_-3px_0_rgb(0_0_0/0.18),0_2px_0_rgb(0_0_0/0.45)]"
      >
        <span className="h-[7px] w-[7px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#fde68a,#92400e)] shadow-[0_1px_0_rgb(0_0_0/0.5)]" />
      </span>
      <CareerIconButton
        label={toggleLabel}
        size="sm"
        onClick={() =>
          writeGameSettings({ townCard: collapsed ? 'open' : 'collapsed' })
        }
        aria-expanded={!collapsed}
        className="absolute right-2 top-[17px] z-10"
      >
        <Icon
          name="chevronDown"
          className={`h-3.5 w-3.5 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}
        />
      </CareerIconButton>
    </div>
  );
}

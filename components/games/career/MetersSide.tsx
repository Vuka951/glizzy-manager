import { useEffect, useState } from 'react';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import Icon from '@/components/icons/Icon';
import HeartIcon from '@/components/icons/HeartIcon';
import LeafIcon from '@/components/icons/LeafIcon';
import NoseIcon from '@/components/icons/NoseIcon';
import {
  meterTones,
  meterWidthClass,
  type MeterTone,
} from '@/components/games/career/MetersPanel';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { GAMES_UI } from '@/data/games/locale';
import { fmt } from '@/lib/utils/format';

const M = GAMES_UI.career.meters;
const T = GAMES_UI.career.trainings;
const OS = GAMES_UI.career.offseason;

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

const PILL =
  'relative flex h-8 items-center gap-1 rounded-2xl border border-sky-200/15 bg-slate-950/70 px-2 backdrop-blur-sm transition hover:border-sky-200/40 sm:h-9 sm:w-36 sm:gap-1.5 sm:px-2.5 xl:h-10 xl:w-44 xl:gap-2 xl:px-3';
const CHIP =
  'absolute right-full top-1/2 z-10 mr-2 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-lg border border-sky-200/30 bg-slate-950/95 px-2.5 py-1.5 sm:hidden';

function MeterPill({
  id,
  icon,
  label,
  value,
  tone,
  expanded,
  onPress,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: MeterTone;
  expanded: boolean;
  onPress: (id: string) => void;
}) {
  const bar = (width: string) => (
    <span className={`h-1.5 overflow-hidden rounded-full bg-slate-800 ${width}`}>
      <span
        className={`block h-full rounded-full transition-all duration-500 ${TONE_BAR[tone]} ${meterWidthClass(value)}`}
      />
    </span>
  );
  return (
    <button onClick={() => onPress(id)} title={`${label}: ${value}`} className={PILL}>
      <span className="shrink-0">{icon}</span>
      <span className="hidden flex-1 sm:block">{bar('block w-full')}</span>
      <span className={`font-mono text-[9px] font-bold xl:text-[11px] ${TONE_TEXT[tone]}`}>
        {value}
      </span>
      {expanded && (
        <span className={CHIP}>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
            {label}
          </span>
          {bar('w-16')}
          <span className={`font-mono text-[9px] font-bold ${TONE_TEXT[tone]}`}>
            {value}
          </span>
        </span>
      )}
    </button>
  );
}

function SkillPill({
  id,
  icon,
  name,
  level,
  max,
  progress,
  expanded,
  onPress,
}: {
  id: string;
  icon: React.ReactNode;
  name: string;
  level: number;
  max: number;
  progress: number;
  expanded: boolean;
  onPress: (id: string) => void;
}) {
  const atMax = level >= max;
  const pips = (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i < level ? (atMax ? 'bg-emerald-400' : 'bg-amber-400') : 'border border-slate-600'
          }`}
        />
      ))}
    </span>
  );
  const ticks = (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 3 }, (_, i) => (
        <span
          key={i}
          className={`h-1 w-1.5 rounded-sm ${
            !atMax && i < progress ? 'bg-sky-400' : 'bg-slate-800'
          }`}
        />
      ))}
    </span>
  );
  return (
    <button onClick={() => onPress(id)} title={`${name}: ${level}`} className={PILL}>
      <span className="shrink-0">{icon}</span>
      <span className="hidden flex-1 items-center gap-1.5 sm:flex">
        {pips}
        {ticks}
      </span>
      <span
        className={`font-mono text-[9px] font-bold xl:text-[11px] ${
          atMax ? 'text-emerald-300' : level > 0 ? 'text-amber-300' : 'text-slate-500'
        }`}
      >
        {level}
      </span>
      {expanded && (
        <span className={CHIP}>
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
            {name}
          </span>
          {pips}
          {ticks}
          <span className="font-mono text-[9px] font-bold text-amber-300">
            {atMax ? OS.maxLevel : fmt(OS.level, { level })}
          </span>
        </span>
      )}
    </button>
  );
}

// Each meter and trained skill docks under the right icon column as its own
// pill; on the phone a tap expands the full bar, on desktop it opens the card
export default function MetersSide({
  ch,
  onOpen,
}: {
  ch: CharacterCareerState;
  onOpen: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    if (!expanded) return;
    const timer = setTimeout(() => setExpanded(null), 3000);
    return () => clearTimeout(timer);
  }, [expanded]);
  const press = (id: string) => {
    if (window.matchMedia('(min-width: 640px)').matches) {
      onOpen();
      return;
    }
    setExpanded((prev) => (prev === id ? null : id));
  };
  const tones = meterTones(ch);
  return (
    <div className="flex flex-col items-end gap-1.5">
      <MeterPill
        id="stress"
        icon={
          <HeartIcon
            className={`h-3 w-3 ${
              tones.stress === 'danger' ? 'animate-pulse text-red-400' : 'text-slate-300'
            }`}
          />
        }
        label={M.stress}
        value={ch.stress}
        tone={tones.stress}
        expanded={expanded === 'stress'}
        onPress={press}
      />
      <MeterPill
        id="appetite"
        icon={<Icon name="hotdog" className="h-3 w-3 text-slate-300" />}
        label={M.appetite}
        value={ch.appetite}
        tone={tones.appetite}
        expanded={expanded === 'appetite'}
        onPress={press}
      />
      <MeterPill
        id="ambition"
        icon={<Icon name="bolt" className="h-3 w-3 text-slate-300" />}
        label={M.ambition}
        value={ch.ambition}
        tone={tones.ambition}
        expanded={expanded === 'ambition'}
        onPress={press}
      />
      <MeterPill
        id="ego"
        icon={<Icon name="star" className="h-3 w-3 text-slate-300" />}
        label={M.ego}
        value={ch.ego}
        tone={tones.ego}
        expanded={expanded === 'ego'}
        onPress={press}
      />
      <MeterPill
        id="fame"
        icon={<Icon name="megaphone" className="h-3 w-3 text-slate-300" />}
        label={M.fame}
        value={ch.fame}
        tone={tones.fame}
        expanded={expanded === 'fame'}
        onPress={press}
      />
      <span className="my-0.5 h-px w-10 bg-sky-200/15 sm:w-36" />
      <SkillPill
        id="stomach"
        icon={<GlizzyIcon variant={0} className="h-2.5 w-4" />}
        name={T.stomach.name}
        level={ch.livesCap.level}
        progress={ch.livesCap.progress}
        max={3}
        expanded={expanded === 'stomach'}
        onPress={press}
      />
      <SkillPill
        id="sniffer"
        icon={<NoseIcon className="h-3 w-3 text-amber-200" />}
        name={T.sniffer.name}
        level={ch.njuh.level}
        progress={ch.njuh.progress}
        max={3}
        expanded={expanded === 'sniffer'}
        onPress={press}
      />
      <SkillPill
        id="nutrition"
        icon={<LeafIcon className="h-3 w-3 text-emerald-300" />}
        name={T.nutrition.name}
        level={ch.nutrition.level}
        progress={ch.nutrition.progress}
        max={3}
        expanded={expanded === 'nutrition'}
        onPress={press}
      />
      <SkillPill
        id="fans"
        icon={<Icon name="megaphone" className="h-3 w-3 text-sky-300" />}
        name={T.fans.name}
        level={ch.fanSkill.level}
        progress={ch.fanSkill.progress}
        max={3}
        expanded={expanded === 'fans'}
        onPress={press}
      />
    </div>
  );
}

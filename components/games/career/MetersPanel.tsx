import GlizzyIcon from '@/components/icons/GlizzyIcon';
import Icon from '@/components/icons/Icon';
import CareerMeterGauge from '@/components/games/career/CareerMeterGauge';
import InfoButton from '@/components/games/career/InfoButton';
import HeartIcon from '@/components/icons/HeartIcon';
import NoseIcon from '@/components/icons/NoseIcon';
import LeafIcon from '@/components/icons/LeafIcon';
import {
  AMBITION_SLUMP_THRESHOLD,
  EGO_HIJACK_THRESHOLD,
} from '@/lib/utils/careerMeters';
import { FULL_REVEAL, type ScoutReveal } from '@/lib/utils/careerScouting';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { TRAINING_DEFS } from '@/data/games/careerTraining';
import { GAMES_UI } from '@/data/games/locale';
import { fmt } from '@/lib/utils/format';

const M = GAMES_UI.career.meters;
const T = GAMES_UI.career.trainings;
const OS = GAMES_UI.career.offseason;
const D = GAMES_UI.career.dossier;

// A reading nobody has: dashes where the bar would be, so an unknown meter
// never reads as a low one
const UNKNOWN_SEGMENTS = 8;

// Tailwind needs literal class names, so bar widths are stepped by 5%
const WIDTH_STEPS = [
  'w-[0%]', 'w-[5%]', 'w-[10%]', 'w-[15%]', 'w-[20%]', 'w-[25%]', 'w-[30%]',
  'w-[35%]', 'w-[40%]', 'w-[45%]', 'w-[50%]', 'w-[55%]', 'w-[60%]', 'w-[65%]',
  'w-[70%]', 'w-[75%]', 'w-[80%]', 'w-[85%]', 'w-[90%]', 'w-[95%]', 'w-[100%]',
];

export function meterWidthClass(value: number): string {
  return WIDTH_STEPS[Math.max(0, Math.min(20, Math.round(value / 5)))];
}


export type MeterTone = 'great' | 'ok' | 'warn' | 'danger';

// Best to worst: green, white, yellow, red
export function meterTones(ch: CharacterCareerState): Record<
  'stress' | 'appetite' | 'ambition' | 'ego' | 'fame',
  MeterTone
> {
  return {
    stress:
      ch.stress > 80 ? 'danger' : ch.stress > 60 ? 'warn' : ch.stress <= 20 ? 'great' : 'ok',
    appetite:
      ch.appetite < 20 || ch.appetite > 80
        ? 'danger'
        : ch.appetite < 35 || ch.appetite > 65
          ? 'warn'
          : ch.appetite >= 40 && ch.appetite <= 60
            ? 'great'
            : 'ok',
    ambition:
      ch.ambition < 15
        ? 'danger'
        : ch.ambition < 25
          ? 'warn'
          : ch.ambition >= 70
            ? 'great'
            : 'ok',
    ego:
      ch.ego < 15
        ? 'danger'
        : ch.ego < 25 || ch.ego > 75
          ? 'warn'
          : ch.ego >= 40
            ? 'great'
            : 'ok',
    fame: ch.fame >= 70 ? 'great' : ch.fame >= 50 ? 'ok' : 'warn',
  };
}

function MeterBar({
  icon,
  label,
  value,
  tone,
  note,
  known = true,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: MeterTone;
  note?: string | null;
  known?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 font-sign text-[14px] font-bold uppercase leading-none tracking-[0.06em] text-slate-300">
          {icon}
          {label}
        </span>
        <span className="flex items-center gap-1.5">
          {known && note && (
            <span className="-rotate-2 rounded-[2px] border border-red-300 px-1 font-sign text-[12px] font-bold uppercase leading-tight tracking-[0.05em] text-red-300">
              {note}
            </span>
          )}
          <span
            className={`font-sign text-[16px] font-bold leading-none tabular-nums ${
              !known
                ? 'text-slate-500'
                : tone === 'danger'
                  ? 'text-red-400'
                  : tone === 'warn'
                    ? 'text-amber-300'
                    : tone === 'great'
                      ? 'text-emerald-300'
                      : 'text-slate-100'
            }`}
          >
            {known ? value : D.unknown}
          </span>
        </span>
      </div>
      {known ? (
        <CareerMeterGauge value={value} tone={tone} />
      ) : (
        <div className="flex h-[6px] w-full items-stretch gap-1">
          {Array.from({ length: UNKNOWN_SEGMENTS }, (_, i) => (
            <span key={i} className="flex-1 rounded-[1px] bg-slate-800" />
          ))}
        </div>
      )}
    </div>
  );
}

function StatPips({
  icon,
  label,
  level,
  progress,
  max,
  known = true,
  showProgress = true,
}: {
  icon: React.ReactNode;
  label: string;
  level: number;
  progress: number;
  max: number;
  known?: boolean;
  showProgress?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-1.5 font-sign text-[14px] font-bold uppercase leading-none tracking-[0.06em] text-slate-300">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <span className="flex items-center gap-1.5">
        <span className="flex items-center gap-0.5">
          {Array.from({ length: max }, (_, i) => (
            <span
              key={i}
              className={`h-2.5 w-[6px] rounded-[1px] ${
                !known
                  ? 'border border-dashed border-slate-600'
                  : i < level
                    ? 'bg-amber-300'
                    : 'bg-slate-700'
              }`}
            />
          ))}
        </span>
        {showProgress && (
          <span className="flex items-center gap-0.5">
            {Array.from({ length: 3 }, (_, i) => (
              <span
                key={i}
                className={`h-1 w-2 rounded-[1px] ${
                  known && i < progress ? 'bg-sky-400' : 'bg-slate-800'
                }`}
              />
            ))}
          </span>
        )}
        <span className="w-9 text-right font-sign text-[13px] font-semibold leading-none tabular-nums text-slate-400">
          {!known
            ? D.unknown
            : level >= max
              ? OS.maxLevel
              : fmt(OS.level, { level })}
        </span>
      </span>
    </div>
  );
}

export default function MetersPanel({
  ch,
  title = M.title,
  onInfo,
  reveal = FULL_REVEAL,
}: {
  ch: CharacterCareerState;
  title?: string;
  onInfo?: () => void;
  // How much of somebody else's card the informant on the payroll opens up
  reveal?: ScoutReveal;
}) {
  const tones = meterTones(ch);
  const appetiteNote =
    ch.appetite < 20 ? M.appetiteLow : ch.appetite > 80 ? M.appetiteHigh : null;
  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="font-sign text-[15px] font-bold uppercase tracking-[0.07em] text-slate-100">
          {title}
        </span>
        {onInfo && (
          <InfoButton
            label={M.infoTitle}
            onClick={onInfo}
            className="ml-auto"
          />
        )}
      </div>
      <MeterBar
        icon={<HeartIcon className={`h-3 w-3 ${tones.stress === 'danger' ? 'text-red-400' : ''}`} />}
        label={M.stress}
        value={ch.stress}
        tone={tones.stress}
        note={tones.stress === 'danger' ? M.stressDanger : null}
        known={reveal.meters}
      />
      <MeterBar
        icon={<Icon name="hotdog" className="h-3 w-3" />}
        label={M.appetite}
        value={ch.appetite}
        tone={tones.appetite}
        note={appetiteNote}
        known={reveal.meters}
      />
      <MeterBar
        icon={<Icon name="bolt" className="h-3 w-3" />}
        label={M.ambition}
        value={ch.ambition}
        tone={tones.ambition}
        note={ch.ambition < AMBITION_SLUMP_THRESHOLD ? M.ambitionLow : null}
        known={reveal.meters}
      />
      <MeterBar
        icon={<Icon name="star" className="h-3 w-3" />}
        label={M.ego}
        value={ch.ego}
        tone={tones.ego}
        note={ch.ego > EGO_HIJACK_THRESHOLD ? M.egoHigh : null}
        known={reveal.meters}
      />
      <MeterBar
        icon={<Icon name="megaphone" className="h-3 w-3" />}
        label={M.fame}
        value={ch.fame}
        tone={tones.fame}
        known={reveal.meters}
      />
      <div className="mt-1 flex flex-col gap-1.5 border-t border-[#1c1408]/30 pt-2.5">
        <StatPips
          icon={<GlizzyIcon variant={0} className="h-2.5 w-4" />}
          label={T.stomach.name}
          level={ch.livesCap.level}
          progress={ch.livesCap.progress}
          max={TRAINING_DEFS.stomach.maxLevel}
          known={reveal.skills}
          showProgress={reveal.detail}
        />
        <StatPips
          icon={<NoseIcon className="h-3 w-3 text-amber-200" />}
          label={T.sniffer.name}
          level={ch.njuh.level}
          progress={ch.njuh.progress}
          max={TRAINING_DEFS.sniffer.maxLevel}
          known={reveal.skills}
          showProgress={reveal.detail}
        />
        <StatPips
          icon={<LeafIcon className="h-3 w-3 text-emerald-300" />}
          label={T.nutrition.name}
          level={ch.nutrition.level}
          progress={ch.nutrition.progress}
          max={TRAINING_DEFS.nutrition.maxLevel}
          known={reveal.skills}
          showProgress={reveal.detail}
        />
        <StatPips
          icon={<Icon name="megaphone" className="h-3 w-3 text-sky-300" />}
          label={T.fans.name}
          level={ch.fanSkill.level}
          progress={ch.fanSkill.progress}
          max={TRAINING_DEFS.fans.maxLevel}
          known={reveal.skills}
          showProgress={reveal.detail}
        />
      </div>
    </div>
  );
}

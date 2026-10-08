import { REST_EGO_TARGET, REST_FAME_DROP } from '@/data/games/careerEconomy';
import { GAMES_UI } from '@/data/games/locale';
import { fmt } from '@/lib/utils/format';

const M = GAMES_UI.career.meters;
const T = GAMES_UI.career.trainings;

const METER_ROWS = [
  { name: M.stress, text: M.info.stress },
  { name: M.appetite, text: M.info.appetite },
  { name: M.ambition, text: M.info.ambition },
  { name: M.ego, text: fmt(M.info.ego, { target: REST_EGO_TARGET }) },
  { name: M.fame, text: fmt(M.info.fame, { drop: REST_FAME_DROP }) },
];

const SKILL_ROWS = [
  { name: T.stomach.name, text: T.stomach.desc },
  { name: T.sniffer.name, text: T.sniffer.desc },
  { name: T.nutrition.name, text: T.nutrition.desc },
  { name: T.fans.name, text: T.fans.desc },
];

export default function MetersInfoPanel() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {METER_ROWS.map((row) => (
          <div key={row.name} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">
              {row.name}
            </span>
            <span className="text-[10px] leading-relaxed text-slate-400">
              {row.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 border-t border-sky-200/10 pt-2.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-400">
          {M.info.skillsTitle}
        </span>
        <p className="text-[10px] leading-relaxed text-slate-400">
          {M.info.skillsIntro}
        </p>
        {SKILL_ROWS.map((row) => (
          <div key={row.name} className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">
              {row.name}
            </span>
            <span className="text-[10px] leading-relaxed text-slate-400">
              {row.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

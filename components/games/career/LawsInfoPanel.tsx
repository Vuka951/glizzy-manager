import PaperSheet from '@/components/games/career/street/PaperSheet';
import {
  CONSTITUTION_FROM_YEAR,
  CONSTITUTION_PASS_SHARE,
  LAW_LEADER_HUMAN_WEIGHT,
  LAW_LEADER_WEIGHT,
  LAW_PARTNER_HUMAN_WEIGHT,
  LAW_PARTNER_PASS_SHARE,
  LAW_PARTNER_WEIGHT,
  LAW_PASS_SHARE,
  LAW_VOTE_SEASON,
  MAX_LAWS_IN_FORCE,
} from '@/data/games/careerLaws';
import { GAMES_UI } from '@/data/games/locale';
import { constitutionSeatsNeeded } from '@/lib/utils/careerLaws';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt } from '@/lib/utils/format';

const I = GAMES_UI.career.laws.info;

const WEIGHTS = [
  { bench: I.leader, ai: LAW_LEADER_WEIGHT, human: LAW_LEADER_HUMAN_WEIGHT },
  { bench: I.partner, ai: LAW_PARTNER_WEIGHT, human: LAW_PARTNER_HUMAN_WEIGHT },
];

// How a law gets on the books and off them again, the constitution that
// ends it all and the vote weights, as a typed notice with numbered clauses
// behind a red margin and a small ruled table
export default function LawsInfoPanel() {
  const steps = [
    fmt(I.when, { season: seasonName(LAW_VOTE_SEASON) }),
    fmt(I.pass, {
      share: Math.round(LAW_PASS_SHARE * 100),
      partner: Math.round(LAW_PARTNER_PASS_SHARE * 100),
    }),
    fmt(I.stays, { max: MAX_LAWS_IN_FORCE }),
    fmt(I.constitution, {
      seats: constitutionSeatsNeeded(),
      year: CONSTITUTION_FROM_YEAR,
      share: Math.round(CONSTITUTION_PASS_SHARE * 100),
    }),
  ];
  return (
    <PaperSheet className="flex flex-col gap-3 px-3 pb-3.5 pt-3 text-left">
      <ol className="flex flex-col border-t-[3px] border-double border-slate-200">
        {steps.map((line, i) => (
          <li
            key={i}
            className="grid grid-cols-[1.5rem_minmax(0,1fr)] border-b border-slate-600/50 py-1 font-serif text-[12px] leading-snug text-slate-200"
          >
            <span className="border-r-2 border-r-[#b91c1c]/50 pr-1 font-sign text-[14px] font-bold tabular-nums text-slate-300">
              {i + 1}
            </span>
            <span className="pl-2">{line}</span>
          </li>
        ))}
      </ol>
      <div className="grid grid-cols-[1fr_auto_auto] items-baseline gap-x-4">
        <span className="border-b-[3px] border-double border-slate-200 pb-0.5 font-sign text-[13px] font-bold uppercase tracking-[0.08em] text-slate-300">
          {I.weightTitle}
        </span>
        <span className="border-b-[3px] border-double border-slate-200 pb-0.5 text-right font-sign text-[13px] font-bold uppercase tracking-[0.08em] text-slate-300">
          {I.ai}
        </span>
        <span className="border-b-[3px] border-double border-slate-200 pb-0.5 text-right font-sign text-[13px] font-bold uppercase tracking-[0.08em] text-amber-300">
          {I.human}
        </span>
        {WEIGHTS.map((row) => (
          <span key={row.bench} className="contents">
            <span className="border-b border-slate-600/50 py-0.5 font-serif text-[13px] text-slate-200">
              {row.bench}
            </span>
            <span className="border-b border-slate-600/50 py-0.5 text-right font-sign text-[16px] font-bold tabular-nums text-slate-200">
              ×{row.ai}
            </span>
            <span className="border-b border-slate-600/50 py-0.5 text-right font-sign text-[16px] font-bold tabular-nums text-amber-300">
              ×{row.human}
            </span>
          </span>
        ))}
      </div>
    </PaperSheet>
  );
}

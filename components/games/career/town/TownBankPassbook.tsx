import PaperSheet from '@/components/games/career/street/PaperSheet';
import TownBankPassbookEntry from '@/components/games/career/town/TownBankPassbookEntry';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import {
  DEBT_INTEREST_RATE,
  DEBT_RUN_OVER_WINDOWS,
  DEBT_WARNING_WINDOWS,
} from '@/data/games/careerCredit';
import { GAMES_UI } from '@/data/games/locale';
import { fmt } from '@/lib/utils/format';

const TOWN = GAMES_UI.career.town;
const ACC = TOWN.account;
const LABEL =
  'font-sign text-[13px] font-semibold uppercase tracking-[0.06em] text-[#57534e]';

// The account as the bank prints it in the coach's red-bound passbook: the
// balance up top, the debt, the next window's interest and what is left on
// the line entered below on ruled paper, and while anything is owed the debt
// clock stamped across the foot
export default function TownBankPassbook({
  balance,
  debt,
  interest,
  room,
  limit,
  windows,
  clock,
}: {
  balance: number;
  debt: number;
  interest: number;
  room: number;
  limit: number;
  windows: number;
  clock: boolean;
}) {
  return (
    <PaperSheet className="overflow-hidden py-3 pl-7 pr-4 text-left">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0_23px,rgb(28_25_23/0.07)_23px_24px)]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-3.5 bg-[#7f1d1d] shadow-[inset_-2px_0_3px_rgb(0_0_0/0.3)]"
      />
      <div className="relative text-[#1c1917]">
        <div className="border-y-[3px] border-double border-[#1c1917] py-1 text-center">
          <p className="font-serif text-base font-black uppercase tracking-[0.2em]">
            {TOWN.bankTitle}
          </p>
        </div>
        <div className="mt-2.5 flex items-end justify-between gap-3">
          <span className={LABEL}>{ACC.balance}</span>
          <span className="flex flex-col items-end">
            <span
              className={`flex items-center gap-1.5 font-sign text-4xl font-extrabold leading-none tabular-nums ${
                balance < 0 ? 'text-[#b91c1c]' : 'text-[#065f46]'
              }`}
            >
              <GlizzyIcon variant={3} className="h-4 w-7" />
              {balance}
            </span>
            <span className={`mt-0.5 ${LABEL}`}>
              {GAMES_UI.career.hud.currency}
            </span>
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-1 border-t border-[#1c1917]/60 pt-2">
          <TownBankPassbookEntry
            label={ACC.debt}
            value={debt}
            tone={debt > 0 ? 'text-[#b91c1c]' : 'text-[#1c1917]'}
          />
          <TownBankPassbookEntry
            label={ACC.interest}
            note={fmt(ACC.rate, { pct: Math.round(DEBT_INTEREST_RATE * 100) })}
            value={interest}
            tone={interest > 0 ? 'text-[#92400e]' : 'text-[#1c1917]'}
          />
          <TownBankPassbookEntry
            label={ACC.line}
            value={fmt(ACC.lineOf, { room, limit })}
          />
        </div>
        {clock && (
          <div className="mt-2.5 flex flex-col gap-1.5 border-t border-[#1c1917]/60 pt-2">
            <span className="flex items-center justify-between gap-2">
              <span className={LABEL}>{ACC.clock}</span>
              <span
                className={`font-sign text-[14px] font-bold tabular-nums ${
                  windows >= DEBT_WARNING_WINDOWS
                    ? 'text-[#b91c1c]'
                    : 'text-[#57534e]'
                }`}
              >
                {windows}/{DEBT_RUN_OVER_WINDOWS}
              </span>
            </span>
            <span className="flex w-full gap-[3px]">
              {Array.from({ length: DEBT_RUN_OVER_WINDOWS }).map((_, i) => (
                <span
                  key={i}
                  className={`h-2.5 flex-1 rounded-[1px] border ${
                    i < windows
                      ? 'border-[#991b1b] bg-[#b91c1c]'
                      : i >= DEBT_WARNING_WINDOWS
                        ? 'border-[#b91c1c]/50 bg-[#fee2e2]/60'
                        : 'border-[#1c1917]/25'
                  }`}
                />
              ))}
            </span>
          </div>
        )}
      </div>
    </PaperSheet>
  );
}

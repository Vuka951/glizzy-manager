'use client';

import BrassPlate from '@/components/games/career/street/BrassPlate';
import TownBankLoanDesk from '@/components/games/career/town/TownBankLoanDesk';
import TownBankPassbook from '@/components/games/career/town/TownBankPassbook';
import { GAMES_UI } from '@/data/games/locale';
import {
  creditLimit,
  creditRoom,
  debtInterest,
  debtOf,
  loanOf,
} from '@/lib/utils/careerCredit';
import type { SavedCareer } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';

const TOWN = GAMES_UI.career.town;
const ACC = TOWN.account;

// The bank's counter: a plate over the barred teller window, which takes up
// whatever height the room has spare, the coach's passbook on the counter top,
// and the two trays routed into the wood in front of it.
// Anyone may ask for a loan, so the borrowing tray is always out and only
// goes dead while the line has no room; the repaying tray comes out while a
// loan is owed
export default function TownBankOffice({
  career,
  onBorrow,
  onRepay,
}: {
  career: SavedCareer;
  onBorrow: (amount: number) => void;
  onRepay: (amount: number) => void;
}) {
  const ch = career.characters[career.playerSlug];
  const balance = career.balance;
  const limit = creditLimit(ch, career.parliament);
  const room = creditRoom(ch, career.parliament);
  const loan = loanOf(ch);
  const debt = debtOf(ch, balance);
  const windows = ch.debtWindows ?? 0;

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="flex min-h-12 flex-1 justify-center rounded-t-[5px] border-x-4 border-t-4 border-[#5a3d26] bg-[#120b05] bg-[repeating-linear-gradient(90deg,transparent_0_26px,#a8782a_26px_28px,rgb(0_0_0/0.5)_28px_29px),radial-gradient(ellipse_at_50%_0%,rgb(252_211_77/0.22),transparent_70%)] shadow-[inset_0_4px_10px_rgb(0_0_0/0.8)]">
        <BrassPlate className="-mt-1 self-start">{TOWN.bankOffice}</BrassPlate>
      </div>
      <TownBankPassbook
        balance={balance}
        debt={debt}
        interest={debtInterest(debt)}
        room={room}
        limit={limit}
        windows={windows}
        clock={debt > 0 || windows > 0}
      />
      <div
        className={`mt-3 grid grid-cols-1 gap-2 ${loan > 0 ? 'sm:grid-cols-2' : ''}`}
      >
        <TownBankLoanDesk
          title={ACC.borrow}
          max={room}
          tone="buy"
          action={(amount) => fmt(ACC.borrowAmount, { amount })}
          onConfirm={onBorrow}
        />
        {loan > 0 && (
          <TownBankLoanDesk
            title={ACC.repay}
            max={Math.min(loan, Math.max(0, balance))}
            tone="good"
            action={(amount) => fmt(ACC.repayAmount, { amount })}
            onConfirm={onRepay}
          />
        )}
      </div>
    </div>
  );
}

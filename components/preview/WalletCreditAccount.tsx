'use client';

import { useState } from 'react';
import CareerWalletChip from '@/components/games/career/CareerWalletChip';
import TownBankOffice from '@/components/games/career/town/TownBankOffice';
import { borrowLoan, repayLoan } from '@/lib/utils/careerCredit';
import type { SavedCareer } from '@/lib/utils/careerSave';

// One account at the bank's counter, its keys moving the money like the game
export default function WalletCreditAccount({
  career: start,
  label,
}: {
  career: SavedCareer;
  label: string;
}) {
  const [career, setCareer] = useState(start);
  const move = (kind: 'borrow' | 'repay', amount: number) => {
    const next = (kind === 'borrow' ? borrowLoan : repayLoan)(
      career.characters[career.playerSlug],
      career.balance,
      amount,
    );
    if (!next) return;
    setCareer({
      ...career,
      balance: next.wallet,
      characters: { ...career.characters, [career.playerSlug]: next.ch },
    });
  };
  return (
    <div className="flex w-full max-w-sm flex-col gap-2 rounded-3xl border border-frost-border/30 bg-slate-900 p-4">
      <span className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9px] text-slate-500">{label}</span>
        <CareerWalletChip balance={career.balance} />
      </span>
      <TownBankOffice
        career={career}
        onBorrow={(amount) => move('borrow', amount)}
        onRepay={(amount) => move('repay', amount)}
      />
    </div>
  );
}

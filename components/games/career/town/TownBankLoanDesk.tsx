'use client';

import { useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import BrassPlate from '@/components/games/career/street/BrassPlate';
import StakePicker from '@/components/games/StakePicker';
import { LOAN_STEPS } from '@/data/games/careerCredit';
import { STREET_TRAY } from '@/lib/utils/careerFrameClasses';
import { playCoinSound } from '@/lib/utils/gameSounds';

// One tray on the counter: the amounts it offers up to `max`, and the key
// that moves the picked one. With nothing to move, the usual amounts lie
// greyed out and the key is dead
export default function TownBankLoanDesk({
  title,
  max,
  tone,
  action,
  onConfirm,
}: {
  title: string;
  max: number;
  tone: 'buy' | 'good';
  action: (amount: number) => string;
  onConfirm: (amount: number) => void;
}) {
  const options =
    max > 0 ? [...LOAN_STEPS.filter((step) => step < max), max] : LOAN_STEPS;
  const [picked, setPicked] = useState(LOAN_STEPS[0]);
  // A line or a wallet that shrank since the pick falls back to what is left
  const amount =
    max <= 0
      ? 0
      : options.includes(picked)
        ? picked
        : ([...options].reverse().find((option) => option <= picked) ??
          options[0]);

  return (
    <div className={`flex flex-col items-start gap-2.5 p-3 ${STREET_TRAY}`}>
      <BrassPlate>{title}</BrassPlate>
      <StakePicker
        options={options}
        value={amount}
        balance={max}
        onPick={setPicked}
      />
      <CareerButton
        tone={tone}
        size="md"
        full
        className="min-h-11"
        disabled={amount <= 0}
        onClick={() => {
          playCoinSound(amount);
          onConfirm(amount);
        }}
      >
        {amount > 0 ? action(amount) : title}
      </CareerButton>
    </div>
  );
}

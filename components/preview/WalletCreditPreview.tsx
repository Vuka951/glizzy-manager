'use client';

import WalletCreditAccount from '@/components/preview/WalletCreditAccount';
import type {
  PartyStatus,
  SavedCareer,
  SponsorId,
} from '@/lib/utils/careerSave';

// Every account the bank's counter can show, the line and the loan read off
// a real character state; the keys move the money like the game does
const ACCOUNTS: {
  label: string;
  balance: number;
  sponsorId?: SponsorId;
  partyStatus?: PartyStatus;
  loan?: number;
  debtWindows?: number;
}[] = [
  { label: 'No loan, in the black', balance: 640 },
  { label: 'No loan, account in the red', balance: -35, sponsorId: 'blue', debtWindows: 2 },
  { label: 'Yellow, no debt', balance: 120, sponsorId: 'yellow' },
  {
    label: 'Yellow, partner, in debt',
    balance: 90,
    sponsorId: 'yellow',
    partyStatus: 'partner',
    loan: 180,
    debtWindows: 3,
  },
  {
    label: 'Yellow, leading party, close to a warning',
    balance: 40,
    sponsorId: 'yellow',
    partyStatus: 'leader',
    loan: 460,
    debtWindows: 12,
  },
  {
    label: 'Former client, debt left over',
    balance: 75,
    loan: 120,
    debtWindows: 5,
  },
];

function accountCareer(
  career: SavedCareer,
  account: (typeof ACCOUNTS)[number],
): SavedCareer {
  const ch = career.characters[career.playerSlug];
  return {
    ...career,
    balance: account.balance,
    characters: {
      ...career.characters,
      [career.playerSlug]: {
        ...ch,
        sponsor: account.sponsorId ? { sponsorId: account.sponsorId } : null,
        partyStatus: account.partyStatus,
        loan: account.loan,
        debtWindows: account.debtWindows,
      },
    },
  };
}

export default function WalletCreditPreview({
  career,
}: {
  career: SavedCareer;
}) {
  return (
    <div className="flex flex-wrap items-start gap-4">
      {ACCOUNTS.map((account) => (
        <WalletCreditAccount
          key={account.label}
          label={account.label}
          career={accountCareer(career, account)}
        />
      ))}
    </div>
  );
}

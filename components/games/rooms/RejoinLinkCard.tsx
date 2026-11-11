'use client';

import { useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import { GAMES_UI } from '@/data/games/locale';

const R = GAMES_UI.rooms.rejoin;

// The seat's own way back in from another device: a cloakroom slip with the
// room link typed on it, the token in the fragment, never sent to the server
// as part of a URL
export default function RejoinLinkCard({
  roomPath,
  token,
}: {
  // Site path of the room page, e.g. `/rivals/<CODE>`
  roomPath: string;
  token: string;
}) {
  const [copied, setCopied] = useState(false);
  const link =
    typeof window === 'undefined'
      ? ''
      : `${window.location.origin}${roomPath}#token=${token}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // the field stays selectable
    }
  };
  return (
    <PaperSheet className="flex w-full flex-col gap-2 px-3 py-3 text-left">
      <span className="border-b-[3px] border-double border-[#1c1408]/70 pb-1 font-serif text-[15px] font-bold text-slate-100">
        {R.title}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <input
          readOnly
          aria-label={R.title}
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="min-h-11 min-w-0 flex-1 basis-48 border-b border-dotted border-[#1c1408]/60 bg-transparent px-1 font-sign text-[13px] tabular-nums text-slate-300 focus:border-[#b91c1c] focus:outline-none"
        />
        <CareerButton onClick={copy} className="min-h-11 shrink-0">
          {copied ? R.copied : R.copy}
        </CareerButton>
      </div>
    </PaperSheet>
  );
}

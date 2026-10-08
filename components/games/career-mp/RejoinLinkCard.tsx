'use client';

import { useState } from 'react';
import { GAMES_UI } from '@/data/games/locale';
import { rivalsRoomPath } from '@/lib/constants/routes';

const R = GAMES_UI.careerMp.rejoin;

// The coach's own way back in from another device: the room link with the
// token in the fragment, never sent to the server as part of a URL
export default function RejoinLinkCard({
  code,
  token,
}: {
  code: string;
  token: string;
}) {
  const [copied, setCopied] = useState(false);
  const link =
    typeof window === 'undefined'
      ? ''
      : `${window.location.origin}${rivalsRoomPath(code)}#token=${token}`;
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
    <div className="flex w-full flex-col gap-2 rounded-2xl border border-sky-200/15 bg-slate-950/70 p-3 text-left">
      <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-sky-300">
        {R.title}
      </span>
      <p className="text-[11px] text-slate-400">{R.hint}</p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-lg border border-sky-200/10 bg-slate-900/70 px-2 py-1 font-mono text-[10px] text-slate-300"
        />
        <button
          onClick={copy}
          className="shrink-0 rounded-lg border border-sky-200/20 bg-slate-800/60 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-200 transition hover:border-sky-200/40 hover:text-white"
        >
          {copied ? R.copied : R.copy}
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import SniffCue from '@/components/games/match/SniffCue';
import SniffScent from '@/components/games/match/SniffScent';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';

export default function SniffPreview() {
  const [sniffKey, setSniffKey] = useState(0);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <PreviewTriggerButton
          label="Replay"
          onClick={() => setSniffKey((k) => k + 1)}
        />
      </div>
      <div className="relative flex h-36 items-center justify-center gap-16 rounded-2xl border border-sky-200/10 bg-slate-950/70">
        <span className="flex flex-col items-center gap-2">
          <SniffCue key={`l-${sniffKey}`} tailSide="left" />
          <SniffScent
            key={`su-${sniffKey}`}
            direction="up"
            className="relative"
          />
        </span>
        <span className="flex flex-col items-center gap-2">
          <SniffCue key={`r-${sniffKey}`} tailSide="right" />
          <SniffScent
            key={`sd-${sniffKey}`}
            direction="down"
            className="relative"
          />
        </span>
      </div>
    </>
  );
}

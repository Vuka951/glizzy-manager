'use client';

import { useState } from 'react';
import TrailerModal from '@/components/hub/TrailerModal';
import Icon from '@/components/icons/Icon';

// The small secondary "watch the trailer" control. The label arrives as a
// prop so the hub page can render it on the server with the request's
// language; the modal itself only mounts in the browser, after a click
export default function TrailerButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/20 px-4 py-2 text-xs font-bold text-slate-300 transition hover:border-sky-200/50 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
      >
        <Icon name="play" className="h-3.5 w-3.5" />
        {label}
      </button>
      {open && <TrailerModal onClose={() => setOpen(false)} />}
    </>
  );
}

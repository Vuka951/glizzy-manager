import { useEffect, useRef, useState } from 'react';
import { GAMES_UI } from '@/data/games/locale';
import { fmt } from '@/lib/utils/format';

const H = GAMES_UI.shared.hold;
const AUTO_CONTINUE_S = 10;

// Holds an intro card open: the countdown presses "continue" on its own
// unless the viewer asks to stay, after which only a click moves on. `auto`
// tells the parent whether the countdown or the viewer pressed it. While
// `paused` the countdown does not tick, for a card that is still playing
export default function IntroHoldControls({
  onContinue,
  paused = false,
  onStay,
}: {
  onContinue: (auto: boolean) => void;
  paused?: boolean;
  onStay?: () => void;
}) {
  const [stayed, setStayed] = useState(false);
  const [remaining, setRemaining] = useState(AUTO_CONTINUE_S);
  const onContinueRef = useRef(onContinue);
  const firedRef = useRef(false);

  useEffect(() => {
    onContinueRef.current = onContinue;
  }, [onContinue]);

  useEffect(() => {
    if (stayed || paused || firedRef.current) return;
    if (remaining <= 0) {
      firedRef.current = true;
      onContinueRef.current(true);
      return;
    }
    const timer = window.setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [stayed, paused, remaining]);

  const counting = !stayed && !paused && remaining > 0;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => {
          setStayed(true);
          onStay?.();
        }}
        disabled={stayed}
        className={`rounded-xl border px-4 py-1.5 text-xs font-semibold transition ${
          stayed
            ? 'border-amber-400/60 bg-amber-500/20 text-amber-200'
            : 'border-sky-200/20 bg-slate-800/60 text-slate-300 hover:border-sky-200/45 hover:bg-slate-800 hover:text-white'
        }`}
      >
        {H.stay}
      </button>
      <button
        type="button"
        onClick={() => onContinue(false)}
        className="min-w-28 rounded-xl border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-semibold text-red-200 transition [font-variant-numeric:tabular-nums] hover:border-red-500/60 hover:bg-red-500/25 hover:text-white"
      >
        {counting ? fmt(H.continueIn, { seconds: remaining }) : H.continue}
      </button>
    </div>
  );
}

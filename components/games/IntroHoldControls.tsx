import { useEffect, useRef, useState } from 'react';
import CareerButton from '@/components/games/career/CareerButton';
import CareerToggle from '@/components/games/career/CareerToggle';
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
      <CareerToggle
        selected={stayed}
        tone="amber"
        onClick={() => {
          setStayed(true);
          onStay?.();
        }}
        disabled={stayed}
      >
        {H.stay}
      </CareerToggle>
      <CareerButton
        tone="danger"
        onClick={() => onContinue(false)}
        className="min-w-28 [font-variant-numeric:tabular-nums]"
      >
        {counting ? fmt(H.continueIn, { seconds: remaining }) : H.continue}
      </CareerButton>
    </div>
  );
}

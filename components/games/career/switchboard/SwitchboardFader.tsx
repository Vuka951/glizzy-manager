'use client';

import { useLayoutEffect, useRef } from 'react';

const TRACK =
  '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-[1px] [&::-webkit-slider-runnable-track]:bg-[linear-gradient(90deg,#c9942f_var(--fader),#050302_var(--fader))] [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-[1px] [&::-moz-range-track]:bg-[linear-gradient(90deg,#c9942f_var(--fader),#050302_var(--fader))]';
const WEBKIT_CAP =
  '[&::-webkit-slider-thumb]:mt-[-13px] [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-[2px] [&::-webkit-slider-thumb]:bg-[linear-gradient(90deg,#6f4f1c,#e8c066_32%,#20140a_44%,#20140a_56%,#e8c066_68%,#6f4f1c)] [&::-webkit-slider-thumb]:shadow-[-2px_0_0_rgb(0_0_0/0.65)]';
const MOZ_CAP =
  '[&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:rounded-[2px] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[linear-gradient(90deg,#6f4f1c,#e8c066_32%,#20140a_44%,#20140a_56%,#e8c066_68%,#6f4f1c)] [&::-moz-range-thumb]:shadow-[-2px_0_0_rgb(0_0_0/0.65)]';

// On a touch screen only the cap takes the finger, with a clear 44px around
// it, so a swipe that lands on the track still scrolls the board
const TOUCH_CAP =
  'pointer-coarse:pointer-events-none pointer-coarse:[&::-webkit-slider-thumb]:pointer-events-auto pointer-coarse:[&::-webkit-slider-thumb]:mt-[-19px] pointer-coarse:[&::-webkit-slider-thumb]:box-border pointer-coarse:[&::-webkit-slider-thumb]:h-11 pointer-coarse:[&::-webkit-slider-thumb]:w-11 pointer-coarse:[&::-webkit-slider-thumb]:border-x-[13px] pointer-coarse:[&::-webkit-slider-thumb]:border-y-[6px] pointer-coarse:[&::-webkit-slider-thumb]:border-solid pointer-coarse:[&::-webkit-slider-thumb]:border-transparent pointer-coarse:[&::-webkit-slider-thumb]:bg-clip-padding pointer-coarse:[&::-webkit-slider-thumb]:shadow-none pointer-coarse:[&::-moz-range-thumb]:pointer-events-auto pointer-coarse:[&::-moz-range-thumb]:box-border pointer-coarse:[&::-moz-range-thumb]:h-11 pointer-coarse:[&::-moz-range-thumb]:w-11 pointer-coarse:[&::-moz-range-thumb]:border-x-[13px] pointer-coarse:[&::-moz-range-thumb]:border-y-[6px] pointer-coarse:[&::-moz-range-thumb]:border-solid pointer-coarse:[&::-moz-range-thumb]:border-transparent pointer-coarse:[&::-moz-range-thumb]:bg-clip-padding pointer-coarse:[&::-moz-range-thumb]:shadow-none';

// A mixing desk fader standing on its rail. It is a horizontal range turned a
// quarter, the one way a vertical slider works in every browser, and it takes
// all touch so dragging the cap does not scroll the board instead. The turn is
// a `transform`: Chrome only follows a finger up a range it sees rotated there,
// and Tailwind's `rotate` utility sets the separate `rotate` property. The lit
// part of the track follows `--fader`, set on the element from the value
export default function SwitchboardFader({
  value,
  label,
  onChange,
}: {
  value: number;
  label: string;
  onChange: (value: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    inputRef.current?.style.setProperty('--fader', `${value}%`);
  }, [value]);

  return (
    <span className="relative block h-[124px] w-11">
      <span
        aria-hidden="true"
        className="absolute inset-y-[9px] left-0.5 w-1.5 bg-[repeating-linear-gradient(0deg,#a8946c_0_1px,transparent_1px_10%)]"
      />
      <span
        aria-hidden="true"
        className="absolute inset-y-[9px] right-0.5 w-1.5 bg-[repeating-linear-gradient(0deg,#a8946c_0_1px,transparent_1px_10%)]"
      />
      <input
        ref={inputRef}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className={`absolute left-1/2 top-1/2 h-11 w-[124px] -translate-x-1/2 -translate-y-1/2 [transform:rotate(-90deg)] cursor-pointer touch-none appearance-none bg-transparent focus-visible:outline-2 focus-visible:outline-[#f0dca8] ${TRACK} ${WEBKIT_CAP} ${MOZ_CAP} ${TOUCH_CAP}`}
      />
    </span>
  );
}

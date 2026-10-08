import type { ComponentProps } from 'react';

// Black Dwarf Corporation: a compact four-point star with a white core on a
// near-black field, zinc rather than slate so the light theme does not flip
// the field. Same rounded badge as the other three marks
export default function BlackDwarfMark({
  className = 'h-5 w-5',
  ...rest
}: ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <rect x="1" y="1" width="22" height="22" rx="6" className="fill-zinc-900" />
      <circle cx="12" cy="12" r="8.4" className="fill-none stroke-yellow-300" strokeWidth="0.9" />
      <path
        d="M12 2.6 14.3 9.7 21.4 12 14.3 14.3 12 21.4 9.7 14.3 2.6 12 9.7 9.7Z"
        className="fill-yellow-300"
      />
      <circle cx="12" cy="12" r="2.8" className="fill-zinc-50" />
    </svg>
  );
}

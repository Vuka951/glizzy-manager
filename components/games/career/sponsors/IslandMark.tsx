import type { ComponentProps } from 'react';

// The Island: a palm on a sand bank under a coin of a sun, mint on deep
// emerald. Same rounded badge as the other three marks
export default function IslandMark({
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
      <rect x="1" y="1" width="22" height="22" rx="6" className="fill-emerald-700" />
      <circle cx="6.2" cy="6.6" r="3.3" className="fill-amber-300" />
      <circle cx="6.2" cy="6.6" r="1.7" className="fill-none stroke-emerald-700" strokeWidth="1" />
      <path d="M4 22.5c1-6.5 15-6.5 16 0Z" className="fill-amber-300" />
      <path
        d="M10.3 21.5C10.3 16 11.3 12 14.2 8.6"
        className="fill-none stroke-emerald-300"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M14.2 8.6Q11.6 7.4 9.4 9.6M14.2 8.6Q12.8 4.6 9.6 3.6M14.2 8.6Q15.8 4.2 19.2 4.4M14.2 8.6Q17.8 7.6 19.8 10.8"
        className="fill-none stroke-emerald-300"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

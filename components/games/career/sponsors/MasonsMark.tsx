import type { ComponentProps } from 'react';

// Masons' Guild: a terracotta brick badge with pale mortar courses and a
// trowel laid across it. Same rounded badge as the other three marks
export default function MasonsMark({
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
      <rect x="1" y="1" width="22" height="22" rx="6" className="fill-orange-700" />
      <path
        d="M1.5 8h21M1.5 16h21M12 1.5V8M7 8v8M17 8v8M12 16v6.5"
        className="fill-none stroke-stone-200"
        strokeWidth="1.4"
      />
      <g transform="rotate(45 12 12)">
        <rect x="9.6" y="1.5" width="4.8" height="6" rx="1.6" className="fill-stone-800" />
        <path d="M12 7v4" className="fill-none stroke-stone-800" strokeWidth="1.8" />
        <path
          d="M12 21 7.2 10.8q4.8-2.2 9.6 0Z"
          className="fill-stone-100 stroke-stone-800"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

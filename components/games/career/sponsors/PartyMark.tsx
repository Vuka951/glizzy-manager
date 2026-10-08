import type { ComponentProps } from 'react';

// The People's List: a gold rosette with a red centre disc and two red ribbon
// tails on a blue field, the kind of thing pinned to a lapel at a rally. Same rounded
// badge as the other three marks
export default function PartyMark({
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
      <rect x="1" y="1" width="22" height="22" rx="6" className="fill-blue-800" />
      <path d="M8.2 13 5.2 22.2l3.8-1.4 2.2-6.2ZM15.8 13l3 9.2-3.8-1.4-2.2-6.2Z" className="fill-red-600" />
      <circle cx="12" cy="10" r="6" className="fill-amber-300" />
      <circle cx="12" cy="4.8" r="2.1" className="fill-amber-300" />
      <circle cx="12" cy="15.2" r="2.1" className="fill-amber-300" />
      <circle cx="6.8" cy="10" r="2.1" className="fill-amber-300" />
      <circle cx="17.2" cy="10" r="2.1" className="fill-amber-300" />
      <circle cx="8.3" cy="6.3" r="2.1" className="fill-amber-300" />
      <circle cx="15.7" cy="6.3" r="2.1" className="fill-amber-300" />
      <circle cx="8.3" cy="13.7" r="2.1" className="fill-amber-300" />
      <circle cx="15.7" cy="13.7" r="2.1" className="fill-amber-300" />
      <circle cx="12" cy="10" r="3.4" className="fill-red-600" />
    </svg>
  );
}

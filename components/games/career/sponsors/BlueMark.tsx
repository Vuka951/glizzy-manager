import type { ComponentProps } from 'react';

// Blue Party: a white shield carrying a blue star on a deep blue field, the
// security-and-order party in blue and white. blue-50 stands in for white so
// the light theme does not flip it. Same rounded badge as the other three marks
export default function BlueMark({
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
      <rect x="1" y="1" width="22" height="22" rx="6" className="fill-blue-700" />
      <path
        d="M12 3.2 19.2 5.8v5.7c0 4.6-3 7.7-7.2 9.5-4.2-1.8-7.2-4.9-7.2-9.5V5.8Z"
        className="fill-blue-50"
      />
      <path
        d="M12 5.4 19 7.9v3.6c0 3.9-2.6 6.6-7 8.2-4.4-1.6-7-4.3-7-8.2V7.9Z"
        className="fill-none stroke-blue-700"
        strokeWidth="0.8"
      />
      <path
        d="M12 7.5 12.94 10.21 15.8 10.26 13.52 11.99 14.35 14.74 12 13.1 9.65 14.74 10.48 11.99 8.2 10.26 11.06 10.21Z"
        className="fill-blue-700"
      />
    </svg>
  );
}

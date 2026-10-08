import ActionIcon from '@/components/icons/ActionIcon';
import CrownIcon from '@/components/icons/CrownIcon';
import type { AchievementId } from '@/data/games/achievements';

type Props = { className?: string };

const STROKE = 'fill-none stroke-current';

function Svg({ className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

// Every trophy gets its own mark; some borrow the action icons the player
// already knows from the off-season menu
export default function AchievementIcon({
  id,
  className = 'h-6 w-6',
}: {
  id: AchievementId;
  className?: string;
}) {
  switch (id) {
    case 'career-first-title':
      return (
        <Svg className={className}>
          <path d="M7 3h10v6a5 5 0 0 1-10 0z" className="fill-current" />
          <path
            d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3"
            className={STROKE}
            strokeWidth="1.8"
          />
          <path d="M11 14h2v3h-2z" className="fill-current" />
          <rect
            x="7.5"
            y="17"
            width="9"
            height="3"
            rx="1"
            className="fill-current"
          />
        </Svg>
      );
    case 'career-perfect-year':
      return (
        <Svg className={className}>
          <rect
            x="3"
            y="3"
            width="8"
            height="8"
            rx="2"
            className="fill-current"
          />
          <rect
            x="13"
            y="3"
            width="8"
            height="8"
            rx="2"
            className="fill-current"
          />
          <rect
            x="3"
            y="13"
            width="8"
            height="8"
            rx="2"
            className="fill-current"
          />
          <rect
            x="13"
            y="13"
            width="8"
            height="8"
            rx="2"
            className="fill-current"
          />
        </Svg>
      );
    case 'career-overlord':
      return <CrownIcon className={className} />;
    case 'career-underdog':
      return (
        <Svg className={className}>
          <path
            d="M3 20h5v-5h5v-5h5V5h3"
            className={STROKE}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17 5h4v4"
            className={STROKE}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'career-rival-down':
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="7.5" className={STROKE} strokeWidth="2" />
          <circle cx="12" cy="12" r="2.5" className="fill-current" />
          <path
            d="M12 2v4M12 18v4M2 12h4M18 12h4"
            className={STROKE}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'career-sponsored':
      return (
        <Svg className={className}>
          <rect
            x="4"
            y="2.5"
            width="16"
            height="19"
            rx="2"
            className="fill-current"
          />
          <path
            d="M8 7h8M8 10.5h8M8 14h5"
            className="fill-none stroke-slate-900"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M8 18c1-1.5 2-1.5 3 0s2 1.5 3 0 2-1.5 2.5 0"
            className="fill-none stroke-slate-900"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'career-leader':
      return (
        <Svg className={className}>
          <path d="M12 2 2 8h20z" className="fill-current" />
          <rect x="4" y="9" width="2.5" height="8" className="fill-current" />
          <rect x="8.5" y="9" width="2.5" height="8" className="fill-current" />
          <rect x="13" y="9" width="2.5" height="8" className="fill-current" />
          <rect
            x="17.5"
            y="9"
            width="2.5"
            height="8"
            className="fill-current"
          />
          <rect
            x="2"
            y="18"
            width="20"
            height="3"
            rx="1"
            className="fill-current"
          />
        </Svg>
      );
    case 'career-favor':
      return (
        <Svg className={className}>
          <circle cx="12" cy="9" r="6" className="fill-current" />
          <path
            d="M12 6l.9 1.9 2.1.3-1.5 1.5.4 2.1L12 10.8l-1.9 1 .4-2.1L9 8.2l2.1-.3z"
            className="fill-slate-900 opacity-70"
          />
          <path
            d="M9 14l-2 7 5-2.5L17 21l-2-7"
            className="fill-current opacity-60"
          />
        </Svg>
      );
    case 'career-donor':
      return (
        <Svg className={className}>
          <ellipse cx="12" cy="7" rx="7" ry="3" className="fill-current" />
          <path
            d="M5 10c0 1.7 3.1 3 7 3s7-1.3 7-3v3c0 1.7-3.1 3-7 3s-7-1.3-7-3z"
            className="fill-current opacity-75"
          />
          <path
            d="M5 15c0 1.7 3.1 3 7 3s7-1.3 7-3v3c0 1.7-3.1 3-7 3s-7-1.3-7-3z"
            className="fill-current opacity-50"
          />
        </Svg>
      );
    case 'career-lost-cause':
      return (
        <Svg className={className}>
          <circle cx="12" cy="12" r="8" className="fill-current" />
          <path
            d="M12 7.5v9M9.8 9.5h3.4a1.6 1.6 0 0 1 0 3.2h-2.4a1.6 1.6 0 0 0 0 3.2h3.4"
            className="fill-none stroke-slate-900"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M4 4l16 16"
            className={STROKE}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'career-investor':
      return <ActionIcon kind="invest" className={className} />;
    case 'career-rich':
      return (
        <Svg className={className}>
          <path d="M9 3h6l-1.5 3h-3z" className="fill-current" />
          <path
            d="M8.5 6h7c3 3 4.5 6 4.5 9.5a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6C4 12 5.5 9 8.5 6z"
            className="fill-current"
          />
          <path
            d="M12 10v8M9.8 12h3.4a1.6 1.6 0 0 1 0 3.2h-2.4a1.6 1.6 0 0 0 0 3.2h3.4"
            className="fill-none stroke-slate-900"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'career-maxed':
      return <ActionIcon kind="training" className={className} />;
    case 'career-media-payday':
      return <ActionIcon kind="media" className={className} />;
    case 'career-plot-hit':
      return <ActionIcon kind="sabotage" className={className} />;
    case 'career-guard':
      return <ActionIcon kind="guard" className={className} />;
    case 'career-island':
      return <ActionIcon kind="island" className={className} />;
    case 'career-meltdown':
      return (
        <Svg className={className}>
          <path
            d="M12 21S4 14.7 4 9.5C4 6.4 6.4 4 9.2 4c1.6 0 2.8 1 2.8 1s1.2-1 2.8-1C17.6 4 20 6.4 20 9.5c0 5.2-8 11.5-8 11.5z"
            className="fill-current"
          />
          <path
            d="M12 5.5 9.8 10l3.4 2.6-2.6 4.9"
            className="fill-none stroke-slate-900"
            strokeWidth="1.6"
          />
        </Svg>
      );
    case 'career-decade':
      return (
        <Svg className={className}>
          <path
            d="M6 3h12v2l-4.5 6L18 17v4H6v-4l4.5-6L6 5z"
            className="fill-current"
          />
          <path d="M9 19.5h6l-3-4z" className="fill-slate-900 opacity-60" />
        </Svg>
      );
  }
}

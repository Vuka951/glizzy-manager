import { ImageResponse } from 'next/og';
import { dictionaryFor } from '@/data/games/locale';

// The social card: the game name and the English tagline beside one coach at
// his table. Drawn with JSX shapes only, in the default font the renderer
// ships with, so the build pulls in no image or font files. Satori has no
// stylesheet, so this is the one place styling has to be inline
const { hub } = dictionaryFor('en');

export const alt = hub.siteName;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#0a0f16';
const CARD = '#182a38';
const WHITE = '#f8fafc';
const MUTED = '#94a3b8';
const RED = '#ef4444';
const AMBER = '#f59e0b';
const MUSTARD = '#fde68a';
const SKIN = '#fde68a';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: `linear-gradient(135deg, ${INK} 0%, ${CARD} 100%)`,
          color: WHITE,
          overflow: 'hidden',
        }}
      >
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <path d="M700 0 560 630h330Z" fill="#bae6fd" fillOpacity="0.07" />
          <path d="M1080 0 920 630h330Z" fill="#bae6fd" fillOpacity="0.07" />
          <rect x="0" y="530" width="1200" height="100" fill="#0c1620" />
          <path d="M620 190q240 60 580-20" stroke="#334155" strokeWidth="5" fill="none" />
          <path d="m700 204 14 30 14-28Z" fill={RED} />
          <path d="m800 214 14 30 14-28Z" fill="#38bdf8" />
          <path d="m900 212 14 30 14-28Z" fill={MUSTARD} />
          <path d="m1000 200 14 30 14-28Z" fill={RED} />
          <path d="m1100 184 14 30 14-28Z" fill="#38bdf8" />
          <g transform="translate(890 520) scale(2.6)">
            <rect x="-22" y="-28" width="8" height="24" rx="4" fill={RED} />
            <rect x="14" y="-28" width="8" height="24" rx="4" fill={RED} />
            <path d="M-15 0v-22q0-9 9-9h12q9 0 9 9v22Z" fill={RED} />
            <path d="M-5-31h10l-5 8Z" fill={WHITE} />
            <circle cx="0" cy="-45" r="13" fill={SKIN} />
            <path d="M-13-47a13 13 0 0 1 26 0Z" fill="#44403c" />
            <rect x="-15.5" y="-49" width="31" height="4" rx="2" fill="#44403c" />
            <circle cx="-5" cy="-42" r="2" fill="#1c1917" />
            <circle cx="5" cy="-42" r="2" fill="#1c1917" />
            <path d="M-5-37q5 4 10 0" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none" />
          </g>
          <rect x="640" y="490" width="500" height="30" rx="6" fill="#b45309" />
          <rect x="654" y="520" width="472" height="60" fill="#92400e" />
          <circle cx="820" cy="500" r="17" fill={SKIN} />
          <circle cx="960" cy="500" r="17" fill={SKIN} />
          <ellipse cx="730" cy="486" rx="64" ry="14" fill="#f5f5f4" />
          <path d="M692 478h76" stroke={AMBER} strokeWidth="22" strokeLinecap="round" />
          <path d="M682 474h96" stroke={RED} strokeWidth="12" strokeLinecap="round" />
          <path d="m696 475 9-6 9 6 9-6 9 6 9-6 9 6 9-6 9 6" stroke={MUSTARD} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="1020" y="478" width="68" height="12" rx="4" fill={AMBER} />
          <rect x="1044" y="456" width="20" height="22" fill="#fbbf24" />
          <path d="M1018 384h72v36a36 36 0 0 1-72 0Z" fill="#fcd34d" />
          <path d="M1018 396h-12a17 17 0 0 0 14 27M1090 396h12a17 17 0 0 1-14 27" stroke="#fcd34d" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="m1054 402 5.3 10.8 12 1.7-8.7 8.4 2.1 12-10.7-5.7-10.7 5.7 2.1-12-8.7-8.4 12-1.7Z" fill="#d97706" />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 80,
            left: 80,
            display: 'flex',
            flexDirection: 'column',
            width: 600,
          }}
        >
          <svg width="150" height="150" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#0f172a" />
            <g transform="rotate(-30 16 16)">
              <path d="M8.5 17.5h15" stroke={AMBER} strokeWidth="12" strokeLinecap="round" />
              <path d="M6 15.5h20" stroke={RED} strokeWidth="6" strokeLinecap="round" />
              <path d="M9 16l2.5-2 2.5 2 2.5-2 2.5 2 2.5-2 2.5 2" fill="none" stroke={MUSTARD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
          <div
            style={{
              marginTop: 36,
              fontSize: 80,
              lineHeight: 1,
              letterSpacing: -3,
              color: WHITE,
            }}
          >
            {hub.siteName}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 30,
              lineHeight: 1.4,
              color: MUTED,
            }}
          >
            {hub.intro}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

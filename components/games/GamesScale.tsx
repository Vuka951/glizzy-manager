import { GAMES_ZOOM_CLASS } from '@/lib/constants/gamesScale';

// Big monitors scale the games pages as one piece, since the game cards
// have fixed internal layouts that per-element breakpoints would break.
// Zoom also multiplies viewport units, so anything sized off the viewport
// inside divides by --game-zoom; the height guard keeps ultrawides at a
// zoom their height can hold
export default function GamesScale({ children }: { children: React.ReactNode }) {
  return <div className={GAMES_ZOOM_CLASS}>{children}</div>;
}

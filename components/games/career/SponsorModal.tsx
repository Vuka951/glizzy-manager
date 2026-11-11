import GameModal from '@/components/games/GameModal';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';

// Every board the player opens while under contract carries the sponsor's
// emblem on its sign and its colours along the seam, so the deal is felt in
// the menus and not only read off the badge
export default function SponsorModal({
  sponsorId,
  title,
  wide = false,
  board = false,
  flush = false,
  titleExtra,
  headerExtra,
  onClose,
  children,
}: {
  sponsorId: SponsorId | null;
  title: string;
  wide?: boolean;
  board?: boolean | 'tall';
  titleExtra?: React.ReactNode;
  headerExtra?: React.ReactNode;
  flush?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const theme = sponsorId ? SPONSOR_THEMES[sponsorId] : null;
  return (
    <GameModal
      title={title}
      wide={wide}
      board={board}
      titleExtra={titleExtra}
      headerExtra={headerExtra}
      onClose={onClose}
      stripe={theme?.modalStripe}
      flush={flush}
      badge={
        sponsorId ? (
          <SponsorEmblem sponsorId={sponsorId} className="h-4 w-4" />
        ) : undefined
      }
    >
      {children}
    </GameModal>
  );
}

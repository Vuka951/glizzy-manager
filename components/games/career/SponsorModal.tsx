import GameModal from '@/components/games/GameModal';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';

// Every panel the player opens while under contract wears the sponsor's
// colors, so the deal is felt in the menus and not only read off the badge
export default function SponsorModal({
  sponsorId,
  title,
  wide = false,
  titleExtra,
  headerExtra,
  onClose,
  children,
}: {
  sponsorId: SponsorId | null;
  title: string;
  wide?: boolean;
  titleExtra?: React.ReactNode;
  headerExtra?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const theme = sponsorId ? SPONSOR_THEMES[sponsorId] : null;
  return (
    <GameModal
      title={title}
      wide={wide}
      titleExtra={titleExtra}
      headerExtra={headerExtra}
      onClose={onClose}
      accent={
        theme
          ? {
              frame: theme.modalFrame,
              title: theme.modalTitle,
              wash: theme.modalWash,
              stripe: theme.modalStripe,
            }
          : undefined
      }
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

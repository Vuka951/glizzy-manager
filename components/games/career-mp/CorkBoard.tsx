import CorkPanel from '@/components/games/career-mp/CorkPanel';
import StreetBoard from '@/components/games/career/street/StreetBoard';
import StreetSignPlate from '@/components/games/career/street/StreetSignPlate';

// The noticeboard in the league's hallway: a walnut frame with the screen's
// name on an enamel plate and cork to pin notices on. It hangs in the page,
// not over it
export default function CorkBoard({
  title,
  rail,
  children,
}: {
  title: string;
  // Anything fixed to the top rail beside the name
  rail?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <StreetBoard className="mt-5 w-full text-left motion-safe:animate-[bubblein_0.4s_ease-out]">
      <div className="flex flex-wrap items-center gap-2 px-1.5 pb-2.5 sm:gap-2.5">
        <StreetSignPlate>{title}</StreetSignPlate>
        {rail}
      </div>
      <CorkPanel className="rounded-[4px] border-t-[3px] border-[#b8862f] p-3 sm:p-5">
        {children}
      </CorkPanel>
    </StreetBoard>
  );
}

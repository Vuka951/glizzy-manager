import StreetSignPlate from '@/components/games/career/street/StreetSignPlate';

// The name of the room's current screen, on the same enamel plate as the
// town's street signs. The plate rides up over its box, so the padding gives
// that overhang back
export default function RoomSign({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex max-w-full justify-center pt-4 sm:pt-5">
      <StreetSignPlate>{children}</StreetSignPlate>
    </span>
  );
}

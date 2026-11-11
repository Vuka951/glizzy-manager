'use client';

import { TownTrophiesContext } from '@/components/games/career/town/townTrophies';

// Wraps the real career pages, so a click on the town's animals counts
// there and never in a preview
export default function TownTrophiesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TownTrophiesContext.Provider value>{children}</TownTrophiesContext.Provider>
  );
}

'use client';

import { CareerFramesContext } from '@/components/games/career/careerFrames';

// Puts every shared control below it in the career's street look
export default function CareerFramesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CareerFramesContext.Provider value="street">
      {children}
    </CareerFramesContext.Provider>
  );
}

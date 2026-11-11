import { createContext } from 'react';

// True inside a real career, single player or a room; the previews render
// the same town without it, so their clicks never earn a trophy
export const TownTrophiesContext = createContext(false);

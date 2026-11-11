import { animalSpecies } from '@/lib/constants/creatures/animalSpecies';
import { placeSpecies } from '@/lib/constants/creatures/placeSpecies';
import { tableSpecies } from '@/lib/constants/creatures/tableSpecies';
import { thingSpecies } from '@/lib/constants/creatures/thingSpecies';
import type { CreatureSpeciesDef } from '@/lib/types/creature';

export const CREATURE_SPECIES: readonly CreatureSpeciesDef[] = [
  ...tableSpecies,
  ...animalSpecies,
  ...placeSpecies,
  ...thingSpecies,
];

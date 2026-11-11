import LawCatalogEntry from '@/components/preview/LawCatalogEntry';
import { LAW_DEFS, LAW_ORDER } from '@/data/games/careerLaws';

// Every law in the game: the bill as the ballot prints it and its area
export default function LawCatalogPreview() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {LAW_ORDER.map((id) => (
        <LawCatalogEntry key={id} def={LAW_DEFS[id]} />
      ))}
    </ul>
  );
}

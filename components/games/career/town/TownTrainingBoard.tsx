import { GAMES_UI } from '@/data/games/locale';

const TOWN = GAMES_UI.career.town;
const PLATES = ['h-7 w-2', 'h-5 w-1.5', 'h-3 w-1'];

// The training center's plan on the gym wall: the old chalkboard filling the
// board, a barbell drawn across the top with the hall's name on it, the drills
// written out below and a wooden ledge along the foot with the chalk and the
// duster on it
export default function TownTrainingBoard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col text-left">
      <div className="relative overflow-hidden bg-[#1f3a2e] p-3 shadow-[inset_0_3px_10px_rgb(0_0_0/0.55)] sm:p-4">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_15%,rgb(255_255_255/0.07),transparent_55%),radial-gradient(ellipse_at_85%_80%,rgb(255_255_255/0.05),transparent_50%)]"
        />
        <div className="relative mb-3 flex items-center justify-center text-[#e7efe9]/80">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 flex items-center justify-between"
          >
            <span className="flex items-center gap-[2px]">
              {PLATES.map((size) => (
                <span key={size} className={`rounded-[2px] border-2 border-current ${size}`} />
              ))}
            </span>
            <span className="mx-[2px] h-[2px] flex-1 bg-current" />
            <span className="flex flex-row-reverse items-center gap-[2px]">
              {PLATES.map((size) => (
                <span key={size} className={`rounded-[2px] border-2 border-current ${size}`} />
              ))}
            </span>
          </span>
          <span className="relative rounded-[3px] border-2 border-current bg-[#1f3a2e] px-3 py-0.5 font-sign text-[15px] font-bold uppercase tracking-[0.14em] text-[#f8fafc]">
            {TOWN.signs.training}
          </span>
        </div>
        <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
          {children}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="relative h-3 shrink-0 border-t-2 border-[#b8862f] bg-[#5a3d26] bg-[repeating-linear-gradient(90deg,transparent_0_38px,rgb(0_0_0/0.09)_38px_40px)]"
      >
        <span className="absolute -top-1.5 left-6 h-1.5 w-8 rounded-full bg-[#f8fafc] shadow-[0_1px_0_rgb(0_0_0/0.4)]" />
        <span className="absolute -top-1.5 left-16 h-1.5 w-5 rounded-full bg-[#fde68a] shadow-[0_1px_0_rgb(0_0_0/0.4)]" />
        <span className="absolute -top-2.5 right-6 h-2.5 w-11 rounded-[2px] bg-[linear-gradient(to_bottom,#a16207_0_55%,#e5e7eb_55%)] shadow-[0_1px_0_rgb(0_0_0/0.45)]" />
      </div>
    </div>
  );
}

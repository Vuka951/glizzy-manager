const DOORS = Array.from({ length: 16 }, (_, i) => i);
const FIRST_NUMBER = 11;
const MINE = 17 - FIRST_NUMBER;

// The wall of old brass post office boxes behind the counter, one row on a
// phone and two on wider screens. The coach's own box glows while letters
// wait in it
export default function TownPostBoxes({ waiting }: { waiting: boolean }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-8 gap-1">
      {DOORS.map((i) => (
        <span
          key={i}
          className={`relative h-8 flex-col items-center justify-between rounded-[2px] bg-gradient-to-b from-[#e0b458] to-[#8a5a1c] py-[3px] shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_1px_1px_rgb(0_0_0/0.6)] ${
            i >= 8 ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <span
            className={`h-2.5 w-[72%] rounded-[1px] ring-1 ring-[#000000]/30 ${
              i === MINE && waiting
                ? 'bg-[linear-gradient(170deg,#fffdf5_0_55%,#facc15_55%)] shadow-[0_0_6px_#facc15]'
                : 'bg-[#0f172a]/85'
            }`}
          />
          <span className="font-sign text-[9px] font-bold leading-none text-[#1c1917]/80">
            {FIRST_NUMBER + i}
          </span>
          <span className="h-1 w-1 rounded-full bg-[#1c1917]/60" />
        </span>
      ))}
    </div>
  );
}

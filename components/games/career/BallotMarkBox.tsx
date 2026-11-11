import BallotMark from '@/components/games/career/BallotMark';

// One answer printed on the ballot, the whole line a button: the square, the
// word in its ink and the weight of this coach's vote when it counts for more
// than one
export default function BallotMarkBox({
  label,
  answer,
  selected,
  weight,
  onClick,
}: {
  label: string;
  answer: 'yes' | 'no';
  selected: boolean;
  weight?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-14 min-w-0 items-center justify-center gap-2.5 rounded-[2px] border-2 px-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e3a8a] ${
        selected
          ? 'border-slate-200 bg-[#fde047]/45'
          : 'border-slate-500 hover:border-slate-200 hover:bg-[#1c1408]/5'
      } ${answer === 'yes' ? 'text-emerald-300' : 'text-red-300'}`}
    >
      <BallotMark marked={selected} />
      <span className="font-sign text-[24px] font-extrabold uppercase leading-none tracking-[0.06em]">
        {label}
      </span>
      {weight !== undefined && weight > 1 && (
        <span className="font-sign text-[15px] font-bold tabular-nums text-slate-300">
          ×{weight}
        </span>
      )}
    </button>
  );
}

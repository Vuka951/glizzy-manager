// The hall's scoreboard once the match is over: a brass case, the lives left
// on two drums behind a dark window, the verdict lit underneath
export default function MatchScoreboard({
  livesA,
  livesB,
  winner,
  verdict,
  reason,
  note,
}: {
  livesA: number;
  livesB: number;
  winner: 'a' | 'b';
  verdict: string;
  reason?: string;
  note?: React.ReactNode;
}) {
  const drum = (lives: number, won: boolean) => (
    <span
      className={`flex h-12 w-10 items-center justify-center rounded-[2px] bg-[#1f140b] font-sign text-[38px] font-bold leading-none tabular-nums shadow-[inset_0_2px_5px_rgb(0_0_0/0.9),0_1px_0_rgb(255_255_255/0.08)] ${
        won ? 'text-[#86efac]' : 'text-[#94a3b8]'
      }`}
    >
      {lives}
    </span>
  );
  return (
    <div className="rounded-[6px] bg-gradient-to-b from-[#e8c066] to-[#a8782a] p-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_0_0_1px_#160c05,0_6px_0_rgb(0_0_0/0.55)] animate-[bubblein_0.35s_ease-out]">
      <div className="flex flex-col items-center gap-1 rounded-[3px] bg-[#140d07] px-5 py-3 shadow-[inset_0_1px_4px_rgb(0_0_0/0.9)]">
        <p className="flex items-center gap-2">
          {drum(livesA, winner === 'a')}
          <span className="font-sign text-[26px] font-bold leading-none text-[#a8782a]">
            :
          </span>
          {drum(livesB, winner === 'b')}
        </p>
        <p className="font-sign text-[15px] font-bold uppercase leading-tight tracking-[0.05em] text-[#fdf0c8]">
          {verdict}
        </p>
        {reason && (
          <p className="font-sign text-[13px] font-semibold uppercase leading-tight tracking-[0.05em] text-[#fca5a5]">
            {reason}
          </p>
        )}
        {note && (
          <p className="font-sign text-[13px] font-bold uppercase leading-tight tracking-[0.08em] text-[#fcd34d]">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

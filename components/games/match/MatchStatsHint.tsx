import HintTooltip from '@/components/games/HintTooltip';

// The gap where a reading would be. Hovering or tapping says what buys it,
// the only place the game admits there is something here to unlock. The
// bubble always opens toward the table, which is the one direction that is
// clear of the portrait and the name on either seat
export default function MatchStatsHint({
  text,
  placement,
}: {
  text: string;
  placement: 'up' | 'down';
}) {
  return (
    <HintTooltip
      text={text}
      placement={placement}
      className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-dashed border-slate-600 text-[8px] font-black leading-none text-slate-500 transition hover:border-sky-200/50 hover:text-sky-200"
    >
      ?
    </HintTooltip>
  );
}

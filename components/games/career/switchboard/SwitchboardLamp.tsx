// The pilot lamp beside a switch: a red jewel, lit while the circuit is live
export default function SwitchboardLamp({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-3 w-3 shrink-0 rounded-full ring-2 ring-[#9a6d24] transition-colors motion-reduce:transition-none ${
        on
          ? 'bg-[radial-gradient(circle_at_35%_30%,#fee2e2,#ef4444_55%,#991b1b)]'
          : 'bg-[radial-gradient(circle_at_35%_30%,#57402f,#1f140b_70%)]'
      }`}
    />
  );
}

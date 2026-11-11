// A bat-handled knife switch on a brass plate: the handle is thrown to the
// right when the circuit is on. The plate is smaller than the 44px it answers to
export default function BrassToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="flex h-11 w-[52px] shrink-0 items-center justify-center rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#f0dca8]"
    >
      <span className="relative block h-6 w-[50px] rounded-[3px] bg-gradient-to-b from-[#e8c066] to-[#9a6d24] shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_2px_0_rgb(0_0_0/0.6)]">
        <span className="absolute inset-x-2 top-1/2 h-1.5 -translate-y-1/2 rounded-[1px] bg-[#1a1008] shadow-[inset_0_1px_1px_rgb(0_0_0/0.9),0_1px_0_rgb(255_255_255/0.3)]" />
        <span
          className={`absolute top-1/2 h-[18px] w-3.5 -translate-y-1/2 rounded-[3px] bg-gradient-to-b from-[#f4f1ea] to-[#8f8a80] shadow-[inset_0_1px_0_rgb(255_255_255/0.8),0_2px_0_rgb(0_0_0/0.65)] transition-[left] duration-150 motion-reduce:transition-none ${
            checked ? 'left-[33px]' : 'left-[3px]'
          }`}
        />
      </span>
    </button>
  );
}

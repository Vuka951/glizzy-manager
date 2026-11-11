// The league's noticeboard surface: speckled cork that room notices are pinned
// to. Lives inside a board, so its paint is already fixed
export default function CorkPanel({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`bg-[#b4874f] bg-[radial-gradient(rgb(74_44_16/0.34)_0.8px,transparent_1.4px),radial-gradient(rgb(74_44_16/0.22)_1.3px,transparent_2.2px),radial-gradient(rgb(255_236_200/0.2)_0.9px,transparent_1.6px)] bg-[length:7px_11px,23px_17px,13px_9px] bg-[position:0_0,5px_3px,3px_6px] shadow-[inset_0_3px_8px_rgb(0_0_0/0.55)] ${className}`}
    >
      {children}
    </div>
  );
}

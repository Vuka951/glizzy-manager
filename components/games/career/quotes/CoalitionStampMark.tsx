// The office's red seal pressed onto the page
export default function CoalitionStampMark({
  className = '',
  animDelay,
}: {
  className?: string;
  animDelay?: number;
}) {
  return (
    <span
      data-anim="seal"
      data-anim-delay={animDelay}
      className={`absolute block rounded-full border-[1.5px] border-red-600/90 opacity-0 ${className}`}
    >
      <span className="absolute inset-[2px] rounded-full border border-red-600/80" />
      <span className="absolute left-1/2 top-1/2 h-[45%] w-[45%] -translate-x-1/2 -translate-y-1/2 bg-red-600/80 [clip-path:polygon(50%_0,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]" />
    </span>
  );
}

import GlizzyIcon from '@/components/icons/GlizzyIcon';

// The rally glizzy, placed by the caller. A bite animation on the clip path
// takes the end off it
export default function ElectionWinGlizzy({
  className = '',
  biteAnim,
}: {
  className?: string;
  biteAnim?: string;
}) {
  return (
    <span
      data-anim={biteAnim}
      className={`absolute h-[9px] w-[15px] [clip-path:polygon(0_0,60%_0,80%_0,100%_0,100%_100%,0_100%)] ${className}`}
    >
      <GlizzyIcon className="h-[9px] w-[15px]" />
    </span>
  );
}

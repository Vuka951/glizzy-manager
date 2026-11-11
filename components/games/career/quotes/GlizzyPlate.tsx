import GlizzyIcon from '@/components/icons/GlizzyIcon';

const GLIZZIES = ['left-0 -rotate-6', 'left-3 rotate-3', 'left-6 -rotate-3'];

// Three glizzies on a plate at the long table; an eater's plate empties one
// glizzy per eaten-<n> move
export default function GlizzyPlate({ eatable }: { eatable: boolean }) {
  return (
    <span className="relative block h-5 w-14">
      <span className="absolute inset-x-0 bottom-0 h-2 rounded-[50%] bg-slate-200 shadow" />
      {GLIZZIES.map((cls, i) => (
        <span
          key={cls}
          data-anim={eatable ? `eaten-${i}` : undefined}
          className={`absolute bottom-1 ${cls}`}
        >
          <GlizzyIcon variant={i} className="h-3 w-6" />
        </span>
      ))}
    </span>
  );
}

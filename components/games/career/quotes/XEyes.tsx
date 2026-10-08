// Crossed-out eyes over a portrait; the scene's own move fades them in
export default function XEyes({ anim }: { anim: string }) {
  return (
    <span
      data-anim={anim}
      className="absolute inset-x-[22%] top-[30%] z-10 flex justify-between opacity-0"
    >
      {[0, 1].map((eye) => (
        <span key={eye} className="relative h-3 w-3">
          <span className="absolute left-1/2 top-0 h-3 w-1 -translate-x-1/2 rotate-45 rounded-full bg-slate-950" />
          <span className="absolute left-1/2 top-0 h-3 w-1 -translate-x-1/2 -rotate-45 rounded-full bg-slate-950" />
        </span>
      ))}
    </span>
  );
}

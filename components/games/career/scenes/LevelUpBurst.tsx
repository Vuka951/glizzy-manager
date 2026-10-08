const SPARKS = [
  'rotate-0',
  'rotate-45',
  'rotate-90',
  'rotate-[135deg]',
  'rotate-180',
  'rotate-[225deg]',
  'rotate-[270deg]',
  'rotate-[315deg]',
];

// The finish every leveled training shares when a session tips a level:
// a gold ring and eight sparks thrown out of the actor.
// Sits inside SceneActor so it travels with him; delay is when the level lands
export default function LevelUpBurst({ delay }: { delay: number }) {
  return (
    <>
      <span
        data-anim="ring-out"
        data-anim-delay={delay}
        className="absolute -inset-2 rounded-full border-4 border-amber-300 opacity-0 shadow-[0_0_24px_rgba(252,211,77,0.9)]"
      />
      <span
        data-anim="glow-pulse"
        data-anim-delay={delay}
        className="absolute -inset-3 -z-10 rounded-full bg-amber-300/30 opacity-0 blur-md"
      />
      {SPARKS.map((cls, i) => (
        <span key={cls} className={`absolute inset-0 ${cls}`}>
          <span
            data-anim="spark-out"
            data-anim-delay={delay + i * 40}
            className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 opacity-0 ${
              i % 2 ? 'bg-amber-200' : 'bg-yellow-400'
            } shadow-[0_0_8px_rgba(253,224,71,0.9)]`}
          />
        </span>
      ))}
    </>
  );
}

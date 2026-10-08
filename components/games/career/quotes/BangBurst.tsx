import { GAMES_UI } from '@/data/games/locale';

// A comic shot burst over the target; the scene's own move pops it
export default function BangBurst({ anim }: { anim: string }) {
  return (
    <span
      data-anim={anim}
      className="absolute -top-9 left-1/2 z-40 -ml-9 flex h-12 w-[72px] items-center justify-center opacity-0"
    >
      <span className="absolute inset-0 bg-yellow-300 [clip-path:polygon(50%_0,61%_24%,88%_6%,78%_36%,100%_48%,76%_62%,90%_94%,60%_76%,48%_100%,38%_76%,8%_92%,22%_60%,0_46%,22%_34%,12%_6%,38%_24%)]" />
      <span className="relative text-sm font-black italic tracking-tight text-red-600">
        {GAMES_UI.career.quoteCutscene.bang}
      </span>
    </span>
  );
}

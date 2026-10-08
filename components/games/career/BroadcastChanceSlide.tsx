import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { INTRO_STAGGER } from '@/lib/constants/broadcastWeather';

const B = GAMES_UI.career.broadcast;

export type ChanceRow = { slug: string; pct: number };

const BAR_WIDTHS = [
  'w-[10%]',
  'w-[20%]',
  'w-[30%]',
  'w-[40%]',
  'w-[50%]',
  'w-[60%]',
  'w-[70%]',
  'w-[80%]',
  'w-[90%]',
  'w-full',
];

function barWidth(value: number, max: number): string {
  if (max <= 0) return BAR_WIDTHS[0];
  const bucket = Math.ceil((value / max) * BAR_WIDTHS.length) - 1;
  return BAR_WIDTHS[Math.max(0, Math.min(BAR_WIDTHS.length - 1, bucket))];
}

// The bookies' board: the favourites, bars growing to their title chance
export default function BroadcastChanceSlide({
  rows,
  characterBySlug,
}: {
  rows: ChanceRow[];
  characterBySlug: Map<string, DuelCharacter>;
}) {
  const max = rows[0]?.pct ?? 0;
  return (
    <div className="flex min-h-56 flex-col justify-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4">
      <p className="mb-1 text-center text-[9px] font-bold uppercase tracking-widest text-amber-300">
        <span className="mr-1">🏆</span>
        {B.titleChance}
      </p>
      {rows.map((row, i) => {
        const character = characterBySlug.get(row.slug);
        if (!character) return null;
        const delay = INTRO_STAGGER[Math.min(i, INTRO_STAGGER.length - 1)];
        return (
          <div
            key={row.slug}
            className={`flex items-center gap-2.5 opacity-0 animate-[bubblein_0.35s_ease-out_forwards] ${delay}`}
          >
            <span className="w-4 shrink-0 font-mono text-[10px] font-bold text-slate-500">
              {i + 1}.
            </span>
            <PortraitHead character={character} className="h-8 w-8 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-xs font-semibold text-slate-100">
                  {i === 0 && <span className="mr-0.5">👑</span>}
                  {character.name}
                </span>
                <span
                  className={`shrink-0 font-mono text-xs font-black [font-variant-numeric:tabular-nums] ${
                    i === 0 ? 'text-amber-300' : 'text-slate-300'
                  }`}
                >
                  {row.pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800/80">
                <div
                  className={`h-1.5 origin-left rounded-full animate-[introbar_0.8s_ease-out_both] ${
                    i === 0
                      ? 'bg-gradient-to-r from-amber-400/90 to-amber-200/90'
                      : 'bg-gradient-to-r from-sky-400/90 to-cyan-300/90'
                  } ${barWidth(row.pct, max)} ${delay}`}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

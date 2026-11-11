import type { SponsorId } from '@/lib/utils/careerSave';

// What a winning party throws around on election night: the confetti and
// firework colours, the tie on its man and the light that bursts behind him
export type ElectionWinPalette = {
  sparks: [string, string, string];
  tie: string;
  burst: string;
  cloth: string;
  trim: string;
};

export const electionWinPalette: Record<SponsorId, ElectionWinPalette> = {
  blue: {
    sparks: ['bg-blue-500', 'bg-slate-50', 'bg-sky-300'],
    tie: 'bg-blue-600',
    burst: 'bg-blue-400/60',
    cloth: 'bg-slate-50',
    trim: 'bg-blue-600',
  },
  green: {
    sparks: ['bg-emerald-400', 'bg-amber-200', 'bg-emerald-200'],
    tie: 'bg-emerald-500',
    burst: 'bg-emerald-400/60',
    cloth: 'bg-emerald-600',
    trim: 'bg-amber-200',
  },
  yellow: {
    sparks: ['bg-yellow-300', 'bg-yellow-100', 'bg-yellow-500'],
    tie: 'bg-yellow-300',
    burst: 'bg-yellow-300/60',
    cloth: 'bg-zinc-900',
    trim: 'bg-yellow-300',
  },
  red: {
    sparks: ['bg-red-500', 'bg-slate-50', 'bg-rose-300'],
    tie: 'bg-red-600',
    burst: 'bg-red-500/60',
    cloth: 'bg-red-700',
    trim: 'bg-slate-50',
  },
};

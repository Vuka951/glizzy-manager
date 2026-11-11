import type { SponsorId } from '@/lib/utils/careerSave';

// One dominant palette per sponsor so a contract reads at a glance wherever
// the character shows up: blue in blue and white, green in emerald and
// sand, yellow in yellow on black, red in red
export type SponsorTheme = {
  // The party's washes, stripe and plaque for scenes and info cards
  wash: string;
  stripe: string;
  plaque: string;
  // The crowd's boards
  board: string;
  // The character himself: portrait ring and the glow under him
  actorRing: string;
  actorGlow: string;
  // A broadcast's header strip and the seam under a board's sign
  headerWash: string;
  modalStripe: string;
  // The party's seats in the chamber, cycled per seat so a list can sit in
  // more than one colour if a list ever needs it, and its bar in the charts
  seat: string[];
  bar: string;
};

export const SPONSOR_THEMES: Record<SponsorId, SponsorTheme> = {
  blue: {
    wash: 'bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,0.08),transparent_34%),linear-gradient(110deg,rgba(37,99,235,0.12),transparent_40%,rgba(255,255,255,0.05)_65%,rgba(37,99,235,0.1))]',
    stripe: 'bg-gradient-to-r from-blue-600 via-white to-blue-600',
    plaque: 'border-blue-300/35 bg-blue-950/75',
    board:
      'border-blue-200 bg-gradient-to-br from-blue-700 via-white to-blue-700',
    actorRing: 'ring-blue-400/80',
    actorGlow: 'bg-blue-400/25',
    headerWash:
      'bg-[radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.26),transparent_50%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_30%)]',
    modalStripe: 'bg-gradient-to-r from-blue-600 via-white to-blue-600',
    seat: ['fill-blue-500'],
    bar: 'fill-blue-500',
  },
  green: {
    wash: 'bg-[radial-gradient(circle_at_78%_65%,rgba(52,211,153,0.14),transparent_32%),linear-gradient(115deg,rgba(16,185,129,0.08),transparent_48%,rgba(251,191,36,0.08))]',
    stripe: 'bg-gradient-to-r from-emerald-500 via-amber-200 to-emerald-500',
    plaque: 'border-emerald-300/30 bg-emerald-950/75',
    board:
      'border-emerald-200 bg-gradient-to-br from-emerald-800 via-emerald-400 to-amber-300',
    actorRing: 'ring-emerald-400/80',
    actorGlow: 'bg-emerald-400/25',
    headerWash:
      'bg-[radial-gradient(circle_at_100%_0%,rgba(52,211,153,0.24),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(251,191,36,0.1),transparent_40%)]',
    modalStripe:
      'bg-gradient-to-r from-emerald-500 via-amber-200 to-emerald-500',
    seat: ['fill-emerald-400'],
    bar: 'fill-emerald-400',
  },
  yellow: {
    wash: 'bg-[linear-gradient(135deg,rgba(250,204,21,0.1)_0%,transparent_22%,transparent_72%,rgba(255,255,255,0.08)_100%)]',
    stripe: 'bg-gradient-to-r from-zinc-900 via-yellow-300 to-zinc-900',
    plaque: 'border-yellow-300/35 bg-zinc-950/80',
    board:
      'border-yellow-300 bg-gradient-to-br from-zinc-950 via-yellow-300 to-zinc-950',
    actorRing: 'ring-yellow-300/80',
    actorGlow: 'bg-yellow-300/25',
    headerWash:
      'bg-[linear-gradient(135deg,rgba(250,204,21,0.2)_0%,transparent_32%,transparent_75%,rgba(255,255,255,0.06)_100%)]',
    modalStripe: 'bg-gradient-to-r from-zinc-900 via-yellow-300 to-zinc-900',
    seat: ['fill-yellow-300'],
    bar: 'fill-yellow-300',
  },
  red: {
    wash: 'bg-[radial-gradient(circle_at_18%_30%,rgba(248,113,113,0.12),transparent_28%),linear-gradient(120deg,rgba(220,38,38,0.12),transparent_46%,rgba(153,27,27,0.1))]',
    stripe: 'bg-gradient-to-r from-red-700 via-red-500 to-red-700',
    plaque: 'border-red-300/35 bg-red-950/80',
    board:
      'border-red-200 bg-gradient-to-r from-red-900 via-red-600 to-red-900',
    actorRing: 'ring-red-400/80',
    actorGlow: 'bg-red-400/25',
    headerWash:
      'bg-[radial-gradient(circle_at_100%_0%,rgba(239,68,68,0.24),transparent_48%),linear-gradient(120deg,rgba(153,27,27,0.14),transparent_50%,rgba(153,27,27,0.12))]',
    modalStripe: 'bg-gradient-to-r from-red-700 via-red-500 to-red-700',
    seat: ['fill-red-600'],
    bar: 'fill-red-600',
  },
};

// The party's colours on its man: the jacket, and the tie that sits on it
export const SUIT_COLORS: Record<
  SponsorId,
  { jacket: string; tie: string; sleeve: string }
> = {
  blue: { jacket: 'bg-blue-700', tie: 'bg-blue-50', sleeve: 'stroke-blue-700' },
  green: {
    jacket: 'bg-emerald-700',
    tie: 'bg-amber-200',
    sleeve: 'stroke-emerald-700',
  },
  yellow: {
    jacket: 'bg-zinc-950',
    tie: 'bg-yellow-300',
    sleeve: 'stroke-zinc-900',
  },
  red: { jacket: 'bg-red-700', tie: 'bg-red-50', sleeve: 'stroke-red-700' },
};

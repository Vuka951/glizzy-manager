import type { SponsorId } from '@/lib/utils/careerSave';

// One dominant palette per sponsor so a contract reads at a glance wherever
// the character shows up: zidari terracotta brick and warm stone, ostrvo
// emerald and sand, korporacija yellow on black, stranka red
export type SponsorTheme = {
  // The scene washes, frame ring and the stripe used by the flavor overlay
  wash: string;
  frame: string;
  stripe: string;
  plaque: string;
  // The crowd's boards
  board: string;
  outline: string;
  // The character himself: portrait ring and the glow under him
  actorRing: string;
  actorGlow: string;
  // Buttons and pills on the scene chrome
  chrome: string;
  // Modals: border, title text, and the background wash
  modalFrame: string;
  modalTitle: string;
  modalWash: string;
  modalStripe: string;
  // The party's seats in the chamber, cycled per seat so a list can sit in
  // more than one colour if a list ever needs it, and its bar in the charts
  seat: string[];
  bar: string;
};

export const SPONSOR_THEMES: Record<SponsorId, SponsorTheme> = {
  zidari: {
    wash: 'bg-[radial-gradient(circle_at_50%_25%,rgba(214,211,209,0.08),transparent_34%),linear-gradient(110deg,rgba(194,65,12,0.14),transparent_40%,rgba(168,162,158,0.06)_65%,rgba(194,65,12,0.12))]',
    frame: 'ring-orange-400/30',
    stripe: 'bg-gradient-to-r from-orange-700 via-stone-300 to-orange-700',
    plaque: 'border-orange-300/35 bg-slate-950/75',
    board:
      'border-stone-200 bg-gradient-to-br from-orange-800 via-stone-300 to-orange-800',
    outline: 'border-orange-500 ring-2 ring-orange-500/80',
    actorRing: 'ring-orange-500/80',
    actorGlow: 'bg-orange-500/25',
    chrome: 'border-orange-400/50 bg-slate-950/70 hover:border-orange-300/80',
    modalFrame: 'border-orange-400/40',
    modalTitle: 'text-orange-300 light:text-orange-800',
    modalWash:
      'bg-[radial-gradient(circle_at_100%_0%,rgba(234,88,12,0.24),transparent_50%),linear-gradient(180deg,rgba(214,211,209,0.05),transparent_30%)]',
    modalStripe: 'bg-gradient-to-r from-orange-700 via-stone-300 to-orange-700',
    seat: ['fill-orange-500'],
    bar: 'fill-orange-500',
  },
  ostrvo: {
    wash: 'bg-[radial-gradient(circle_at_78%_65%,rgba(52,211,153,0.14),transparent_32%),linear-gradient(115deg,rgba(16,185,129,0.08),transparent_48%,rgba(251,191,36,0.08))]',
    frame: 'ring-emerald-300/25',
    stripe: 'bg-gradient-to-r from-emerald-500 via-amber-200 to-emerald-500',
    plaque: 'border-emerald-300/30 bg-emerald-950/75',
    board:
      'border-emerald-200 bg-gradient-to-br from-emerald-800 via-emerald-400 to-amber-300',
    outline: 'border-emerald-400 ring-2 ring-emerald-400/80',
    actorRing: 'ring-emerald-400/80',
    actorGlow: 'bg-emerald-400/25',
    chrome:
      'border-emerald-400/50 bg-emerald-950/70 hover:border-emerald-300/80',
    modalFrame: 'border-emerald-400/40',
    modalTitle: 'text-emerald-300',
    modalWash:
      'bg-[radial-gradient(circle_at_100%_0%,rgba(52,211,153,0.24),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(251,191,36,0.1),transparent_40%)]',
    modalStripe:
      'bg-gradient-to-r from-emerald-500 via-amber-200 to-emerald-500',
    seat: ['fill-emerald-400'],
    bar: 'fill-emerald-400',
  },
  korporacija: {
    wash: 'bg-[linear-gradient(135deg,rgba(250,204,21,0.1)_0%,transparent_22%,transparent_72%,rgba(255,255,255,0.08)_100%)]',
    frame: 'ring-yellow-300/30',
    stripe: 'bg-gradient-to-r from-slate-100 via-yellow-300 to-slate-100',
    plaque: 'border-yellow-300/35 bg-slate-950/80',
    board:
      'border-yellow-100 bg-gradient-to-br from-slate-950 via-yellow-300 to-slate-100',
    outline: 'border-yellow-300 ring-2 ring-yellow-300/80',
    actorRing: 'ring-yellow-300/80',
    actorGlow: 'bg-yellow-300/25',
    chrome: 'border-yellow-300/50 bg-slate-950/80 hover:border-yellow-200/80',
    modalFrame: 'border-yellow-300/40',
    modalTitle: 'text-yellow-300',
    modalWash:
      'bg-[linear-gradient(135deg,rgba(250,204,21,0.2)_0%,transparent_32%,transparent_75%,rgba(255,255,255,0.06)_100%)]',
    modalStripe: 'bg-gradient-to-r from-slate-100 via-yellow-300 to-slate-100',
    seat: ['fill-yellow-300'],
    bar: 'fill-yellow-300',
  },
  stranka: {
    wash: 'bg-[radial-gradient(circle_at_18%_30%,rgba(251,191,36,0.12),transparent_28%),linear-gradient(120deg,rgba(30,64,175,0.12),transparent_46%,rgba(153,27,27,0.1))]',
    frame: 'ring-amber-300/30',
    stripe: 'bg-gradient-to-r from-blue-700 via-amber-300 to-red-700',
    plaque: 'border-amber-300/35 bg-blue-950/80',
    board:
      'border-amber-100 bg-gradient-to-r from-blue-900 via-amber-300 to-red-900',
    outline: 'border-red-400 ring-2 ring-red-400/80',
    actorRing: 'ring-amber-300/80',
    actorGlow: 'bg-amber-300/25',
    chrome: 'border-amber-300/50 bg-blue-950/70 hover:border-amber-200/80',
    modalFrame: 'border-amber-300/40',
    modalTitle: 'text-amber-300',
    modalWash:
      'bg-[radial-gradient(circle_at_100%_0%,rgba(251,191,36,0.24),transparent_48%),linear-gradient(120deg,rgba(30,64,175,0.14),transparent_50%,rgba(153,27,27,0.12))]',
    modalStripe: 'bg-gradient-to-r from-blue-700 via-amber-300 to-red-700',
    seat: ['fill-red-600'],
    bar: 'fill-red-600',
  },
};

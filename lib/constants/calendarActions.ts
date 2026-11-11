import type { ActionIconKind } from '@/components/icons/ActionIcon';
import type { SlotAction } from '@/lib/utils/careerSave';

export type CalendarActionStyle = {
  text: string;
  icon: ActionIconKind | 'fast';
};

export const ACTION_STYLES: Record<SlotAction['kind'], CalendarActionStyle> = {
  training: {
    text: 'text-violet-200',
    icon: 'training',
  },
  ego: {
    text: 'text-fuchsia-200',
    icon: 'training',
  },
  slump: {
    text: 'text-fuchsia-200',
    icon: 'guard',
  },
  rest: {
    text: 'text-emerald-200',
    icon: 'rest',
  },
  fast: {
    text: 'text-orange-200',
    icon: 'fast',
  },
  media: {
    text: 'text-amber-200',
    icon: 'media',
  },
  guard: {
    text: 'text-yellow-200',
    icon: 'guard',
  },
  sabotage: {
    text: 'text-red-200',
    icon: 'sabotage',
  },
  island: {
    text: 'text-cyan-200',
    icon: 'island',
  },
};

// The round stamps on a calendar box: a vote and a weekend on the island
export const ELECTION_MARK_TONE = 'border-red-300 text-red-300';
export const ISLAND_MARK_TONE = 'border-cyan-200 text-cyan-200';

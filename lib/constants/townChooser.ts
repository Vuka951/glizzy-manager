import type { ReactNode } from 'react';

// The enamel of a chooser door's plate and the ink of its round sign
export const TOWN_CHOOSER_TONES = {
  red: { plate: 'bg-[#b91c1c]', ink: 'text-[#b91c1c]' },
  gold: { plate: 'bg-[#a16207]', ink: 'text-[#a16207]' },
  sky: { plate: 'bg-[#1e40af]', ink: 'text-[#1e40af]' },
  rose: { plate: 'bg-[#be185d]', ink: 'text-[#be185d]' },
  green: { plate: 'bg-[#166534]', ink: 'text-[#166534]' },
} as const;

export type TownChooserTone = keyof typeof TOWN_CHOOSER_TONES;

export type TownChooserFace = {
  icon: ReactNode;
  title: string;
  desc?: string;
  sub: string | null;
  disabled?: boolean;
  tone: TownChooserTone;
  onClick: () => void;
};

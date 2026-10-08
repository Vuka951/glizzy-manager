import type { CharacterCareerState } from '@/lib/utils/careerSave';

export type CareerMoodSvg = 'conflicted' | 'overwhelmed';

export type CareerMoodActivity =
  | 'sick'
  | 'frantic'
  | 'anxious'
  | 'defeated'
  | 'shy'
  | 'proud'
  | 'energized'
  | 'hungry'
  | 'relaxed'
  | 'celebrating'
  | 'idle';

export type CareerMood =
  | {
      kind: 'emoji';
      symbol: string;
      activity: CareerMoodActivity;
      glizzy?: boolean;
    }
  | {
      kind: 'svg';
      name: CareerMoodSvg;
      activity: CareerMoodActivity;
      glizzy?: boolean;
    };

type MoodSignal = {
  name: 'stress' | 'overfull' | 'hungry' | 'ambition' | 'ego' | 'fame';
  severity: number;
};

function strongest(signals: MoodSignal[]): MoodSignal | null {
  return [...signals].sort((a, b) => b.severity - a.severity)[0] ?? null;
}

function emoji(
  symbol: string,
  activity: CareerMoodActivity,
  glizzy = false,
): CareerMood {
  return { kind: 'emoji', symbol, activity, glizzy };
}

function svg(
  name: CareerMoodSvg,
  activity: CareerMoodActivity,
  glizzy = false,
): CareerMood {
  return { kind: 'svg', name, activity, glizzy };
}

// Mood bubbles compress five meters into one readable reaction. Dangerous
// combinations win over positive ones, while mixed highs and lows use custom
// faces because no single emoji communicates both sides clearly.
export function careerMoodFor(ch: CharacterCareerState): CareerMood {
  const criticalNegative: MoodSignal[] = [
    ...(ch.stress > 80
      ? [{ name: 'stress' as const, severity: (ch.stress - 80) / 20 }]
      : []),
    ...(ch.appetite < 20
      ? [{ name: 'overfull' as const, severity: (20 - ch.appetite) / 20 }]
      : []),
    ...(ch.appetite > 80
      ? [{ name: 'hungry' as const, severity: (ch.appetite - 80) / 20 }]
      : []),
    ...(ch.ambition < 15
      ? [{ name: 'ambition' as const, severity: (15 - ch.ambition) / 15 }]
      : []),
    ...(ch.ego < 15
      ? [{ name: 'ego' as const, severity: (15 - ch.ego) / 15 }]
      : []),
    ...(ch.fame < 15
      ? [{ name: 'fame' as const, severity: (15 - ch.fame) / 15 }]
      : []),
  ];
  const strongPositive: MoodSignal[] = [
    ...(ch.ambition >= 70
      ? [{ name: 'ambition' as const, severity: (ch.ambition - 70) / 30 }]
      : []),
    ...(ch.ego > 75
      ? [{ name: 'ego' as const, severity: (ch.ego - 75) / 25 }]
      : []),
    ...(ch.fame >= 70
      ? [{ name: 'fame' as const, severity: (ch.fame - 70) / 30 }]
      : []),
  ];

  const hasCritical = (name: MoodSignal['name']) =>
    criticalNegative.some((signal) => signal.name === name);

  if (hasCritical('stress') && hasCritical('overfull')) {
    return emoji('🤮', 'sick');
  }
  if (hasCritical('stress') && hasCritical('hungry')) {
    return svg('overwhelmed', 'frantic', true);
  }
  if (criticalNegative.length >= 2) {
    return svg('overwhelmed', 'frantic');
  }
  if (criticalNegative.length > 0 && strongPositive.length > 0) {
    return svg('conflicted', 'anxious');
  }

  const critical = strongest(criticalNegative);
  if (critical?.name === 'stress') return emoji('😡', 'frantic');
  if (critical?.name === 'overfull') return emoji('🤢', 'sick');
  if (critical?.name === 'hungry') return emoji('🤤', 'hungry', true);
  if (critical?.name === 'ambition') return emoji('🏳️', 'defeated');
  if (critical?.name === 'ego') return emoji('😰', 'anxious');
  if (critical?.name === 'fame') return emoji('🫥', 'shy');

  if (strongPositive.length >= 2) {
    const hasFame = strongPositive.some((signal) => signal.name === 'fame');
    const hasEgo = strongPositive.some((signal) => signal.name === 'ego');
    return hasFame && hasEgo
      ? emoji('🤩', 'proud')
      : emoji('🔥', 'energized');
  }

  const positive = strongest(strongPositive);
  if (positive?.name === 'ego') return emoji('👑', 'proud');
  if (positive?.name === 'fame') return emoji('🤩', 'proud');
  if (positive?.name === 'ambition') return emoji('🔥', 'energized');

  if (ch.stress > 60) return emoji('😰', 'frantic');
  if (ch.appetite < 35) return emoji('🥴', 'sick');
  if (ch.appetite > 65) return emoji('😋', 'hungry', true);
  if (ch.ambition < 25) return emoji('😴', 'defeated');
  if (ch.ego < 25) return emoji('😬', 'anxious');
  if (ch.fame < 50) return emoji('🥸', 'shy');
  if (ch.stress <= 20) return emoji('😌', 'relaxed');
  if (
    ch.stress <= 35 &&
    ch.appetite >= 40 &&
    ch.appetite <= 60 &&
    ch.ambition >= 40 &&
    ch.ego >= 35
  ) {
    return emoji('😄', 'celebrating');
  }
  return emoji('🙂', 'idle');
}

export function careerMoodActivityFor(ch: CharacterCareerState): CareerMoodActivity {
  return careerMoodFor(ch).activity;
}

export function careerMoodAnimationFor(activity: CareerMoodActivity): {
  duration: number;
  keyframes: Keyframe[];
} {
  const animations: Record<CareerMoodActivity, { duration: number; keyframes: Keyframe[] }> = {
    sick: {
      duration: 4100,
      keyframes: [
        { transform: 'translate(-24px, 5px) rotate(-11deg) scale(0.94)', offset: 0 },
        { transform: 'translate(-8px, 11px) rotate(15deg) scale(0.9)', offset: 0.19 },
        { transform: 'translate(18px, 3px) rotate(-8deg) scale(0.96)', offset: 0.38 },
        { transform: 'translate(31px, 17px) rotate(27deg) scale(0.84)', offset: 0.55 },
        { transform: 'translate(8px, 9px) rotate(5deg) scale(0.91)', offset: 0.72 },
        { transform: 'translate(-24px, 5px) rotate(-11deg) scale(0.94)', offset: 1 },
      ],
    },
    frantic: {
      duration: 3600,
      keyframes: [
        { transform: 'translate(-88px, 0) rotate(-7deg)', offset: 0 },
        { transform: 'translate(-28px, -7px) rotate(5deg)', offset: 0.2 },
        { transform: 'translate(72px, 0) rotate(9deg)', offset: 0.45 },
        { transform: 'translate(72px, 0) rotate(-7deg)', offset: 0.56 },
        { transform: 'translate(-24px, -5px) rotate(-4deg)', offset: 0.8 },
        { transform: 'translate(-88px, 0) rotate(-7deg)', offset: 1 },
      ],
    },
    anxious: {
      duration: 4300,
      keyframes: [
        { transform: 'translate(-18px, 0) rotate(-7deg) scale(0.96)', offset: 0 },
        { transform: 'translate(-18px, 0) rotate(5deg) scale(0.96)', offset: 0.18 },
        { transform: 'translate(18px, -3px) rotate(6deg) scale(1)', offset: 0.38 },
        { transform: 'translate(18px, -3px) rotate(-5deg) scale(1)', offset: 0.58 },
        { transform: 'translate(0, 3px) rotate(0deg) scale(0.9)', offset: 0.76 },
        { transform: 'translate(-18px, 0) rotate(-7deg) scale(0.96)', offset: 1 },
      ],
    },
    defeated: {
      duration: 5200,
      keyframes: [
        { transform: 'translate(-15px, 10px) scaleX(1.08) scaleY(0.82)', offset: 0 },
        { transform: 'translate(-15px, 14px) scaleX(1.12) scaleY(0.76)', offset: 0.34 },
        { transform: 'translate(-10px, 9px) scaleX(1.08) scaleY(0.84)', offset: 0.4 },
        { transform: 'translate(-15px, 14px) scaleX(1.12) scaleY(0.76)', offset: 0.47 },
        { transform: 'translate(-15px, 10px) scaleX(1.08) scaleY(0.82)', offset: 0.72 },
        { transform: 'translate(-15px, 10px) scaleX(1.08) scaleY(0.82)', offset: 1 },
      ],
    },
    shy: {
      duration: 5400,
      keyframes: [
        { transform: 'translateX(31px) rotate(5deg) scale(0.84)', opacity: 0.42, offset: 0 },
        { transform: 'translateX(4px) rotate(-5deg) scale(0.96)', opacity: 1, offset: 0.26 },
        { transform: 'translateX(4px) rotate(3deg) scale(0.96)', opacity: 1, offset: 0.5 },
        { transform: 'translateX(31px) rotate(5deg) scale(0.84)', opacity: 0.42, offset: 0.72 },
        { transform: 'translateX(31px) rotate(5deg) scale(0.84)', opacity: 0.42, offset: 1 },
      ],
    },
    proud: {
      duration: 5600,
      keyframes: [
        { transform: 'translate(0, 0) rotate(-2deg) scale(1.06)', offset: 0 },
        { transform: 'translate(0, -7px) rotate(0deg) scale(1.14)', offset: 0.28 },
        { transform: 'translate(0, -7px) rotate(0deg) scale(1.14)', offset: 0.62 },
        { transform: 'translate(0, -2px) rotate(2deg) scale(1.09)', offset: 0.78 },
        { transform: 'translate(0, 0) rotate(-2deg) scale(1.06)', offset: 1 },
      ],
    },
    energized: {
      duration: 1900,
      keyframes: [
        { transform: 'translate(0, 4px) rotate(-5deg) scaleX(1.08) scaleY(0.9)', offset: 0 },
        { transform: 'translate(9px, -45px) rotate(8deg) scaleX(0.94) scaleY(1.1)', offset: 0.28 },
        { transform: 'translate(18px, 3px) rotate(4deg) scaleX(1.12) scaleY(0.86)', offset: 0.5 },
        { transform: 'translate(8px, -23px) rotate(-8deg) scaleX(0.97) scaleY(1.05)', offset: 0.7 },
        { transform: 'translate(0, 4px) rotate(-5deg) scaleX(1.08) scaleY(0.9)', offset: 1 },
      ],
    },
    hungry: {
      duration: 4200,
      keyframes: [
        { transform: 'translate(24px, 0) rotate(2deg) scale(1)', offset: 0 },
        { transform: 'translate(-18px, -4px) rotate(-14deg) scale(0.96)', offset: 0.28 },
        { transform: 'translate(-31px, 10px) rotate(-25deg) scale(0.9)', offset: 0.42 },
        { transform: 'translate(-25px, 4px) rotate(-18deg) scale(1)', offset: 0.58 },
        { transform: 'translate(10px, -3px) rotate(4deg) scale(1.03)', offset: 0.76 },
        { transform: 'translate(24px, 0) rotate(2deg) scale(1)', offset: 1 },
      ],
    },
    relaxed: {
      duration: 7200,
      keyframes: [
        { transform: 'translate(-10px, 12px) scale(0.96)', offset: 0 },
        { transform: 'translate(-15px, 15px) scale(0.93)', offset: 0.36 },
        { transform: 'translate(-8px, 11px) scale(0.97)', offset: 0.7 },
        { transform: 'translate(-10px, 12px) scale(0.96)', offset: 1 },
      ],
    },
    celebrating: {
      duration: 2600,
      keyframes: [
        { transform: 'translate(-20px, 2px) rotate(-9deg) scale(1)', offset: 0 },
        { transform: 'translate(-6px, -38px) rotate(12deg) scale(1.08)', offset: 0.22 },
        { transform: 'translate(12px, 2px) rotate(4deg) scale(0.94)', offset: 0.43 },
        { transform: 'translate(27px, -28px) rotate(-13deg) scale(1.06)', offset: 0.64 },
        { transform: 'translate(8px, 2px) rotate(6deg) scale(0.94)', offset: 0.82 },
        { transform: 'translate(-20px, 2px) rotate(-9deg) scale(1)', offset: 1 },
      ],
    },
    idle: {
      duration: 7600,
      keyframes: [
        { transform: 'translate(-34px, 0) rotate(-4deg)', offset: 0 },
        { transform: 'translate(-8px, -3px) rotate(3deg)', offset: 0.22 },
        { transform: 'translate(-8px, -3px) rotate(-5deg)', offset: 0.38 },
        { transform: 'translate(31px, 0) rotate(5deg)', offset: 0.62 },
        { transform: 'translate(31px, 0) rotate(-4deg)', offset: 0.78 },
        { transform: 'translate(-34px, 0) rotate(-4deg)', offset: 1 },
      ],
    },
  };
  return animations[activity];
}

import { useEffect, useRef } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import PartyEscort from '@/components/games/career/PartyEscort';
import type { SponsorId } from '@/lib/utils/careerSave';
import PoliceOfficer from '@/components/games/career/PoliceOfficer';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { MatchForfeitReason } from '@/lib/utils/tournamentSim';

function MedicCircle() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 ring-2 ring-red-400">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z" className="fill-red-500" />
      </svg>
    </span>
  );
}

// Keyed by reason: how the loser himself acts before the walk-off
const LOSER_KEYFRAMES: Partial<Record<MatchForfeitReason, Keyframe[]>> = {
  meltdown: [
    { transform: 'translateY(0) rotate(0deg)' },
    { transform: 'translateY(0) rotate(0deg)', offset: 0.08 },
    { transform: 'translateY(0) rotate(90deg)', offset: 0.24 },
    { transform: 'translateY(0) rotate(90deg)', offset: 0.5 },
    { transform: 'translateY(-4px) rotate(90deg)', offset: 0.58 },
    { transform: 'translateY(-4px) rotate(90deg)' },
  ],
  'overfull-forfeit': [
    { transform: 'translateY(0) rotate(0deg)' },
    { transform: 'translateY(0) rotate(-8deg)', offset: 0.08 },
    { transform: 'translateY(0) rotate(8deg)', offset: 0.16 },
    { transform: 'translateY(0) rotate(-8deg)', offset: 0.24 },
    { transform: 'translateY(2px) rotate(16deg)', offset: 0.34 },
    { transform: 'translateY(2px) rotate(16deg)', offset: 0.54 },
    { transform: 'translateY(0) rotate(0deg)', offset: 0.64 },
    { transform: 'translateY(0) rotate(0deg)' },
  ],
  withdrawn: [
    { transform: 'translateY(0) rotate(0deg)' },
    { transform: 'translateY(0) rotate(0deg)', offset: 0.14 },
    { transform: 'translateY(2px) rotate(-5deg)', offset: 0.28 },
    { transform: 'translateY(2px) rotate(-5deg)' },
  ],
};

// The loser's exit, played once over the finished table. He stays where the
// match left him; a meltdown brings medics with a stretcher, the police come
// with cuffs and lights, an overfull man loses his glizzies, a quitter raises
// the white flag. Medics and police then leave the stage, while the overfull
// and surrender poses hold at the table.
export default function MatchExitScene({
  reason,
  loser,
  side,
  party = null,
  walkOff = true,
}: {
  reason: MatchForfeitReason;
  loser: DuelCharacter;
  side: 'top' | 'bottom';
  // Whose people do the removing; without a party the police stand in
  party?: SponsorId | null;
  // Without the walk-off the loser holds the pose at the table
  walkOff?: boolean;
}) {
  const groupRef = useRef<HTMLDivElement | null>(null);
  const cuffRef = useRef<HTMLSpanElement | null>(null);
  const lightsRef = useRef<HTMLSpanElement | null>(null);
  const loserRef = useRef<HTMLSpanElement | null>(null);
  const escortLeftRef = useRef<HTMLSpanElement | null>(null);
  const escortRightRef = useRef<HTMLSpanElement | null>(null);
  const stretcherRef = useRef<SVGSVGElement | null>(null);
  const flagRef = useRef<HTMLSpanElement | null>(null);
  const pukeRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = groupRef.current;
    if (!el) return;
    const timing = {
      duration: walkOff ? 4600 : 3400,
      easing: 'ease-in-out',
      fill: 'forwards' as const,
    };
    const animations: Animation[] = walkOff
      ? [
          el.animate(
            [
              { transform: 'translateX(0)', opacity: 1 },
              { transform: 'translateX(0)', opacity: 1, offset: 0.66 },
              { transform: 'translateX(150%)', opacity: 1, offset: 0.95 },
              { transform: 'translateX(150%)', opacity: 0 },
            ],
            timing,
          ),
        ]
      : [];
    (
      [
        [escortLeftRef, -160],
        [escortRightRef, 160],
      ] as const
    ).forEach(([ref, from]) => {
      if (!ref.current) return;
      animations.push(
        ref.current.animate(
          [
            { transform: `translateX(${from}px)`, opacity: 0 },
            { transform: `translateX(${from}px)`, opacity: 0, offset: 0.26 },
            { transform: `translateX(${from}px)`, opacity: 1, offset: 0.3 },
            { transform: 'translateX(0)', opacity: 1, offset: 0.46 },
            { transform: 'translateX(0)', opacity: 1 },
          ],
          timing,
        ),
      );
    });
    const loserFrames = LOSER_KEYFRAMES[reason];
    if (loserRef.current && loserFrames) {
      animations.push(loserRef.current.animate(loserFrames, timing));
    }
    if (stretcherRef.current) {
      animations.push(
        stretcherRef.current.animate(
          [
            { opacity: 0 },
            { opacity: 0, offset: 0.46 },
            { opacity: 1, offset: 0.56 },
            { opacity: 1 },
          ],
          timing,
        ),
      );
    }
    if (lightsRef.current) {
      animations.push(
        lightsRef.current.animate(
          [
            { opacity: 0 },
            { opacity: 0, offset: 0.26 },
            { opacity: 1, offset: 0.34 },
            { opacity: 1 },
          ],
          timing,
        ),
      );
    }
    if (cuffRef.current) {
      animations.push(
        cuffRef.current.animate(
          [
            { transform: 'scale(0)', opacity: 0 },
            { transform: 'scale(0)', opacity: 0, offset: 0.5 },
            { transform: 'scale(1.6)', opacity: 1, offset: 0.58 },
            { transform: 'scale(1)', opacity: 1 },
          ],
          timing,
        ),
      );
    }
    if (flagRef.current) {
      animations.push(
        flagRef.current.animate(
          [
            { transform: 'scale(0) rotate(0deg)', opacity: 0 },
            { transform: 'scale(0) rotate(0deg)', opacity: 0, offset: 0.12 },
            { transform: 'scale(1.2) rotate(0deg)', opacity: 1, offset: 0.2 },
            { transform: 'scale(1) rotate(-14deg)', opacity: 1, offset: 0.3 },
            { transform: 'scale(1) rotate(10deg)', opacity: 1, offset: 0.4 },
            { transform: 'scale(1) rotate(-14deg)', opacity: 1, offset: 0.5 },
            { transform: 'scale(1) rotate(10deg)', opacity: 1, offset: 0.6 },
            { transform: 'scale(1) rotate(0deg)', opacity: 1 },
          ],
          timing,
        ),
      );
    }
    if (pukeRef.current) {
      Array.from(pukeRef.current.children).forEach((particle, i) => {
        const start = 0.34 + i * 0.04;
        animations.push(
          (particle as HTMLElement).animate(
            [
              { transform: 'translate(0, 0) scale(0.4)', opacity: 0 },
              {
                transform: 'translate(0, 0) scale(0.4)',
                opacity: 0,
                offset: start,
              },
              {
                transform: 'translate(10px, -5px) scale(1)',
                opacity: 1,
                offset: start + 0.05,
              },
              {
                transform: `translate(${24 + i * 7}px, ${12 + i * 5}px) scale(1)`,
                opacity: 1,
                offset: start + 0.16,
              },
              {
                transform: `translate(${30 + i * 7}px, ${20 + i * 5}px) scale(0.8)`,
                opacity: 0,
                offset: start + 0.24,
              },
              {
                transform: `translate(${30 + i * 7}px, ${20 + i * 5}px)`,
                opacity: 0,
              },
            ],
            timing,
          ),
        );
      });
    }
    return () => animations.forEach((animation) => animation.cancel());
  }, [reason, walkOff]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-30 flex justify-center overflow-hidden ${
        side === 'top' ? 'items-start pt-4' : 'items-end pb-6'
      }`}
    >
      <div ref={groupRef} className="relative flex items-center gap-2">
        {reason === 'meltdown' && (
          <>
            <span ref={escortLeftRef} className="opacity-0">
              <MedicCircle />
            </span>
            <span className="flex flex-col items-center">
              <span ref={loserRef} className="block">
                <PortraitHead
                  character={loser}
                  className="h-10 w-10 ring-2 ring-red-400/70"
                />
              </span>
              <svg
                ref={stretcherRef}
                viewBox="0 0 60 10"
                className="-mt-1 h-2.5 w-14 opacity-0"
                aria-hidden="true"
              >
                <rect
                  x="0"
                  y="2"
                  width="60"
                  height="4"
                  rx="2"
                  className="fill-slate-200"
                />
                <circle cx="14" cy="8" r="2" className="fill-slate-500" />
                <circle cx="46" cy="8" r="2" className="fill-slate-500" />
              </svg>
            </span>
            <span ref={escortRightRef} className="opacity-0">
              <MedicCircle />
            </span>
          </>
        )}
        {reason === 'police' && (
          <>
            <span
              ref={lightsRef}
              className="absolute -top-2 left-1/2 flex -translate-x-1/2 gap-1.5 opacity-0"
            >
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500 [animation-delay:300ms]" />
            </span>
            <span ref={escortLeftRef} className="opacity-0">
              <PoliceOfficer />
            </span>
            <span className="relative">
              <PortraitHead
                character={loser}
                className="h-10 w-10 ring-2 ring-blue-400/70 grayscale"
              />
              <span
                ref={cuffRef}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 opacity-0"
              >
                <svg viewBox="0 0 24 12" className="h-3 w-6" aria-hidden="true">
                  <circle
                    cx="6"
                    cy="6"
                    r="4.5"
                    className="fill-none stroke-slate-300"
                    strokeWidth="2"
                  />
                  <circle
                    cx="18"
                    cy="6"
                    r="4.5"
                    className="fill-none stroke-slate-300"
                    strokeWidth="2"
                  />
                  <path
                    d="M9.5 4q2.5 -2.5 5 0"
                    className="fill-none stroke-slate-300"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
            </span>
            <span ref={escortRightRef} className="opacity-0">
              <PoliceOfficer flip />
            </span>
          </>
        )}
        {reason === 'removed' && (
          <>
            <span ref={escortLeftRef} className="opacity-0">
              {party ? <PartyEscort party={party} /> : <PoliceOfficer />}
            </span>
            <PortraitHead
              character={loser}
              className="h-10 w-10 ring-2 ring-amber-300/70 grayscale"
            />
            <span ref={escortRightRef} className="opacity-0">
              {party ? (
                <PartyEscort party={party} flip />
              ) : (
                <PoliceOfficer flip />
              )}
            </span>
          </>
        )}
        {reason === 'overfull-forfeit' && (
          <span className="relative block">
            <span ref={loserRef} className="block">
              <PortraitHead
                character={loser}
                className="h-10 w-10 ring-2 ring-lime-400/70 [filter:sepia(1)_hue-rotate(55deg)_saturate(2.6)]"
              />
            </span>
            <span ref={pukeRef} className="absolute right-0 top-5 block">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="absolute opacity-0">
                  {i % 2 === 0 ? (
                    <GlizzyIcon variant={i % 4} className="h-2 w-3.5" />
                  ) : (
                    <span className="block h-1.5 w-1.5 rounded-full bg-lime-400" />
                  )}
                </span>
              ))}
            </span>
          </span>
        )}
        {reason === 'withdrawn' && (
          <span className="relative block">
            <span ref={loserRef} className="block">
              <PortraitHead
                character={loser}
                className="h-10 w-10 ring-2 ring-slate-400/60"
              />
            </span>
            <span
              ref={flagRef}
              className="absolute -right-4 -top-4 block origin-bottom opacity-0"
            >
              <svg viewBox="0 0 20 24" className="h-6 w-5" aria-hidden="true">
                <rect
                  x="9"
                  y="2"
                  width="1.6"
                  height="20"
                  rx="0.8"
                  className="fill-slate-400"
                />
                <path
                  d="M10.6 3h8l-2.5 3 2.5 3h-8z"
                  className="fill-slate-100"
                />
              </svg>
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

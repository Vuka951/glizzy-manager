import { useEffect, useRef, useState } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import MoodBubble from '@/components/games/career/MoodBubble';
import MoodCharacterEffects from '@/components/games/career/MoodCharacterEffects';
import SeasonBackdrop from '@/components/games/SeasonBackdrop';
import SponsorActorGear from '@/components/games/career/SponsorActorGear';
import SponsorSceneFlavor from '@/components/games/career/SponsorSceneFlavor';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import {
  careerMoodActivityFor,
  careerMoodAnimationFor,
  type CareerMoodActivity,
} from '@/lib/utils/careerMood';
import type { CharacterCareerState, SponsorId } from '@/lib/utils/careerSave';

const GROUND_POSITIONS: Record<CareerMoodActivity, string> = {
  sick: 'bottom-[6%] left-[70%]',
  frantic: 'bottom-[10%] left-1/2',
  anxious: 'bottom-[8%] left-[42%]',
  defeated: 'bottom-[1%] left-[45%]',
  shy: 'bottom-[9%] left-[19%]',
  proud: 'bottom-[28%] left-[54%]',
  energized: 'bottom-[8%] left-[48%]',
  hungry: 'bottom-[7%] left-[32%]',
  relaxed: 'bottom-[5%] left-[62%]',
  celebrating: 'bottom-[8%] left-1/2',
  idle: 'bottom-[9%] left-[47%]',
};

const PROUD_POSITIONS = [
  'bottom-[42%] left-[55%]',
  'bottom-[38%] left-[49%]',
  'bottom-[58%] left-[17%]',
  'bottom-[40%] left-[63%]',
];

const PORTRAIT_POSES: Partial<Record<CareerMoodActivity, string>> = {
  defeated: 'origin-center rotate-[82deg] scale-x-110 scale-y-75 saturate-50',
  relaxed: 'origin-bottom-left -rotate-12',
  proud: 'origin-bottom scale-110 saturate-125',
  sick: 'saturate-75',
};

export default function TrainingScene({
  character,
  season,
  sponsorId,
  mood,
  className = 'h-36',
  children,
}: {
  character: DuelCharacter;
  season: number;
  sponsorId: SponsorId | null;
  mood?: CharacterCareerState;
  className?: string;
  children?: React.ReactNode;
}) {
  const actorRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<Animation | null>(null);
  const transitionRef = useRef<Animation | null>(null);
  const versionRef = useRef(0);
  const targetActivity = mood ? careerMoodActivityFor(mood) : 'idle';
  const [displayedActivity, setDisplayedActivity] =
    useState<CareerMoodActivity>(targetActivity);
  const [isCentering, setIsCentering] = useState(false);
  const [visualsActive, setVisualsActive] = useState(false);
  const displayedActivityRef = useRef(displayedActivity);
  const seasonIndex = ((season % 4) + 4) % 4;
  const actorPosition = isCentering
    ? 'bottom-[9%] left-1/2'
    : displayedActivity === 'proud'
      ? PROUD_POSITIONS[seasonIndex]
      : GROUND_POSITIONS[displayedActivity];

  useEffect(() => {
    displayedActivityRef.current = displayedActivity;
  }, [displayedActivity]);

  useEffect(() => {
    const el = actorRef.current;
    if (!el) return;
    const version = versionRef.current + 1;
    versionRef.current = version;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const currentStyle = window.getComputedStyle(el);
    const currentTransform = currentStyle.transform;
    const currentOpacity = Number(currentStyle.opacity);
    const neutralFrame: Keyframe = {
      transform: 'translate(0, 0) rotate(0deg) scale(1)',
      opacity: 1,
    };

    transitionRef.current?.cancel();
    loopRef.current?.cancel();
    transitionRef.current = null;
    loopRef.current = null;

    const startActivity = (
      activity: CareerMoodActivity,
      fromNeutral: boolean,
    ) => {
      const { duration, keyframes } = careerMoodAnimationFor(activity);
      const entranceDuration = 850;
      const combinedDuration = entranceDuration + duration;
      const loopStartOffset = entranceDuration / combinedDuration;
      const entranceFrame: Keyframe = fromNeutral
        ? neutralFrame
        : {
            transform: currentTransform === 'none' ? 'none' : currentTransform,
            opacity: currentOpacity,
          };
      const combinedKeyframes: Keyframe[] = [
        {
          ...entranceFrame,
          offset: 0,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        },
        ...keyframes.map((frame, index) => {
          const loopOffset =
            typeof frame.offset === 'number'
              ? frame.offset
              : index / Math.max(1, keyframes.length - 1);
          return {
            ...frame,
            offset: loopStartOffset + loopOffset * (1 - loopStartOffset),
            easing: frame.easing ?? 'ease-in-out',
          };
        }),
      ];
      const transition = el.animate(combinedKeyframes, {
        duration: combinedDuration,
        easing: 'linear',
        fill: 'forwards',
      });
      transitionRef.current = transition;
      transition.onfinish = () => {
        if (versionRef.current !== version) return;
        const loop = el.animate(keyframes, {
          duration,
          iterations: Infinity,
          easing: 'ease-in-out',
        });
        loop.pause();
        loop.currentTime = 0;
        loopRef.current = loop;
        requestAnimationFrame(() => {
          if (versionRef.current !== version) return;
          loop.play();
          transition.cancel();
          if (transitionRef.current === transition)
            transitionRef.current = null;
        });
      };
    };

    if (reducedMotion) {
      const frame = requestAnimationFrame(() => {
        if (versionRef.current !== version) return;
        displayedActivityRef.current = targetActivity;
        setDisplayedActivity(targetActivity);
        setIsCentering(false);
        setVisualsActive(true);
      });
      return () => cancelAnimationFrame(frame);
    }

    if (displayedActivityRef.current === targetActivity) {
      startActivity(targetActivity, currentTransform === 'none');
      requestAnimationFrame(() => {
        if (versionRef.current === version) setVisualsActive(true);
      });
      return;
    }

    requestAnimationFrame(() => {
      if (versionRef.current !== version) return;
      setVisualsActive(false);
      setIsCentering(true);
    });
    const returnToCenter = el.animate(
      [
        {
          transform: currentTransform === 'none' ? 'none' : currentTransform,
          opacity: currentOpacity,
        },
        neutralFrame,
      ],
      {
        duration: 700,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      },
    );
    transitionRef.current = returnToCenter;
    returnToCenter.onfinish = () => {
      if (versionRef.current !== version) return;
      displayedActivityRef.current = targetActivity;
      setDisplayedActivity(targetActivity);
      requestAnimationFrame(() => {
        if (versionRef.current !== version) return;
        setIsCentering(false);
        startActivity(targetActivity, true);
        requestAnimationFrame(() => {
          if (versionRef.current === version) setVisualsActive(true);
        });
      });
    };
  }, [targetActivity]);

  useEffect(
    () => () => {
      transitionRef.current?.cancel();
      loopRef.current?.cancel();
    },
    [],
  );

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-900/60 ${className}`}
    >
      <SeasonBackdrop season={season} />
      {sponsorId && <SponsorSceneFlavor sponsorId={sponsorId} />}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-950/70 to-transparent" />
      <div
        className={`absolute z-10 -translate-x-1/2 transition-[bottom,left] duration-1000 ease-in-out ${actorPosition}`}
      >
        <div
          ref={actorRef}
          data-mood-actor
          data-mood-activity={displayedActivity}
          data-mood-transition={isCentering ? 'centering' : 'active'}
          className="relative"
        >
          <div
            data-mood-portrait
            className={`relative transition-[filter,rotate,scale,transform] duration-[850ms] ease-out ${
              visualsActive
                ? (PORTRAIT_POSES[displayedActivity] ?? '')
                : 'origin-center rotate-0 scale-100 saturate-100'
            }`}
          >
            {sponsorId && (
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute -bottom-1 left-1/2 h-3 w-16 -translate-x-1/2 rounded-full blur-md sm:w-20 ${SPONSOR_THEMES[sponsorId].actorGlow}`}
              />
            )}
            <PortraitHead
              character={character}
              className={`h-16 w-16 ring-2 sm:h-20 sm:w-20 ${
                sponsorId
                  ? SPONSOR_THEMES[sponsorId].actorRing
                  : 'ring-slate-700/60'
              }`}
            />
            {sponsorId && <SponsorActorGear sponsorId={sponsorId} />}
          </div>
          <MoodCharacterEffects
            activity={displayedActivity}
            active={visualsActive}
          />
          {mood && (
            <MoodBubble
              ch={mood}
              className={`transition-opacity duration-500 ${visualsActive ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

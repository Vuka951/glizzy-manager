'use client';

import { useEffect, useMemo, useRef } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { useSceneAnimation } from '@/components/games/career/scenes/useSceneAnimation';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { PREMIER_BEATS, premierSounds } from '@/lib/constants/electionPremier';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import { premierClip, type PremierSpeech } from '@/lib/utils/careerPremier';
import { playCutsceneClip } from '@/lib/utils/cutsceneSounds';
import { playCheerSound, playQuoteClip } from '@/lib/utils/gameSounds';
import { sceneTimeline } from '@/lib/utils/sceneTimeline';

const PRIME_MINISTER = GAMES_UI.career.parliament.primeMinister;
const { riseMs, landMs, nameMs, quoteMs, totalMs } = PREMIER_BEATS;

function premierAnimations(you: boolean) {
  const still = 'translateY(0) scale(1)';
  return {
    'premier-banner': sceneTimeline(totalMs, [
      [0, { transform: 'translateX(-110%)' }],
      [riseMs, { transform: 'translateX(0)' }],
      [totalMs, { transform: 'translateX(0)' }],
    ]),
    'premier-rise': sceneTimeline(
      totalMs,
      you
        ? [
            [0, { transform: 'translateY(110%) scale(1)' }],
            [riseMs, { transform: 'translateY(110%) scale(1)' }],
            [landMs - 120, { transform: 'translateY(-8%) scale(1.18)' }],
            [landMs, { transform: still }],
            [landMs + 140, { transform: 'translateY(0) scale(1.07)' }],
            [landMs + 300, { transform: still }],
            [totalMs, { transform: still }],
          ]
        : [
            [0, { transform: 'translateY(110%) scale(1)' }],
            [riseMs, { transform: 'translateY(110%) scale(1)' }],
            [landMs, { transform: still }],
            [totalMs, { transform: still }],
          ],
    ),
    'premier-name': sceneTimeline(totalMs, [
      [0, { opacity: 0, transform: 'translateX(-100%)' }],
      [nameMs, { opacity: 0, transform: 'translateX(-100%)' }],
      [nameMs + 250, { opacity: 1, transform: 'translateX(0)' }],
      [totalMs, { opacity: 1, transform: 'translateX(0)' }],
    ]),
    'premier-quote': sceneTimeline(totalMs, [
      [0, { opacity: 0, transform: 'scale(0.6)' }],
      [quoteMs, { opacity: 0, transform: 'scale(0.6)' }],
      [quoteMs + 180, { opacity: 1, transform: 'scale(1.05)' }],
      [quoteMs + 300, { opacity: 1, transform: 'scale(1)' }],
      [totalMs, { opacity: 1, transform: 'scale(1)' }],
    ]),
    'premier-glow': sceneTimeline(totalMs, [
      [0, { opacity: 0 }],
      [riseMs, { opacity: 0 }],
      [landMs, { opacity: 1 }],
      [totalMs, { opacity: 1 }],
    ]),
    'premier-rays': sceneTimeline(totalMs, [
      [0, { opacity: 0, transform: 'rotate(0deg)' }],
      [landMs, { opacity: 1, transform: 'rotate(25deg)' }],
      [totalMs, { opacity: 1, transform: 'rotate(80deg)' }],
    ]),
    'premier-flash': sceneTimeline(totalMs, [
      [0, { opacity: 0 }],
      [landMs, { opacity: 0 }],
      [landMs + 60, { opacity: 0.85 }],
      [landMs + 420, { opacity: 0 }],
      [totalMs, { opacity: 0 }],
    ]),
  };
}

// The last beat of election night: the new premier rises behind a podium
// under his list's colours, his name comes up in a lower third, and he opens
// with a line about whoever ruined the town before him. When the office goes
// to the viewer's own man the stage flashes and the rays turn behind him.
// Still renders the end frame with no cues
export default function ElectionPremierBeat({
  premier,
  character,
  you,
  still,
}: {
  premier: PremierSpeech;
  character: DuelCharacter | undefined;
  you: boolean;
  still: boolean;
}) {
  const root = useRef<HTMLDivElement | null>(null);
  const theme = SPONSOR_THEMES[premier.party];
  const animations = useMemo(() => premierAnimations(you), [you]);
  useSceneAnimation(root, animations, [still, animations]);
  const anim = (name: string) => (still ? undefined : name);
  const clip = premierClip(premier);
  const clipSrc = clip.src;

  useEffect(() => {
    if (still) return;
    let voice: HTMLAudioElement | null = null;
    const timers = [
      window.setTimeout(
        () => playCutsceneClip('flash-barrage', premierSounds.flash),
        riseMs,
      ),
      window.setTimeout(
        () => playCutsceneClip('mic-tap', premierSounds.mic),
        nameMs,
      ),
      ...(you
        ? [
            window.setTimeout(() => {
              playCutsceneClip('cymbal-crash', premierSounds.crash);
              playCheerSound(1);
            }, landMs),
          ]
        : []),
      window.setTimeout(() => {
        voice = playQuoteClip(clipSrc);
      }, quoteMs),
    ];
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      if (voice) {
        voice.pause();
        voice.src = '';
      }
    };
  }, [still, you, clipSrc]);

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden text-left">
      {you && (
        <div
          data-anim={anim('premier-rays')}
          className="absolute left-[24%] top-1/2 aspect-square h-[220%] -translate-x-1/2 -translate-y-1/2 bg-[repeating-conic-gradient(rgba(255,255,255,0.1)_0deg_9deg,transparent_9deg_18deg)]"
        />
      )}
      <div
        data-anim={anim('premier-banner')}
        className={`absolute inset-x-0 top-[22%] h-12 opacity-70 sm:h-14 ${theme.stripe}`}
      />

      <div
        data-anim={anim('premier-glow')}
        className="absolute bottom-[34%] left-[4%] flex w-32 justify-center sm:left-[9%] sm:w-40"
      >
        <span
          className={`h-32 w-32 rounded-full blur-2xl ${theme.actorGlow}`}
        />
      </div>
      <div className="absolute bottom-[26%] left-[4%] h-[66%] w-32 overflow-hidden sm:left-[9%] sm:w-40">
        <div
          data-anim={anim('premier-rise')}
          className="absolute inset-x-0 bottom-0 flex flex-col items-center origin-bottom"
        >
          <span
            className={`relative z-10 rounded-full ring-4 ${theme.actorRing} ${
              you ? 'ring-offset-2 ring-offset-amber-300' : ''
            }`}
          >
            {character ? (
              <PortraitHead
                character={character}
                className="h-24 w-24 sm:h-28 sm:w-28"
              />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 sm:h-28 sm:w-28">
                <SponsorEmblem sponsorId={premier.party} className="h-12 w-12" />
              </span>
            )}
          </span>
          <span className="relative -mt-4 flex h-12 w-28 justify-center overflow-hidden rounded-t-3xl border border-slate-600 bg-slate-800 sm:w-32">
            <span className={`mt-4 h-full w-3 ${theme.stripe}`} />
          </span>
        </div>
      </div>

      <div className="absolute bottom-[14%] left-[4%] z-20 flex h-[13%] w-32 items-center justify-center rounded-t-lg border-t-2 border-slate-500 bg-slate-900 shadow-lg sm:left-[9%] sm:w-40">
        <span className="absolute -top-5 left-1/2 h-5 w-0.5 -translate-x-1/2 bg-slate-400" />
        <span className="absolute -top-7 left-1/2 h-2.5 w-2 -translate-x-1/2 rounded-full bg-slate-300" />
        <SponsorEmblem sponsorId={premier.party} className="h-6 w-6" />
      </div>

      <div
        data-anim={anim('premier-name')}
        className="absolute bottom-[3%] left-0 z-30 flex max-w-[70%] items-stretch shadow-[0_2px_0_rgb(2_6_23/0.7)]"
      >
        <span className={`w-1.5 shrink-0 ${theme.stripe}`} />
        <span className="flex min-w-0 flex-col bg-slate-950 px-3 py-1">
          <span
            className={`font-sign text-[12px] font-bold uppercase leading-tight tracking-[0.12em] ${
              you ? 'text-amber-300' : 'text-sky-300'
            }`}
          >
            {PRIME_MINISTER}
          </span>
          <span className="truncate font-sign text-[17px] font-extrabold uppercase leading-tight text-white">
            {character?.name ?? premier.slug}
          </span>
        </span>
      </div>

      <div
        data-anim={anim('premier-quote')}
        className="absolute right-[3%] top-[7%] z-30 w-[52%] origin-bottom-left rounded-2xl border-2 border-slate-100 bg-slate-50 px-3 py-2 text-slate-900 shadow-xl sm:w-[50%]"
      >
        <span className="absolute -bottom-6 -left-6 h-7 w-14 bg-slate-50 [clip-path:polygon(0_100%,55%_0,100%_0)]" />
        <p className="relative text-[11px] font-black leading-snug sm:text-sm">
          „{clip.text}“
        </p>
      </div>

      {you && (
        <div
          data-anim={anim('premier-flash')}
          className="pointer-events-none absolute inset-0 z-40 bg-amber-100 opacity-0"
        />
      )}
    </div>
  );
}

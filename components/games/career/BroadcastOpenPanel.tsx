import { useEffect, useRef, useState, type ReactNode } from 'react';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import CommentaryCaption from '@/components/games/CommentaryCaption';
import IntroHoldControls from '@/components/games/IntroHoldControls';
import BroadcastChanceSlide, {
  type ChanceRow,
} from '@/components/games/career/BroadcastChanceSlide';
import BroadcastSeasonSlide from '@/components/games/career/BroadcastSeasonSlide';
import BroadcastStreakSlide, {
  type StreakRow,
} from '@/components/games/career/BroadcastStreakSlide';
import BroadcastWeatherSlide, {
  type PastChampion,
} from '@/components/games/career/BroadcastWeatherSlide';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import {
  commentaryCopy,
  electionIntroLines,
  matchCueLines,
  tournamentWeatherLines,
  type CommentaryLine,
} from '@/data/games/matchCommentary';
import { WEATHER_EMOJI } from '@/lib/constants/broadcastWeather';
import {
  COMMENTARY_PLAYBACK_RATE,
  COMMENTARY_VOICE_VOLUME,
} from '@/lib/constants/careerCommentary';
import {
  COMMENTARY_CLIP_BASE,
  COMMENTARY_VOICED,
} from '@/lib/constants/careerCommentaryVoice';
import { titleChances } from '@/lib/utils/careerOdds';
import type { CareerSlot, SavedCareer } from '@/lib/utils/careerSave';
import { cupWeather } from '@/lib/utils/careerWeather';
import { buffedSlugsForSeason, seasonThemeIndex } from '@/lib/utils/cupSeason';
import { gameAudio } from '@/lib/utils/gameAudio';
import { readGameSettings, subscribeGameSettings } from '@/lib/utils/gameSettings';
import { captionHoldMs } from '@/lib/utils/matchCommentary';
import { currentStreak } from '@/lib/utils/matchTape';

const B = GAMES_UI.career.broadcast;

// How long each card holds before the next cuts in; the rundown's progress
// bar below runs the same length
const SLIDE_MS = 4200;
const SLIDE_PROGRESS = 'animate-[introbar_4.2s_linear_forwards]';
const CONTENDERS = 5;
const STREAK_MIN = 2;
const PAST_CHAMPIONS = 3;

type Slide = { id: string; emoji: string; title: string; body: ReactNode };

// Football-style pre-tournament cut-in: the commentator opens the broadcast
// over a rundown of studio cards, one at a time, and the last card holds
// until the coach clicks through or the countdown lets go. Shows once per
// season
export default function BroadcastOpenPanel({
  career,
  characterBySlug,
  slot,
  preview = false,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  // A single-player career claims the season per save slot, so another
  // slot at the same year and season still gets its welcome
  slot?: CareerSlot;
  // The dev preview page bypasses the once-per-season claim so it can remount
  preview?: boolean;
}) {
  // Claimed once per season on first mount; the career tree only renders
  // client-side, off the localStorage save
  const [visible, setVisible] = useState(() => {
    if (preview) return true;
    if (typeof window === 'undefined') return false;
    const scope = slot ? `slot${slot}-` : '';
    const key = `career-broadcast-open-${scope}${career.year}-${career.season}`;
    try {
      if (window.sessionStorage.getItem(key)) return false;
      window.sessionStorage.setItem(key, '1');
      return true;
    } catch {
      return false;
    }
  });
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const [caption, setCaption] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // The countdown may run out mid-sentence; the board then waits for the
  // commentator to finish before it lets go
  const speakingRef = useRef(false);
  const leaveWhenQuietRef = useRef(false);

  const themeIndex = seasonThemeIndex(career.season);
  const weather = cupWeather(career);

  // The welcome runs as a little segment: the greeting, then a word on the
  // weather. The first cup after a count adds a line on the new government
  useEffect(() => {
    if (!visible || !readGameSettings().commentator) return;
    const draw = (pool: CommentaryLine[]) =>
      pool[Math.floor(Math.random() * pool.length)];
    const weatherPool =
      tournamentWeatherLines[themeIndex] ?? tournamentWeatherLines[0];
    const parliament = career.parliament;
    const freshLeader =
      parliament &&
      parliament.government.length > 0 &&
      parliament.electedYear === career.year &&
      career.season === 0
        ? parliament.government[0]
        : null;
    const queue = [
      draw(matchCueLines.tournamentOpen),
      weatherPool[weather.lineIndex % weatherPool.length],
      ...(freshLeader ? [draw(electionIntroLines[freshLeader])] : []),
    ];
    let cancelled = false;
    let holdTimer: number | null = null;
    const quiet = () => {
      if (cancelled) return;
      speakingRef.current = false;
      setCaption(null);
      if (leaveWhenQuietRef.current) setVisible(false);
    };
    const playNext = () => {
      const line = queue.shift();
      if (!line || cancelled) {
        quiet();
        return;
      }
      const text = commentaryCopy(line.id).text;
      setCaption(text);
      // No clip to time the line (a language without a voice bank, a file
      // not rendered yet, autoplay refused): the caption stays up long
      // enough to be read, then the segment moves on
      const hold = () => {
        if (cancelled || holdTimer !== null) return;
        audioRef.current = null;
        holdTimer = window.setTimeout(() => {
          holdTimer = null;
          playNext();
        }, captionHoldMs(text));
      };
      if (!COMMENTARY_VOICED) {
        hold();
        return;
      }
      const audio = new Audio(`${COMMENTARY_CLIP_BASE}/${line.id}.mp3`);
      audio.volume = gameAudio.scaled(COMMENTARY_VOICE_VOLUME, 'voice');
      audio.playbackRate = COMMENTARY_PLAYBACK_RATE;
      audio.preservesPitch = true;
      audioRef.current = audio;
      audio.onended = playNext;
      audio.onerror = hold;
      audio.play().catch(hold);
    };
    const stopLine = () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if (holdTimer !== null) window.clearTimeout(holdTimer);
      holdTimer = null;
    };
    const unsubscribe = subscribeGameSettings(() => {
      if (readGameSettings().commentator) return;
      queue.length = 0;
      stopLine();
      quiet();
    });
    speakingRef.current = true;
    playNext();
    return () => {
      cancelled = true;
      unsubscribe();
      stopLine();
    };
  }, [visible, themeIndex, weather.lineIndex, career.season, career.year, career.parliament]);

  const slugs = Object.keys(career.characters);
  const chances = titleChances(career.characters);
  const chanceRows: ChanceRow[] = slugs
    .map((slug) => ({ slug, chance: chances[slug] ?? 0 }))
    .sort((x, y) => y.chance - x.chance)
    .slice(0, CONTENDERS)
    .map(({ slug, chance }) => ({
      slug,
      pct: Math.max(1, Math.round(chance * 100)),
    }));
  const inForm = [...buffedSlugsForSeason(career.season)].filter((slug) =>
    slugs.includes(slug),
  );
  const champions: PastChampion[] = career.standingsHistory
    .filter((entry) => entry.season === career.season)
    .slice(-PAST_CHAMPIONS)
    .reverse()
    .map((entry) => ({ slug: entry.champion, year: entry.year }));
  const streakRows = slugs
    .map((slug) => ({
      slug,
      streak: currentStreak(career.characters[slug].recentResults),
    }))
    .filter((row) => row.streak && row.streak.length >= STREAK_MIN);
  const longest = (kind: 'w' | 'l'): StreakRow | null => {
    const best = streakRows
      .filter((row) => row.streak?.kind === kind)
      .sort((x, y) => (y.streak?.length ?? 0) - (x.streak?.length ?? 0))[0];
    return best && best.streak ? { slug: best.slug, kind, length: best.streak.length } : null;
  };
  const streaks = [longest('w'), longest('l')].filter(
    (row): row is StreakRow => row !== null,
  );

  const slides: Slide[] = [
    {
      id: 'weather',
      emoji: WEATHER_EMOJI[themeIndex],
      title: B.weatherTitle,
      body: (
        <BroadcastWeatherSlide
          season={career.season}
          themeIndex={themeIndex}
          weather={weather}
          champions={champions}
          characterBySlug={characterBySlug}
        />
      ),
    },
    ...(inForm.length > 0
      ? [
          {
            id: 'form',
            emoji: '💪',
            title: B.inForm,
            body: (
              <BroadcastSeasonSlide
                slugs={inForm}
                season={career.season}
                themeIndex={themeIndex}
                chances={chances}
                characters={career.characters}
                characterBySlug={characterBySlug}
              />
            ),
          },
        ]
      : []),
    ...(streaks.length > 0
      ? [
          {
            id: 'streaks',
            emoji: '🔥',
            title: B.streaks,
            body: (
              <BroadcastStreakSlide
                rows={streaks}
                characters={career.characters}
                characterBySlug={characterBySlug}
              />
            ),
          },
        ]
      : []),
    {
      id: 'chance',
      emoji: '🏆',
      title: B.titleChance,
      body: <BroadcastChanceSlide rows={chanceRows} characterBySlug={characterBySlug} />,
    },
  ];
  const last = index >= slides.length - 1;

  useEffect(() => {
    if (!visible || !auto || last) return;
    const timer = window.setTimeout(() => setIndex((i) => i + 1), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [visible, auto, index, last]);

  if (!visible) return null;

  const slide = slides[Math.min(index, slides.length - 1)];
  const jump = (i: number) => {
    setIndex(i);
    setAuto(false);
  };
  const dismiss = () => {
    audioRef.current?.pause();
    setVisible(false);
  };
  const handleContinue = (fromCountdown: boolean) => {
    if (fromCountdown && speakingRef.current) {
      leaveWhenQuietRef.current = true;
      return;
    }
    dismiss();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-sm animate-[bubblein_0.3s_ease-out]">
      <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-frost-border/40 bg-gradient-to-br from-card-strong/90 via-card-deep/95 to-card-strong/90 p-5 shadow-2xl">
        <div className="flex items-center justify-center gap-2.5">
          <GlizzyIcon variant={1} className="h-4 w-7" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-300">
            {B.title}
          </p>
          <span className="flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-red-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
            {B.live}
          </span>
        </div>
        <div className="flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jump(i)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg border px-1 py-1.5 text-[8px] font-bold uppercase tracking-widest transition ${
                i === index
                  ? 'border-sky-200/50 bg-sky-200/10 text-sky-100'
                  : i < index
                    ? 'border-sky-200/10 bg-slate-900/40 text-slate-500 hover:text-slate-300'
                    : 'border-sky-200/10 bg-slate-900/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-sm">{s.emoji}</span>
              <span className="max-w-full truncate">{s.title}</span>
              <span className="h-0.5 w-full overflow-hidden rounded-full bg-slate-800/80">
                <span
                  className={`block h-full origin-left bg-sky-300 ${
                    i < index || (i === index && (!auto || last))
                      ? 'scale-x-100'
                      : i === index
                        ? SLIDE_PROGRESS
                        : 'scale-x-0'
                  }`}
                />
              </span>
            </button>
          ))}
        </div>
        <div key={slide.id} className="animate-[introslide_0.4s_ease-out]">
          {slide.body}
        </div>
        <CommentaryCaption line={caption} viewport />
        <IntroHoldControls
          onContinue={handleContinue}
          paused={!last}
          onStay={() => setAuto(false)}
        />
      </div>
    </div>
  );
}

import {
  commentaryCopy,
  commentaryNameForm,
  introAngleLines,
  matchCueLines,
  type CommentaryLine,
  type IntroAngle,
} from '@/data/games/matchCommentary';
import {
  DUEL_AI_PROFILES,
  type DuelCharacter,
  type HidingSpotId,
} from '@/data/games/glizzyDuel';
import {
  CAPTION_HOLD_BASE_MS,
  CAPTION_HOLD_MS_PER_CHAR,
  DODGE_CALL_CHANCE,
  DODGE_STREAK_MIN,
  LONG_MATCH_MIN_TURNS,
  QUICK_MATCH_MAX_TURNS,
} from '@/lib/constants/careerCommentary';
import {
  COMMENTARY_CLIP_BASE,
  COMMENTARY_VOICED,
} from '@/lib/constants/careerCommentaryVoice';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { characterEpithet } from '@/lib/utils/localeNames';
import { buildMatchFrames } from '@/lib/utils/matchFrames';
import { tiebreakStartTurn, type CupMatchResult } from '@/lib/utils/tournamentSim';

export type PlannedLine = {
  frameIndex: number;
  // Null where the language has no voice bank: the line is a caption only
  clip: string | null;
  text: string;
  // 2 interrupts anything, 1 interrupts filler, 0 never interrupts
  priority: 0 | 1 | 2;
};

export type CommentaryContext = {
  states?: Record<string, CharacterCareerState> | null;
  leaderSlug?: string | null;
  rival?: boolean;
  // Player matches and finals get the full intro; browsed AI matches a sting
  featured?: boolean;
  playerSlug?: string | null;
};

function variantIndex(id: string): number {
  return Number(id.match(/(\d+)$/)?.[1] ?? 1);
}

// Mirrors the generator: even-numbered variants baked the short name
function spokenName(character: DuelCharacter, lineId: string): string {
  const short = commentaryNameForm(character.slug).short;
  return short && variantIndex(lineId) % 2 === 0 ? short : character.name;
}

function clipUrl(line: CommentaryLine, slug?: string): string | null {
  if (!COMMENTARY_VOICED) return null;
  return `${COMMENTARY_CLIP_BASE}/${line.id}${slug ? `--${slug}` : ''}.mp3`;
}

// The plan is drawn from a generator seeded by the match itself, so every
// screen in a shared room hears the same calls for the same tape and a
// replay reads the same as the broadcast did
type Random = () => number;

function seededRandom(result: CupMatchResult, a: string, b: string): Random {
  const key = `${a}|${b}|${result.winner}|${result.turns
    .map((turn) => `${turn.matchRound}${turn.seeker}${turn.picked}${turn.hit ? 1 : 0}`)
    .join('')}`;
  let seed = 2166136261;
  for (const char of key) {
    seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0;
  }
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function draw(
  pool: CommentaryLine[],
  used: Set<string>,
  random: Random,
): CommentaryLine {
  const fresh = pool.filter((line) => !used.has(line.id));
  const picked = (fresh.length ? fresh : pool)[
    Math.floor(random() * (fresh.length ? fresh.length : pool.length))
  ];
  used.add(picked.id);
  return picked;
}

const SPOT_ANGLE: Record<HidingSpotId, IntroAngle> = {
  hat: 'spotHabitHat',
  sock: 'spotHabitSock',
  box: 'spotHabitBox',
};

function favouriteSpot(slug: string): HidingSpotId | null {
  const hide = DUEL_AI_PROFILES[slug]?.hide;
  if (!hide) return null;
  const best = (Object.entries(hide) as [HidingSpotId, number][]).sort(
    (x, y) => y[1] - x[1],
  )[0];
  return best && best[1] >= 2 ? best[0] : null;
}

// The hiding habit is a scouting note, not a jingle: it comes up once every
// three to five of the player's matches, on a fixed schedule so the same
// career never hears it twice in a row
function spotHabitDue(played: number): boolean {
  let next = 0;
  for (let k = 0; next <= played; k += 1) {
    if (next === played && k > 0) return true;
    next += 3 + ((Math.imul(k + 1, 2654435761) >>> 0) % 3);
  }
  return false;
}

const LOSS_STREAK_MIN = 3;

// Losses in a row going into tonight, read off the recent tape only: a bad
// lifetime record is not a streak, and a man who just won three is not
// losing and losing and losing
function lossStreakLength(state: CharacterCareerState | undefined): number {
  const recent = state?.recentResults ?? [];
  let streak = 0;
  for (let i = recent.length - 1; i >= 0 && recent[i] === 'l'; i -= 1) {
    streak += 1;
  }
  return streak;
}

type IntroStory = { angle: IntroAngle; weight: number };
type IntroCandidate = { weight: number; tell: () => void };

// Tickets in the intro hat. A derby outranks the table, a title run outranks
// a habit, and the plain epithet is always in there so nobody gets the same
// opener every night
const RIVALRY_INTRO_WEIGHT = 6;
const INTRO_ANGLE_WEIGHT: Record<IntroAngle, number> = {
  rivalry: 6,
  titleStreak: 4,
  tableLeader: 3,
  meltdownHistory: 3,
  lossStreak: 3,
  spotHabitHat: 2,
  spotHabitSock: 2,
  spotHabitBox: 2,
  epithet: 1,
};

// Everything the table knows about one fighter. The weight sizes a story so
// two men with the same angle are told apart by who has more of it: the
// longer title run, the longer losing run
function introStoriesFor(
  character: DuelCharacter,
  context: CommentaryContext,
  habitAllowed: boolean,
): IntroStory[] {
  const state = context.states?.[character.slug];
  const stories: IntroStory[] = [];
  if (state && state.titles > 0 && state.titleStreak > 0) {
    stories.push({ angle: 'titleStreak', weight: state.titleStreak });
  }
  if (context.leaderSlug && character.slug === context.leaderSlug) {
    stories.push({ angle: 'tableLeader', weight: 0 });
  }
  if (state && state.meltdowns >= 2) {
    stories.push({ angle: 'meltdownHistory', weight: state.meltdowns });
  }
  const streak = lossStreakLength(state);
  if (streak >= LOSS_STREAK_MIN) stories.push({ angle: 'lossStreak', weight: streak });
  const spot = habitAllowed ? favouriteSpot(character.slug) : null;
  if (spot) stories.push({ angle: SPOT_ANGLE[spot], weight: 0 });
  stories.push({ angle: 'epithet', weight: 0 });
  return stories;
}

function fillCaption(line: CommentaryLine, character: DuelCharacter): string {
  return commentaryCopy(line.id)
    .text.replaceAll('{name}', spokenName(character, line.id))
    .replaceAll('{epithet}', characterEpithet(character.slug));
}

export function planCommentary(
  result: CupMatchResult,
  a: DuelCharacter,
  b: DuelCharacter,
  context: CommentaryContext = {},
): PlannedLine[] {
  const frames = buildMatchFrames(result);
  const used = new Set<string>();
  const random = seededRandom(result, a.slug, b.slug);
  const pick = (pool: CommentaryLine[]) => draw(pool, used, random);
  const plan: PlannedLine[] = [];
  const events = result.events ?? [];
  const winner = result.winner === 'a' ? a : b;

  const push = (
    frameIndex: number,
    line: CommentaryLine,
    priority: 0 | 1 | 2,
    character?: DuelCharacter,
  ) => {
    plan.push({
      frameIndex,
      clip: clipUrl(line, character?.slug),
      text: character ? fillCaption(line, character) : commentaryCopy(line.id).text,
      priority,
    });
  };

  // Intro: the walkover has no turns at all, so its story is told up front
  if (result.reason === 'withdrawn') {
    push(0, pick(matchCueLines.withdrawn), 2);
  } else if (!context.featured) {
    const stingPool =
      random() < 0.5 ? matchCueLines.quickNext : matchCueLines.matchStart;
    push(0, pick(stingPool), 0);
  } else {
    // Every story about tonight goes into the hat, the bigger ones with more
    // tickets, so the same pairing does not open the same way every time
    const playerSlug = context.playerSlug ?? null;
    const player = playerSlug ? context.states?.[playerSlug] : null;
    const habitDue = spotHabitDue(player ? player.wins + player.losses : 0);
    const pairLine = (pool: CommentaryLine[], who: DuelCharacter, other: DuelCharacter) => {
      const line = pick(pool);
      plan.push({
        frameIndex: 0,
        clip: clipUrl(line),
        text: commentaryCopy(line.id)
          .text.replaceAll('{a}', who.name)
          .replaceAll('{b}', other.name),
        priority: 1,
      });
    };
    const candidates: IntroCandidate[] = [];
    if (context.rival) {
      candidates.push({
        weight: RIVALRY_INTRO_WEIGHT,
        tell: () => pairLine(introAngleLines.rivalry, a, b),
      });
    }
    for (const subject of [a, b]) {
      // The habit is told about the opponent, never the player himself
      for (const story of introStoriesFor(subject, context, habitDue && subject.slug !== playerSlug)) {
        candidates.push({
          weight: INTRO_ANGLE_WEIGHT[story.angle] + Math.min(story.weight, 4) * 0.5,
          tell: () => push(0, pick(introAngleLines[story.angle]), 1, subject),
        });
      }
    }
    const total = candidates.reduce((sum, c) => sum + c.weight, 0);
    let roll = random() * total;
    const chosen =
      candidates.find((c) => (roll -= c.weight) < 0) ?? candidates[candidates.length - 1];
    chosen.tell();
  }

  // Turn-by-turn: frame 0 is the intro, then place/think/reveal per turn with
  // forfeit event frames spliced after their turn (mirrors buildMatchFrames)
  let missStreak = 0;
  frames.forEach((frame, frameIndex) => {
    if (frame.kind === 'event') {
      const cue =
        frame.event.kind === 'police' || frame.event.kind === 'removed'
          ? matchCueLines.police
          : frame.event.kind === 'meltdown'
            ? matchCueLines.meltdown
            : frame.event.kind === 'tiebreak'
              ? matchCueLines.tiebreak
              : matchCueLines.overfullForfeit;
      push(frameIndex, pick(cue), 2);
      return;
    }
    if (frame.kind === 'think') {
      const eventHere = events.find(
        (event) =>
          event.afterTurn === frame.turnIndex &&
          (event.kind === 'sniff-dodge' || event.kind === 'random-pick'),
      );
      if (eventHere?.kind === 'sniff-dodge') {
        push(frameIndex, pick(matchCueLines.sniffDodge), 1);
      } else if (eventHere?.kind === 'random-pick') {
        push(frameIndex, pick(matchCueLines.randomPick), 1);
      }
      return;
    }
    if (frame.kind !== 'reveal') return;
    const turn = result.turns[frame.turnIndex];
    if (turn.hit) {
      missStreak = 0;
      const binged = events.some(
        (event) =>
          event.afterTurn === frame.turnIndex && event.kind === 'binge-grab',
      );
      push(
        frameIndex,
        pick(binged ? matchCueLines.bingeGrab : matchCueLines.grab),
        1,
      );
      return;
    }
    missStreak += 1;
    if (missStreak >= DODGE_STREAK_MIN) {
      push(frameIndex, pick(matchCueLines.dodgeStreak), 1);
    } else if (random() < DODGE_CALL_CHANCE) {
      push(frameIndex, pick(matchCueLines.dodge), 0);
    }
  });

  // A marathon gets called out around two thirds in, on a quiet place frame.
  // Sudden death has its own call on its event frame, so a match that went
  // to extra time skips the marathon line
  if (
    result.turns.length >= LONG_MATCH_MIN_TURNS &&
    tiebreakStartTurn(result) < 0
  ) {
    const targetTurn = Math.floor(result.turns.length * 0.66);
    const frameIndex = frames.findIndex(
      (frame) => frame.kind === 'place' && frame.turnIndex === targetTurn,
    );
    if (frameIndex >= 0) push(frameIndex, pick(matchCueLines.longMatch), 0);
  }

  // Finish chain, played back to back once the board is settled
  const quick =
    !result.reason &&
    result.turns.length > 0 &&
    result.turns.length <= QUICK_MATCH_MAX_TURNS;
  if (quick) push(frames.length, pick(matchCueLines.quickFinish), 2);
  push(frames.length, pick(matchCueLines.winner), 2, winner);
  if (!quick) push(frames.length, pick(matchCueLines.comedown), 2);

  return plan;
}

// How long a caption with no clip behind it stays up
export function captionHoldMs(text: string): number {
  return CAPTION_HOLD_BASE_MS + text.length * CAPTION_HOLD_MS_PER_CHAR;
}

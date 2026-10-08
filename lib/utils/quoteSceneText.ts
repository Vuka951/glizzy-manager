import { GAMES_UI } from '@/data/games/locale';
import {
  QUOTE_MIN_WORD_GAP_MS,
  QUOTE_READ_BASE_MS,
  QUOTE_READ_WORD_MS,
  quoteLineStartMs,
  type QuoteSceneDefinition,
  type QuoteSceneId,
} from '@/lib/constants/quoteCutscenes';
import { QUOTE_SCENE_TAIL_MS } from '@/lib/types/quoteScenes';
import type { QuotePlayback } from '@/lib/utils/quoteCutsceneTriggers';

export type QuoteSceneText = {
  // Lower third of the broadcast frame. {name} is the speaker and {other}
  // the one standing next to them, both as the roster spells them
  headline: string;
  // A variant that reads as a different story gets its own lower third
  headlineByVariant?: Record<string, string>;
  // One entry per line of the scene's definition, in the same order. Each
  // entry lists the wordings the line can take, of which a playback says one
  lines: string[][];
};

// The roster names a headline is filled with
export type QuoteHeadlineNames = { name: string; other?: string };

export type QuoteSubtitleTiming = {
  speaker: string;
  words: string[];
  // When each word lands, counted from the start of the scene
  wordAt: number[];
};

export type QuoteSceneSchedule = {
  subtitles: QuoteSubtitleTiming[];
  durationMs: number;
};

// Looked up on every call rather than kept, so a dictionary switched while
// the game runs shows on the next scene
export function quoteSceneText(id: QuoteSceneId): QuoteSceneText {
  const scenes: Record<QuoteSceneId, QuoteSceneText> =
    GAMES_UI.career.quoteScenes;
  return scenes[id];
}

export function quoteHeadline(
  id: QuoteSceneId,
  variant: string | undefined,
  names: QuoteHeadlineNames,
): string {
  const text = quoteSceneText(id);
  const headline =
    (variant && text.headlineByVariant?.[variant]) || text.headline;
  return headline
    .replaceAll('{name}', names.name)
    .replaceAll('{other}', names.other ?? '');
}

// The wording a playback's roll picks out of a line's list
export function quoteLineWording(
  wordings: readonly string[],
  lineRoll: number,
): string {
  const pick = Math.min(
    wordings.length - 1,
    Math.floor(lineRoll * wordings.length),
  );
  return wordings[pick] ?? '';
}

function readHoldMs(wordCount: number): number {
  return QUOTE_READ_BASE_MS + QUOTE_READ_WORD_MS * wordCount;
}

// The pace of one line: as slow as its window allows while the reading hold
// still fits in the time left after it, never quicker than the minimum gap
// and never running past the window
function wordGapMs(
  wordCount: number,
  windowMs: number,
  afterWindowMs: number,
): number {
  if (wordCount < 2) return 0;
  const fitting =
    (windowMs + afterWindowMs - readHoldMs(wordCount)) / (wordCount - 1);
  return Math.min(
    windowMs / wordCount,
    Math.max(QUOTE_MIN_WORD_GAP_MS, fitting),
  );
}

// Each line is said by the playback's speaker or the one next to them, in
// the wording the playback rolled, and types on inside its own share of the
// line window, from its offset to the next line's or to the window's end. The scene runs its
// usual length unless the last line needs longer to be read, in which case
// only the hold at the end grows and nothing before it moves
export function quoteSceneSchedule(
  def: QuoteSceneDefinition,
  play: Pick<QuotePlayback, 'speaker' | 'other' | 'lineRoll'>,
): QuoteSceneSchedule {
  const start = quoteLineStartMs(def);
  const texts = quoteSceneText(def.id).lines;
  const subtitles = def.lines.map((line, index): QuoteSubtitleTiming => {
    const words = quoteLineWording(texts[index] ?? [], play.lineRoll)
      .split(/\s+/)
      .filter(Boolean);
    const next = def.lines[index + 1];
    const windowMs = (next ? next.at : def.lineMs) - line.at;
    const gap = wordGapMs(words.length, windowMs, next ? 0 : QUOTE_SCENE_TAIL_MS);
    return {
      speaker:
        line.speaker === 'other' ? (play.other ?? play.speaker) : play.speaker,
      words,
      wordAt: words.map((_, word) => Math.round(start + line.at + word * gap)),
    };
  });
  const plainMs = start + def.lineMs + QUOTE_SCENE_TAIL_MS;
  const last = subtitles.at(-1);
  const completeAt = last?.wordAt.at(-1);
  return {
    subtitles,
    durationMs:
      last && completeAt !== undefined
        ? Math.max(plainMs, completeAt + readHoldMs(last.words.length))
        : plainMs,
  };
}

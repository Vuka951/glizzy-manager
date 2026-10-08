import {
  QUOTE_DEFAULT_CHANCE,
  QUOTE_MATCH_ROUNDS,
  QUOTE_MATCH_SCENES_PER_SEASON,
  QUOTE_ROUND_ORDER,
  QUOTE_SCENES,
  QUOTE_UNCOACHED_CHANCE_SCALE,
  type QuoteCupPlace,
  type QuoteLossCause,
  type QuoteMatchRound,
  type QuoteSceneDefinition,
  type QuoteSceneId,
  type QuoteTrigger,
} from '@/lib/constants/quoteCutscenes';
import type {
  CharacterCareerState,
  SavedCareer,
  SponsorId,
} from '@/lib/utils/careerSave';
import type {
  CupMatchResult,
  CupStanding,
} from '@/lib/utils/tournamentSim';

// Straight losses on a man's record before a win reads as a streak. The
// record is recentResults: his last five results in every match he played,
// carried across cups and seasons. A walkover by
// withdrawal is not on it
export const LOSS_STREAK_MIN = 4;

// One airing of a scene. The speaker is whoever the situation fell on, so
// the same scene plays for a different character every time
export type QuotePlayback = {
  id: QuoteSceneId;
  speaker: string;
  other?: string;
  variant?: string;
  // 0 to 1, picks one of the wordings of each line. Rolled with the scene,
  // so a reload and every screen of a room show the same words
  lineRoll: number;
};

// What a draw needs besides the event: the scenes this season has aired,
// the season's roll seed and the characters a human coaches
export type QuoteDraw = {
  fired: readonly string[];
  seed: string;
  coached: readonly string[];
};

export type MatchResultEvent = {
  kind: 'match-result';
  winner: string;
  loser: string;
  round: QuoteMatchRound;
  margin: number;
  winnerFame: number;
  loserFame: number;
  winnerLossStreak: number;
  // The straight losses the loser walked in with, this one not counted
  loserLossStreak: number;
  lossCause: QuoteLossCause | null;
  loserRemovedBy: 'police' | 'party' | null;
  loserFirstMatch: boolean;
  winnerSponsor: SponsorId | null;
  loserSponsor: SponsorId | null;
};

export type CupFinishedEvent = {
  kind: 'cup-finished';
  standings: CupStanding[];
};

export type SponsorAcceptedEvent = {
  kind: 'sponsor-accepted';
  slug: string;
  sponsorId: SponsorId;
};

// The index the window closed on and everyone in the league, since the
// speaker is drawn from it
export type GlizacijaDropEvent = {
  kind: 'glizacija-drop';
  index: number;
  roster: string[];
};

export type QuoteEvent =
  | MatchResultEvent
  | CupFinishedEvent
  | SponsorAcceptedEvent
  | GlizacijaDropEvent;

export function matchRoundKind(round: number, roundCount: number): QuoteMatchRound {
  const fromEnd = roundCount - 1 - round;
  if (fromEnd === 0) return 'final';
  if (fromEnd === 1) return 'semifinal';
  if (fromEnd === 2) return 'quarterfinal';
  return 'earlier';
}

// The sim books every forfeit on the loser: a meltdown is the cholesterol
// meter bursting, overfull-forfeit is throwing up, withdrawn covers both the
// low-morale walkover and a coach pulling his man out. Police and removals
// are someone else's doing
export function lossCauseOf(result: CupMatchResult): QuoteLossCause | null {
  switch (result.reason) {
    case 'meltdown':
      return 'cholesterol';
    case 'overfull-forfeit':
      return 'puke';
    case 'withdrawn':
      return 'surrender';
    default:
      return null;
  }
}

export function lossStreakOf(ch: CharacterCareerState | undefined): number {
  const results = ch?.recentResults ?? [];
  let streak = 0;
  for (let i = results.length - 1; i >= 0 && results[i] === 'l'; i--) streak++;
  return streak;
}

// Who took the loser out of the match: a police warrant served mid-match
// (reason police), or a party favor's removal at the door (reason removed,
// booked through bookRemoval and walked out before the first glizzy)
export function loserRemovedBy(
  result: CupMatchResult,
): 'police' | 'party' | null {
  if (result.reason === 'police') return 'police';
  if (result.reason === 'removed') return 'party';
  return null;
}

// Whether a man walks into his first match of the cup: nothing of his is on
// the board yet. Reads the state from before the match
function isFirstMatchOf(
  state: SavedCareer,
  slug: string,
  round: QuoteMatchRound,
): boolean {
  if (round !== 'earlier') return false;
  return !(state.cup?.rounds ?? []).some((r) =>
    r.some((m) => m.result && (m.a === slug || m.b === slug)),
  );
}

// The final score is lives left, a man's cap minus the glizzies he ate
// (livesA and livesB on the result, shown as livesA : livesB on the final
// card). The margin is the winner's lives minus the loser's; a forfeit can
// leave it at zero or below
export function scoreMargin(result: CupMatchResult): number {
  return result.winner === 'a'
    ? result.livesA - result.livesB
    : result.livesB - result.livesA;
}

// Reads the match facts off the state as it stood before the result was
// folded in, so fame and the form line describe the men who walked in
export function buildMatchResultEvent(
  state: SavedCareer,
  a: string,
  b: string,
  result: CupMatchResult,
  round: QuoteMatchRound,
): MatchResultEvent {
  const winner = result.winner === 'a' ? a : b;
  const loser = result.winner === 'a' ? b : a;
  return {
    kind: 'match-result',
    winner,
    loser,
    round,
    margin: scoreMargin(result),
    winnerFame: state.characters[winner]?.fame ?? 0,
    loserFame: state.characters[loser]?.fame ?? 0,
    winnerLossStreak: lossStreakOf(state.characters[winner]),
    loserLossStreak: lossStreakOf(state.characters[loser]),
    lossCause: lossCauseOf(result),
    loserRemovedBy: loserRemovedBy(result),
    loserFirstMatch: isFirstMatchOf(state, loser, round),
    winnerSponsor: state.characters[winner]?.sponsor?.sponsorId ?? null,
    loserSponsor: state.characters[loser]?.sponsor?.sponsorId ?? null,
  };
}

// Everyone who went into the off-season without a sponsor and came out
// with one
export function sponsorSigningsBetween(
  before: Record<string, CharacterCareerState>,
  after: Record<string, CharacterCareerState>,
): SponsorAcceptedEvent[] {
  return Object.entries(after).flatMap(([slug, ch]) =>
    ch.sponsor && !before[slug]?.sponsor
      ? [
          {
            kind: 'sponsor-accepted' as const,
            slug,
            sponsorId: ch.sponsor.sponsorId,
          },
        ]
      : [],
  );
}

// The glizacija drop a window brought, if the index closed lower than it
// opened. A move held at the floor is no drop
export function glizacijaDropsBetween(
  before: Pick<SavedCareer, 'gliziPriceIndex'>,
  after: Pick<SavedCareer, 'gliziPriceIndex' | 'characters'>,
): GlizacijaDropEvent[] {
  const index = after.gliziPriceIndex ?? 1;
  return index < (before.gliziPriceIndex ?? 1)
    ? [
        {
          kind: 'glizacija-drop',
          index,
          roster: Object.keys(after.characters),
        },
      ]
    : [];
}

// Who a fitting trigger puts on stage
type QuoteCast = Pick<QuotePlayback, 'speaker' | 'other' | 'variant'>;

function cast(
  def: QuoteSceneDefinition,
  speaker: string,
  opponent: string | undefined,
  variant: string | undefined,
): QuoteCast {
  return {
    speaker,
    ...(def.other === 'opponent' && opponent ? { other: opponent } : {}),
    ...(variant === undefined ? {} : { variant }),
  };
}

function sceneRounds(def: QuoteSceneDefinition): QuoteMatchRound[] {
  return def.fromRound
    ? QUOTE_ROUND_ORDER.slice(QUOTE_ROUND_ORDER.indexOf(def.fromRound))
    : QUOTE_MATCH_ROUNDS;
}

function matchResultCast(
  def: QuoteSceneDefinition,
  trigger: Extract<QuoteTrigger, { kind: 'match-result' }>,
  event: MatchResultEvent,
): QuoteCast | null {
  const won = trigger.role === 'winner';
  const speaker = won ? event.winner : event.loser;
  const opponent = won ? event.loser : event.winner;
  if (trigger.opponent && opponent !== trigger.opponent) return null;
  if (!sceneRounds(def).includes(event.round)) return null;
  if (trigger.minMargin !== undefined && event.margin < trigger.minMargin)
    return null;
  // A forfeit stops the count wherever it stood, often level or behind, so
  // only a match that went the distance can be this close
  if (
    trigger.maxMargin !== undefined &&
    (event.margin > trigger.maxMargin ||
      event.lossCause !== null ||
      event.loserRemovedBy !== null)
  )
    return null;
  const speakerFame = won ? event.winnerFame : event.loserFame;
  const opponentFame = won ? event.loserFame : event.winnerFame;
  if (trigger.opponentLowerFame && !(opponentFame < speakerFame)) return null;
  if (trigger.opponentHigherFame && !(opponentFame > speakerFame)) return null;
  if (trigger.afterLossStreak && event.winnerLossStreak < LOSS_STREAK_MIN)
    return null;
  if (
    trigger.extendsLossStreak &&
    !(!won && event.loserLossStreak + 1 >= LOSS_STREAK_MIN)
  )
    return null;
  if (trigger.opponentRemoved && !(won && event.loserRemovedBy)) return null;
  if (trigger.loserFirstMatch && !(!won && event.loserFirstMatch)) return null;
  if (trigger.lossCause) {
    if (!event.lossCause) return null;
    if (trigger.lossCauses && !trigger.lossCauses.includes(event.lossCause))
      return null;
    return cast(def, speaker, opponent, event.lossCause);
  }
  if (trigger.sponsorVariant) {
    const sponsor = won ? event.winnerSponsor : event.loserSponsor;
    return cast(def, speaker, opponent, sponsor ?? undefined);
  }
  return cast(def, speaker, opponent, trigger.variant);
}

// The champion stands with the runner-up and the runner-up with the champion.
// Last is the lowest place the bracket handed out, past the two finalists,
// and stands alone
function cupFinishedCast(
  def: QuoteSceneDefinition,
  trigger: Extract<QuoteTrigger, { kind: 'cup-finished' }>,
  event: CupFinishedEvent,
): QuoteCast | null {
  const holder = (wanted: number) =>
    event.standings.find((s) => s.place === wanted)?.slug;
  if (trigger.place === 'last') {
    const foot = Math.max(...event.standings.map((s) => s.place));
    const last = foot > 2 ? holder(foot) : undefined;
    return last ? cast(def, last, undefined, trigger.variant) : null;
  }
  const place = trigger.place === 'champion' ? 1 : 2;
  const speaker = holder(place);
  if (!speaker) return null;
  return cast(def, speaker, holder(place === 1 ? 2 : 1), trigger.variant);
}

function triggerCast(
  def: QuoteSceneDefinition,
  trigger: QuoteTrigger,
  event: QuoteEvent,
  seed: string,
): QuoteCast | null {
  if (trigger.kind !== event.kind) return null;
  switch (trigger.kind) {
    case 'match-result':
      return matchResultCast(def, trigger, event as MatchResultEvent);
    case 'cup-finished':
      return cupFinishedCast(def, trigger, event as CupFinishedEvent);
    case 'sponsor-accepted': {
      const signed = event as SponsorAcceptedEvent;
      return cast(
        def,
        signed.slug,
        undefined,
        trigger.sponsorVariant ? signed.sponsorId : trigger.variant,
      );
    }
    case 'glizacija-drop': {
      const drop = event as GlizacijaDropEvent;
      const speaker =
        drop.roster[
          Math.floor(
            quoteRoll(seed, event, `speaker:${def.id}`) * drop.roster.length,
          )
        ];
      return speaker ? cast(def, speaker, undefined, trigger.variant) : null;
    }
  }
}

// The season and the table the cup opened on: a reload rolls the same way,
// and two careers rarely share a season's luck
export function quoteRollSeed(state: {
  year: number;
  season: number;
  cupStartRanks?: string[];
}): string {
  return `${state.year}:${state.season}:${(state.cupStartRanks ?? []).join(',')}`;
}

function eventKey(event: QuoteEvent): string {
  switch (event.kind) {
    case 'match-result':
      return `${event.kind}:${event.round}:${event.winner}:${event.loser}`;
    case 'cup-finished':
      return `${event.kind}:${event.standings.map((s) => s.slug).join(',')}`;
    case 'sponsor-accepted':
      return `${event.kind}:${event.slug}`;
    case 'glizacija-drop':
      return `${event.kind}:${event.index}`;
  }
}

// FNV-1a over the seed, the event and the scene or draw, then a murmur finish so
// seeds that differ in one character still spread over the whole range
export function quoteRoll(
  seed: string,
  event: QuoteEvent,
  key: string,
): number {
  const text = `${seed}|${eventKey(event)}|${key}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

type QuoteCandidate = {
  def: QuoteSceneDefinition;
  cast: QuoteCast;
  tier: number;
};

const CUP_PLACE_ORDER: QuoteCupPlace[] = ['champion', 'runner-up', 'last'];

// The tiers one event asks one after another. A cup finish asks the
// champion's scenes, then the runner-up's, then the last place's; any other
// event asks the scenes tied to this very opponent before the ones any
// result of the kind would cue
function tierOf(trigger: QuoteTrigger): number {
  if (trigger.kind === 'cup-finished')
    return CUP_PLACE_ORDER.indexOf(trigger.place);
  return trigger.kind === 'match-result' && trigger.opponent !== undefined
    ? 0
    : 1;
}

const MATCH_SCENE_IDS: ReadonlySet<string> = new Set(
  QUOTE_SCENES.filter((def) =>
    def.triggers.some((trigger) => trigger.kind === 'match-result'),
  ).map((def) => def.id),
);

function matchScenesAired(fired: readonly string[]): number {
  return fired.filter((id) => MATCH_SCENE_IDS.has(id)).length;
}

// A match result rolls at the scene's full chance only when a human coaches
// one of the two; the season's cap on match scenes closes it altogether
function chanceScale(event: QuoteEvent, draw: QuoteDraw): number {
  if (event.kind !== 'match-result') return 1;
  if (matchScenesAired(draw.fired) >= QUOTE_MATCH_SCENES_PER_SEASON) return 0;
  return draw.coached.includes(event.winner) ||
    draw.coached.includes(event.loser)
    ? 1
    : QUOTE_UNCOACHED_CHANCE_SCALE;
}

// The scenes the event puts on the news. Each tier draws one of its scenes
// that has not aired this season, every one equally likely, and that scene
// then rolls its own chance; the scenes it passed over keep their slot for a
// later event. A cup finish gives every place its own draw, so the champion,
// the runner-up and the last place can all air, in that order. Any other
// event airs one scene at most: the next tier draws only when the one before
// it lost
export function quoteScenesFor(
  event: QuoteEvent,
  draw: QuoteDraw,
): QuotePlayback[] {
  const scale = chanceScale(event, draw);
  if (scale === 0) return [];
  const fitting = QUOTE_SCENES.flatMap((def): QuoteCandidate[] => {
    if (draw.fired.includes(def.id)) return [];
    for (const trigger of def.triggers) {
      const fit = triggerCast(def, trigger, event, draw.seed);
      if (fit) return [{ def, cast: fit, tier: tierOf(trigger) }];
    }
    return [];
  });
  const tiers = [...new Set(fitting.map((c) => c.tier))]
    .sort((x, y) => x - y)
    .map((tier) => fitting.filter((c) => c.tier === tier));
  const plays: QuotePlayback[] = [];
  for (const [i, tier] of tiers.entries()) {
    const drawn =
      tier[Math.floor(quoteRoll(draw.seed, event, `draw:${i}`) * tier.length)];
    const chance = (drawn.def.chance ?? QUOTE_DEFAULT_CHANCE) * scale;
    if (quoteRoll(draw.seed, event, drawn.def.id) >= chance) continue;
    plays.push({
      id: drawn.def.id,
      ...drawn.cast,
      lineRoll: quoteRoll(draw.seed, event, `line:${drawn.def.id}`),
    });
    if (event.kind !== 'cup-finished') break;
  }
  return plays;
}

export function withQuoteSceneFired(
  state: SavedCareer,
  play: QuotePlayback,
): SavedCareer {
  if (state.quoteScenesFired?.includes(play.id)) return state;
  return {
    ...state,
    quoteScenesFired: [...(state.quoteScenesFired ?? []), play.id],
  };
}

import en from '@/data/games/locales/en.json';
import sr from '@/data/games/locales/sr.json';
import {
  COACH_COLOR_ORDER,
  COACH_TOKEN_HEADER,
  MAX_COACHES,
  MIN_COACHES,
  CAREER_MP_ROOM_NAMESPACE,
  ROOM_CREATE_PER_HOUR,
  ROOM_ERROR_CODES,
  type RoomErrorCode,
} from '@/lib/constants/careerMp';
import { CAREER_BET_STAKES, OFFSEASON_SLOTS, OVERLORD_POINT_OPTIONS } from '@/data/games/careerEconomy';
import { OUTSIDER_DONATION_STEPS, PARTY_SEAT_ORDER } from '@/data/games/careerElections';
import { INVESTMENT_ORDER } from '@/data/games/careerInvestments';
import { TRAINING_ORDER } from '@/data/games/careerTraining';
import { GLIZZY_BET_STAKES, GLIZZY_CALLS } from '@/data/games/careerGlizzflationBets';
import { LOAN_STEPS } from '@/data/games/careerCredit';
import { CONSTITUTION_FAIL_RATING_PENALTY, CONSTITUTION_FROM_YEAR, MAX_LAWS_IN_FORCE } from '@/data/games/careerLaws';
import { applyAction } from '@/lib/server/career-mp/reducer';
import { careerFor, sharedCareer } from '@/lib/server/career-mp/lens';
import { step } from '@/lib/server/career-mp/timers';
import { viewFor } from '@/lib/server/career-mp/view';
import { DEFAULT_SETTINGS, type Room } from '@/lib/server/career-mp/room';
import { currentRoom } from '@/lib/server/career-mp/roomOps';
import { handleAction, handleCreate, handleGet, handleJoin, handleList } from '@/lib/server/career-mp/handlers';
import { clipEndsAt } from '@/lib/server/rooms/playback';
import { advanceExpired as advanceRoom } from '@/lib/server/rooms/timers';
import { hashToken, newSeatId } from '@/lib/server/rooms/identity';
import { ActionError } from '@/lib/server/rooms/errors';
import { createRoomStore, redisCredentials } from '@/lib/server/rooms/store';
import type { RoomAction, RoomView } from '@/lib/types/careerMp';
import { roundParticipants, canRemove, favorsLeft, partyRatings } from '@/lib/utils/careerElections';
import { careerPoints, crownedLeader, overlordGoal, rankBySeeding } from '@/lib/utils/careerPoints';
import { lawVoter, isLawYear, isConstitutionCard, constitutionFailures, openLawBallot } from '@/lib/utils/careerLaws';
import { creditLimit, creditRoom, loanOf } from '@/lib/utils/careerCredit';
import { glizzyMarketOpen } from '@/lib/utils/careerGlizzflationBets';
import { generateLeague, isLeagueRoster } from '@/lib/utils/leagueRoster';
import { MESSAGE_REF_KINDS } from '@/lib/utils/message';
import { randomSeed } from '@/lib/utils/seededRandom';
import { CUP_BRACKET_SIZE, cupStandings } from '@/lib/utils/tournamentSim';

const advanceExpired = (room: Room, at: number): Room => advanceRoom(room, at, step);

const COACHES = Number(process.argv[2] ?? 8);
const YEARS = Number(process.argv[3] ?? 20);

if (!Number.isInteger(COACHES) || COACHES < MIN_COACHES || COACHES > MAX_COACHES) {
  console.error(`coaches must be an integer from ${MIN_COACHES} to ${MAX_COACHES}, got ${process.argv[2]}`);
  process.exit(2);
}
const TABLE = CUP_BRACKET_SIZE;

let failures = 0;
function assert(cond: unknown, message: string) {
  if (!cond) {
    failures += 1;
    if (failures < 40) console.error('ASSERT FAILED:', message);
  }
}

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

const stats = {
  constitutionPassed: 0,
  constitutionFailed: 0,
  constitutionCrowned: 0,
  windows: 0,
  clips: 0,
  clipSkips: 0,
  roundSkips: 0,
  cupSkips: 0,
  bets: 0,
  favors: 0,
  campaignOffers: 0,
  campaignDeclines: 0,
  withdrawals: 0,
  plots: 0,
  finishes: 0,
  reopens: 0,
  refused: 0,
  coalitionByVotes: 0,
  coalitionByClock: 0,
  lawsByVotes: 0,
  lawsByClock: 0,
  lawsAutoPick: 0,
  lawsNoHuman: 0,
  lawsPassed: 0,
  maxLawsInForce: 0,
  glizzyBets: 0,
  loans: 0,
  repayments: 0,
  clockedPhases: 0,
  seedEscapes: 0,
  emptyPapers: 0,
};

let now = Date.now();

// Coaches join by name only, then each picks a character in the lobby
function joinedRoom(
  count = COACHES,
  settings: Partial<Room['settings']> = {},
): Room {
  const coaches: Room['coaches'] = {};
  for (let i = 0; i < count; i++) {
    const id = newSeatId();
    coaches[id] = {
      id,
      name: `Coach ${i + 1}`,
      color: COACH_COLOR_ORDER[i],
      slug: null,
      tokenHash: hashToken(`token-${i}`),
      joinedAt: now,
      lastSeenAt: now,
      ready: true,
    };
  }
  const hostCoachId = Object.keys(coaches)[0];
  return {
    code: 'SMOKE1',
    version: 1,
    phaseVersion: 1,
    createdAt: now,
    updatedAt: now,
    hostCoachId,
    status: 'lobby',
    settings: { ...DEFAULT_SETTINGS, windowSeconds: null, matchBetSeconds: 30, ...settings },
    roster: generateLeague(randomSeed()),
    coaches,
    league: null,
    phase: { kind: 'window', deadline: null },
    log: [],
    report: null,
  };
}

// The slugs the lobby offers, read off the view every coach gets
function offered(room: Room): string[] {
  return viewFor(room, room.hostCoachId, now).roster.map((e) => e.slug);
}

function lobbyRoom(
  count = COACHES,
  pickedSlugs?: string[],
  settings: Partial<Room['settings']> = {},
): Room {
  let room = joinedRoom(count, settings);
  const slugs = pickedSlugs ?? offered(room).sort(() => Math.random() - 0.5);
  Object.keys(room.coaches).forEach((id, i) => {
    room = applyAction(room, id, { type: 'pickCharacter', slug: slugs[i] }, now).room;
    room = applyAction(room, id, { type: 'ready', ready: true }, now).room;
  });
  return room;
}

function touch(room: Room): Room {
  // Every coach polls, so everybody counts as connected
  return {
    ...room,
    coaches: Object.fromEntries(
      Object.entries(room.coaches).map(([id, c]) => [id, { ...c, lastSeenAt: now }]),
    ),
  };
}

// The room speaks no language. Everything it stores or sends is walked as
// JSON and every string in it must be machine text: ids, slugs, keys and
// codes, which never hold a space or a letter outside ASCII, and never equal
// a capitalized word from either locale file (a sponsor, a round, a season).
// Coalition keys join parties with + and a bill's lines read law=amount;law=amount.
// The only free text allowed is a name a coach typed or a character's name. Every message (a receipt title, a story) must also name a
// template that exists in both languages and fill each of its placeholders,
// so a renamed locale key or a parameter that went missing fails here too
const MACHINE_TEXT = /^[A-Za-z0-9_.:;|,#/+=-]*$/;
const LOCALE_TREES: [string, unknown][] = [['en', en], ['sr', sr]];
const LOCALE_TEXT = new Set<string>();
function collectLocaleText(node: unknown) {
  if (typeof node === 'string') {
    if (/^[A-Z]/.test(node)) LOCALE_TEXT.add(node);
  } else if (node && typeof node === 'object') Object.values(node).forEach(collectLocaleText);
}
LOCALE_TREES.forEach(([, tree]) => collectLocaleText(tree));

const PLURAL_FORM_KEYS = ['few', 'one', 'other'];

// A template is a sentence or a counted group of three; a group is returned
// as its forms joined, so every placeholder in any form is checked
function templateAt(tree: unknown, key: string): { text: string; counted: boolean } | null {
  let node = tree;
  for (const part of key.split('.')) {
    if (!node || typeof node !== 'object') return null;
    node = (node as Record<string, unknown>)[part];
  }
  if (typeof node === 'string') return { text: node, counted: false };
  if (!node || typeof node !== 'object') return null;
  const forms = Object.values(node);
  const counted =
    Object.keys(node).sort().join() === PLURAL_FORM_KEYS.join() && forms.every((form) => typeof form === 'string');
  return counted ? { text: forms.join(' '), counted } : null;
}

function assertMessage(key: string, params: Record<string, unknown>, refs: unknown, supplied: string[], path: string) {
  LOCALE_TREES.forEach(([locale, tree]) => {
    const template = templateAt(tree, key);
    assert(template !== null, `${path}: no ${locale} template at ${key}`);
    [...(template?.text ?? '').matchAll(/\{(\w+)\}/g)].forEach(([, name]) =>
      assert(name in params || supplied.includes(name), `${path}: ${key} leaves {${name}} unfilled in ${locale}`),
    );
    if (template?.counted)
      assert(
        Object.values((refs ?? {}) as Record<string, string>).filter((kind) => kind === 'count').length === 1,
        `${path}: ${key} is a counted template and needs exactly one count ref`,
      );
  });
  Object.entries((refs ?? {}) as Record<string, string>).forEach(([name, kind]) => {
    assert((MESSAGE_REF_KINDS as readonly string[]).includes(kind), `${path}: unknown ref kind ${kind}`);
    assert(name in params, `${path}: ref ${name} points at no parameter`);
    if (kind === 'count' || kind === 'ordinal')
      assert(typeof params[name] === 'number', `${path}: ${kind} ref ${name} is not a number`);
  });
}

function assertNoRenderedText(value: unknown, path: string, coachNames: Set<string>) {
  if (typeof value === 'string') {
    if (coachNames.has(value)) return;
    assert(MACHINE_TEXT.test(value), `rendered text at ${path}: ${value}`);
    assert(!LOCALE_TEXT.has(value), `locale text at ${path}: ${value}`);
    return;
  }
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => assertNoRenderedText(item, `${path}[${i}]`, coachNames));
    return;
  }
  const record = value as Record<string, unknown>;
  const params = record.params && typeof record.params === 'object' ? (record.params as Record<string, unknown>) : null;
  if (params && typeof record.key === 'string') assertMessage(record.key, params, record.refs, [], path);
  // A story: the paper supplies the hero's name from the first slug
  if (params && typeof record.templateKey === 'string' && Array.isArray(record.slugs))
    assertMessage(`career.news.${record.templateKey}`, params, record.refs, ['name'], path);
  Object.entries(record).forEach(([name, item]) => assertNoRenderedText(item, `${path}.${name}`, coachNames));
}

function assertRoomSpeaksNoLanguage(room: Room, label: string) {
  const coachNames = new Set([
    ...Object.values(room.coaches).map((c) => c.name),
    ...room.roster.map((e) => e.name),
    ...(room.league?.roster ?? []).map((e) => e.name),
  ]);
  const wire: unknown = JSON.parse(JSON.stringify({ room, view: viewFor(room, room.hostCoachId, now) }));
  assertNoRenderedText(wire, label, coachNames);
}

ROOM_ERROR_CODES.forEach((code) =>
  LOCALE_TREES.forEach(([locale, tree]) =>
    assert(templateAt(tree, `careerMp.errors.${code}`) !== null, `error code ${code} has no ${locale} sentence`),
  ),
);

function act(room: Room, coachId: string, action: RoomAction): Room {
  try {
    const result = applyAction(touch(room), coachId, action, now);
    if (result.receipt) assertNoRenderedText(result.receipt, `receipt of ${action.type}`, new Set());
    return advanceExpired(result.room, now);
  } catch (e) {
    if (e instanceof ActionError) {
      stats.refused += 1;
      return room;
    }
    throw e;
  }
}

function refused(fn: () => unknown, code: RoomErrorCode): boolean {
  try {
    fn();
    return false;
  } catch (e) {
    return e instanceof ActionError && e.code === code;
  }
}

function randomWindowAction(room: Room, coachId: string): RoomAction {
  const career = careerFor(room.league!, coachId);
  const unread = career.mail.filter((m) => !m.read);
  const roll = Math.random();
  if (unread.length > 0 && roll < 0.35) {
    const item = pick(unread);
    if (item.kind === 'sponsor-offer' && item.sponsorId && Math.random() < 0.7)
      return { type: 'acceptSponsor', mailId: item.id, sponsorId: item.sponsorId };
    if (item.kind === 'donation' && Math.random() < 0.6)
      return {
        type: 'donate',
        mailId: item.id,
        amount: Math.random() < 0.5 ? Math.max(20, career.balance) : pick([20, 50, 100]),
      };
    if (item.kind === 'campaign' && Math.random() < 0.8)
      return {
        type: 'donate',
        mailId: item.id,
        amount: pick(OUTSIDER_DONATION_STEPS),
        sponsorId: pick(PARTY_SEAT_ORDER),
      };
    return { type: 'readMail', mailId: item.id };
  }
  if (career.rivalChoice?.length && roll < 0.5)
    return { type: 'chooseRival', slug: pick(career.rivalChoice).slug };
  const kinds: RoomAction[] = [
    { type: 'train', trainingId: pick(TRAINING_ORDER) },
    { type: 'rest', fasting: Math.random() < 0.3 },
    { type: 'media', kind: Math.random() < 0.3 ? 'scandal' : 'interview' },
    { type: 'island' },
    { type: 'guard', steps: Math.floor(Math.random() * 5) - 2 },
    { type: 'invest', investmentId: pick(INVESTMENT_ORDER) },
    { type: 'glizzyBet', call: pick(GLIZZY_CALLS), stake: pick([...GLIZZY_BET_STAKES, 7]) },
    { type: 'cancelGlizzyBet' },
    { type: 'borrow', amount: pick([...LOAN_STEPS, 0, -25, 999999]) },
    { type: 'repay', amount: pick([...LOAN_STEPS, 0, 999999]) },
    {
      type: 'sabotage',
      targetSlug: pick(Object.keys(career.characters).filter((s) => s !== career.playerSlug)),
      tier: pick([1, 2, 3] as const),
      boostSteps: Math.floor(Math.random() * 3),
    },
  ];
  return pick(kinds);
}

// The Yellow Party tax letter can push a wallet below zero at window open,
// exactly as in single player; nothing a coach does may take it lower
const floorByCoach: Record<string, number> = {};

function checkInvariants(room: Room, label: string) {
  const league = room.league!;
  const slugs = Object.values(league.coachStates).map((cs) => cs.slug);
  assert(new Set(slugs).size === slugs.length, `${label}: unique slugs`);
  assert(
    Object.keys(league.characters).length === TABLE,
    `${label}: league of ${TABLE}, got ${Object.keys(league.characters).length}`,
  );
  Object.entries(league.coachStates).forEach(([id, cs]) => {
    // A Yellow Party coach may spend into his credit line
    const floor = Math.min(0, floorByCoach[id] ?? 0) - creditLimit(league.characters[cs.slug], league.parliament);
    assert(cs.balance >= floor, `${label}: coach ${id} balance ${cs.balance}`);
    assert(cs.slotsUsed <= OFFSEASON_SLOTS, `${label}: coach ${id} slots ${cs.slotsUsed}`);
    assert(league.characters[cs.slug], `${label}: character exists`);
  });
}

// The window actions with a wallet rule of their own: what moved, and that a
// refusal moved nothing
function actChecked(room: Room, id: string, action: RoomAction): Room {
  const league = room.league!;
  const cs = league.coachStates[id];
  const ch = league.characters[cs.slug];
  const next = act(room, id, action);
  const ncs = next.league!.coachStates[id];
  const nch = next.league!.characters[cs.slug];
  if (action.type === 'borrow') {
    const room0 = creditRoom(ch, league.parliament);
    const ok = Number.isInteger(action.amount) && action.amount > 0 && action.amount <= room0;
    if (ok) {
      stats.loans += 1;
      assert(ncs.balance === cs.balance + action.amount, `borrow fills the wallet: ${cs.balance} + ${action.amount} = ${ncs.balance}`);
      assert(loanOf(nch) === loanOf(ch) + action.amount, 'borrow books the loan');
      assert(loanOf(nch) <= creditLimit(nch, league.parliament), 'a loan stays inside the line at the counter');
    } else {
      assert(ncs.balance === cs.balance && loanOf(nch) === loanOf(ch), `a refused loan moves nothing: asked ${action.amount}, room ${room0}`);
    }
  } else if (action.type === 'repay') {
    const ok = Number.isInteger(action.amount) && action.amount > 0 && action.amount <= loanOf(ch) && action.amount <= cs.balance;
    if (ok) {
      stats.repayments += 1;
      assert(ncs.balance === cs.balance - action.amount, 'repay comes out of the wallet');
      assert(loanOf(nch) === loanOf(ch) - action.amount, 'repay clears the loan');
    } else {
      assert(ncs.balance === cs.balance && loanOf(nch) === loanOf(ch), `a refused repayment moves nothing: asked ${action.amount}, owed ${loanOf(ch)}`);
    }
  } else if (action.type === 'glizzyBet') {
    const refund = cs.glizzyBet?.stake ?? 0;
    if (ncs.glizzyBet !== cs.glizzyBet) {
      stats.glizzyBets += 1;
      assert(glizzyMarketOpen(league), 'the bookie takes calls only once a government sits');
      assert(ncs.glizzyBet?.call === action.call && ncs.glizzyBet.stake === action.stake, 'the ticket is the call placed');
      assert(GLIZZY_BET_STAKES.includes(action.stake), `a glizi stake off the board: ${action.stake}`);
      assert(ncs.balance === cs.balance + refund - action.stake, 'a new ticket refunds the old stake and takes the new one');
    } else {
      assert(ncs.balance === cs.balance, 'a refused glizi call moves nothing');
    }
  } else if (action.type === 'cancelGlizzyBet') {
    assert(!ncs.glizzyBet, 'a cancelled ticket is gone');
    assert(ncs.balance === cs.balance + (cs.glizzyBet?.stake ?? 0), 'a cancelled ticket refunds its stake');
  }
  return next;
}

function runWindow(room: Room): Room {
  const ids = Object.keys(room.coaches);
  ids.forEach((id) => {
    floorByCoach[id] = room.league!.coachStates[id].balance;
  });
  for (let round = 0; round < 10; round++) {
    for (const id of ids) {
      if (Math.random() < 0.7) {
        const before = room.league!.pendingSabotages.length;
        const offersBefore = room.league!.coachStates[id].mail.filter((m) => m.kind === 'sponsor-offer').length;
        const declinesBefore = room.league!.coachStates[id].mail.filter((m) => m.templateKey === 'campaign-declined').length;
        const action = randomWindowAction(room, id);
        if (action.type === 'donate' && action.sponsorId) {
          // Test injection: a wallet that can afford the campaign envelope
          const cs = room.league!.coachStates[id];
          room = {
            ...room,
            league: {
              ...room.league!,
              coachStates: { ...room.league!.coachStates, [id]: { ...cs, balance: Math.max(cs.balance, 1000) } },
            },
          };
          floorByCoach[id] = Math.min(floorByCoach[id] ?? 0, 0);
        }
        room = actChecked(room, id, action);
        if (action.type === 'donate' && action.sponsorId) {
          const cs = room.league!.coachStates[id];
          if (cs.mail.filter((m) => m.kind === 'sponsor-offer').length > offersBefore) stats.campaignOffers += 1;
          if (cs.mail.filter((m) => m.templateKey === 'campaign-declined').length > declinesBefore) stats.campaignDeclines += 1;
        }
        if (room.league!.pendingSabotages.length > before) stats.plots += 1;
      }
    }
    checkInvariants(room, `window y${room.league!.year}s${room.league!.season}`);
  }
  // One coach flips Done off and acts again before the window closes
  if (ids.length > 1) {
    const undoer = pick(ids);
    room = act(room, undoer, { type: 'setDone', done: true });
    room = act(room, undoer, { type: 'setDone', done: false });
    room = act(room, undoer, { type: 'rest', fasting: false });
  }
  for (const id of ids) room = act(room, id, { type: 'setDone', done: true });
  assert(room.phase.kind === 'paper', `window closed to paper, got ${room.phase.kind}`);
  stats.windows += 1;
  return room;
}

// A phase this smoke does not drive runs out its clock with nobody acting;
// whatever the room moved meanwhile is every wallet's new floor
function runOutClock(input: Room): Room {
  let room = input;
  for (let i = 0; i < 8 && room.status === 'playing' && room.phase.kind !== 'window'; i++) {
    const phase = room.phase;
    const deadline = 'deadline' in phase ? phase.deadline : null;
    assert(deadline !== null, `phase ${phase.kind} the smoke does not drive has a clock`);
    if (deadline === null) break;
    now = deadline + 1;
    room = advanceExpired(touch(room), now);
    stats.clockedPhases += 1;
    Object.entries(room.league!.coachStates).forEach(([id, cs]) => {
      floorByCoach[id] = Math.min(floorByCoach[id] ?? 0, cs.balance);
    });
    if (room.phase.kind === phase.kind) break;
  }
  return room;
}

// One-party rule at reducer level, on a copy of the room at its first law
// year moved on to the first year the card may come: the Red Party holds two
// thirds of the seats and every human is on its list. Short of two thirds,
// or a year too early, the card stays off the table. With every voice for it
// the vote ends the campaign with all of the Red Party's coaches as winners, the
// reopen goes back to play and the card never comes back; with the AI
// leaning against and the humans against it falls short of four fifths and
// costs the Red Party the rating
let constitutionChecked = false;
function constitutionChecks(base: Room) {
  constitutionChecked = true;
  const l = base.league!;
  const party = 'red' as const;
  const characters = { ...l.characters };
  Object.keys(characters).forEach((slug, i) => {
    if (l.humanSlugs.includes(slug) || i % 4 === 0) characters[slug] = { ...characters[slug], sponsor: { sponsorId: party } };
  });
  const year = Math.max(l.year, CONSTITUTION_FROM_YEAR);
  const parliament = {
    ...l.parliament!,
    government: [party],
    seats: { red: 67, yellow: 13, blue: 10, green: 10 },
    laws: (['holiday', 'lottery'] as const).map((id) => ({ id, year: 1, season: 0, government: [party] })),
    lawVotes: (l.parliament!.lawVotes ?? []).filter((v) => v.year !== year),
    lawBallot: null,
    constitution: null,
  };
  let seeded: Room = { ...base, league: { ...l, year, characters, parliament, overlordSlug: null } };
  const shared = sharedCareer(seeded.league!);
  const offered = (state: typeof shared) => openLawBallot(state, () => 0.5)?.cards.some(isConstitutionCard) ?? false;
  assert(!offered({ ...shared, parliament: { ...parliament, seats: { red: 66, yellow: 14, blue: 10, green: 10 } } }), 'no constitution card short of two thirds of the seats');
  assert(!offered({ ...shared, year: CONSTITUTION_FROM_YEAR - 2 }), 'no constitution card before its year');
  assert(offered(shared), 'constitution card offered to a party with two thirds of the seats');
  const crown = crownedLeader(characters, new Set(l.humanSlugs), overlordGoal(l));
  if (crown) {
    // A crown at this season-end ends the campaign before the chamber sits,
    // so the constitution runs on a copy with the crown out of reach
    let room = seeded;
    for (const id of Object.keys(room.coaches)) room = act(room, id, { type: 'setDone', done: true });
    assert(
      room.phase.kind === 'finished' && room.league!.overlordSlug === crown && !room.league!.parliament!.lawBallot,
      `a crown beats the constitution vote, got ${room.phase.kind}`,
    );
    stats.constitutionCrowned += 1;
    const top = OVERLORD_POINT_OPTIONS[OVERLORD_POINT_OPTIONS.length - 1];
    if (crownedLeader(characters, new Set(l.humanSlugs), top)) return;
    seeded = { ...seeded, league: { ...seeded.league!, overlordPoints: top } };
  }
  const coachOf = (room: Room, slug: string) => Object.entries(room.league!.coachStates).find(([, cs]) => cs.slug === slug)?.[0];
  for (const outcome of ['passed', 'failed'] as const) {
    const realRandom = Math.random;
    Math.random = outcome === 'passed' ? () => 0.999 : () => 0.001;
    try {
      let room = seeded;
      for (const id of Object.keys(room.coaches)) room = act(room, id, { type: 'setDone', done: true });
      let ballot = room.league!.parliament!.lawBallot;
      if (room.phase.kind === 'laws' && room.phase.stage === 'pick' && ballot?.picker) {
        const index = ballot.cards.findIndex(isConstitutionCard);
        assert(index >= 0, 'constitution card offered to a party with two thirds of the seats');
        room = act(room, coachOf(room, ballot.picker)!, { type: 'pickLaw', index });
      }
      ballot = room.league!.parliament!.lawBallot;
      assert(room.phase.kind === 'laws', `constitution vote waits on the humans, got ${room.phase.kind}`);
      assert(isConstitutionCard(ballot && ballot.pick !== null ? ballot.cards[ballot.pick] : null), 'constitution card on the table');
      const voters = (ballot?.ballots ?? []).filter((b) => b.human).map((b) => b.slug);
      voters.forEach((slug) => {
        room = act(room, coachOf(room, slug)!, { type: 'voteLaw', vote: outcome === 'failed' ? 'no' : 'yes' });
      });
      const after = room.league!;
      if (outcome === 'passed') {
        assert(room.phase.kind === 'finished', `constitution ends the campaign, got ${room.phase.kind}`);
        assert(room.report?.constitution?.party === party && room.report.overlordSlug === '', 'report carries the constitution');
        const winners = room.report?.constitution?.winners ?? [];
        assert(after.humanSlugs.every((slug) => winners.includes(slug)), 'every human on the list is a winner');
        assert(room.log.some((e) => e.kind === 'constitution'), 'constitution logged');
        for (const id of Object.keys(room.coaches)) room = act(room, id, { type: 'voteReopen', on: true });
        assert(room.phase.kind === 'window' && room.status === 'playing', `reopen after one-party rule, got ${room.phase.kind}`);
        const shared = sharedCareer(room.league!);
        const again = openLawBallot({ ...shared, season: 0, year: shared.year + 1, parliament: { ...shared.parliament!, lawVotes: [] } });
        assert(!again?.cards.some(isConstitutionCard), 'no constitution card after the campaign ended');
        stats.constitutionPassed += 1;
      } else {
        assert(room.phase.kind !== 'finished', `a failed constitution plays on, got ${room.phase.kind}`);
        assert(constitutionFailures(after.parliament, party) === 1, 'failed constitution on the record');
        assert(partyRatings(sharedCareer(after))[party].constitution === CONSTITUTION_FAIL_RATING_PENALTY, 'failed constitution costs the rating');
        assert(!after.parliament?.constitution, 'no constitution recorded on a failed vote');
        stats.constitutionFailed += 1;
      }
    } finally {
      Math.random = realRandom;
    }
  }
}

function runSeason(room: Room): Room {
  const ids = Object.keys(room.coaches);
  const startYear = room.league!.year;
  const startSeason = room.league!.season;
  let guard = 0;
  while (room.status === 'playing' && !(room.phase.kind === 'window' && (room.league!.year !== startYear || room.league!.season !== startSeason))) {
    guard += 1;
    assert(guard < 2000, 'season loop guard');
    if (guard >= 2000) break;
    const phase = room.phase;
    if (phase.kind === 'paper') {
      for (const id of ids) room = act(room, id, { type: 'setDone', done: true });
      const l = room.league!;
      assert(room.phase.kind === 'cup-pre', `paper closed straight to the bracket, got ${room.phase.kind}`);
      const firstRound = (l.cup?.rounds[0] ?? []).flatMap((m) => [m.a, m.b]);
      assert(
        firstRound.length === TABLE &&
          new Set(firstRound).size === TABLE &&
          firstRound.every((slug) => slug && l.characters[slug]),
        'round of 16 seats the whole league',
      );
      assert(
        JSON.stringify(l.cupStartRanks) === JSON.stringify(rankBySeeding(l.characters, new Set(l.humanSlugs))),
        'the bracket is seeded by the table at the paper',
      );
    } else if (phase.kind === 'match-bets') {
      for (const id of ids) {
        const roll = Math.random();
        if (roll < 0.15) room = act(room, id, { type: 'setBetStake', stake: pick(CAREER_BET_STAKES) });
        if (Math.random() < 0.5) {
          const before = room.league!.coachStates[id].balance;
          room = act(room, id, { type: 'bet', side: Math.random() < 0.5 ? 'a' : 'b' });
          if (room.league!.coachStates[id].balance !== before) stats.bets += 1;
          if (Math.random() < 0.2) room = act(room, id, { type: 'removeBet' });
        }
        if (Math.random() < 0.05) room = act(room, id, { type: 'voteSkipRound', on: true });
        if (Math.random() < 0.02) room = act(room, id, { type: 'voteSkipCup', on: true });
        if (room.phase.kind === 'match-bets') room = act(room, id, { type: 'pass' });
      }
      if (room.phase.kind === 'match-bets') {
        // The countdown runs out with one coach never answering
        now = (room.phase.deadline ?? now) + 1;
        room = advanceExpired(touch(room), now);
      }
      assert(room.phase.kind !== 'match-bets', `bets closed, got ${room.phase.kind}`);
    } else if (phase.kind === 'match-clip') {
      stats.clips += 1;
      const wanted = Math.random();
      if (wanted < 0.4) {
        // Majority skips the clip
        const majority = Math.floor(ids.length / 2) + 1;
        for (const id of ids.slice(0, majority)) room = act(room, id, { type: 'voteSkip' });
        if (room.phase.kind === 'match-clip') {
          assert(room.phase.playback.skippedAt !== undefined, 'majority skip landed');
          stats.clipSkips += 1;
        }
      } else if (wanted < 0.5) {
        for (const id of ids) room = act(room, id, { type: 'voteSkipRound', on: true });
        if (room.phase.kind !== 'match-clip') stats.roundSkips += 1;
      } else if (wanted < 0.55 && room.league!.cup) {
        for (const id of ids) room = act(room, id, { type: 'voteSkipCup', on: true });
        if (room.phase.kind === 'season-end') stats.cupSkips += 1;
      }
      if (room.phase.kind === 'match-clip') {
        now = clipEndsAt(room.phase.playback, room.settings.matchLingerSeconds) + 1;
        room = advanceExpired(touch(room), now);
        assert(room.phase.kind !== 'match-clip', `clip ended, got ${room.phase.kind}`);
      }
    } else if (phase.kind === 'cup-pre') {
      // Test injection: a fat campaign chest now and then so the favor path runs
      const parl = room.league!.parliament;
      if (parl && parl.government.length > 0 && Math.random() < 0.15) {
        const donor = pick(ids);
        const slug = room.league!.coachStates[donor].slug;
        const party = room.league!.characters[slug].sponsor?.sponsorId;
        if (party && parl.government.includes(party)) {
          room = {
            ...room,
            league: {
              ...room.league!,
              parliament: { ...parl, lastDonors: { ...parl.lastDonors, [slug]: 1000 } },
            },
          };
        }
      }
      for (const id of ids) {
        const career = careerFor(room.league!, id, 'cup');
        const round = phase.round;
        if (Math.random() < 0.5 && favorsLeft(career, career.playerSlug) > 0 && career.cup) {
          const targets = roundParticipants(career.cup.rounds[round] ?? [], career.cup.removals).filter(
            (p) => canRemove(career, career.playerSlug, p.slug),
          );
          if (targets.length > 0) {
            const t = pick(targets);
            const before = room.league!.cup!.removals.length;
            room = act(room, id, { type: 'favor', targetSlug: t.slug, index: t.index });
            if (room.league!.cup!.removals.length > before) stats.favors += 1;
          }
        }
        if (Math.random() < 0.03) {
          const before = room.league!.coachStates[id].withdrawn;
          room = act(room, id, { type: 'withdraw' });
          if (!before && room.league!.coachStates[id].withdrawn) stats.withdrawals += 1;
        }
      }
      for (const id of ids) room = act(room, id, { type: 'setDone', done: true });
      // A round settled before a match is played, every match withdrawn,
      // goes straight on to the next round's draw
      const settled = room.league!.cup!.rounds[phase.round].every((m) => !m.a || !m.b || m.result);
      assert(
        room.phase.kind !== 'cup-pre' || (settled && room.phase.round === phase.round + 1),
        `cup-pre closed, got ${room.phase.kind}`,
      );
    } else if (phase.kind === 'season-end') {
      const league = room.league!;
      if (!constitutionChecked && league.season === 0 && isLawYear(league.year) && league.parliament && !league.overlordSlug) constitutionChecks(room);
      assert(league.cup && league.cup.rounds.flat().every((m) => !m.a || !m.b || m.result), 'bracket complete at season end');
      assert(league.standingsHistory.length > 0, 'standings recorded');
      if (league.cup) {
        const placed = cupStandings(league.cup.rounds).filter((s) => s.place > 0).length;
        assert(placed === TABLE, `cup placed ${placed} of ${TABLE}`);
      }
      const ranks = league.standingsHistory[league.standingsHistory.length - 1].ranks;
      assert(ranks.length === TABLE, `standings rank ${ranks.length} of ${TABLE}`);
      for (const id of ids) room = act(room, id, { type: 'setDone', done: true });
    } else if (phase.kind === 'coalition') {
      const league = room.league!;
      const ballot = league.lastElection?.result.coalition;
      assert(ballot && ballot.winner === null, 'coalition phase has an open ballot');
      assert(phase.deadline !== null, 'coalition phase has a deadline');
      if (!ballot || phase.deadline === null) break;
      const voters = ids.filter((id) =>
        ballot.ballots.some((b) => b.human && b.slug === league.coachStates[id].slug),
      );
      assert(voters.length > 0, 'a human sits on the leader list');
      const outsider = ids.find((id) => !voters.includes(id));
      if (outsider) {
        const before = stats.refused;
        room = act(room, outsider, { type: 'voteCoalition', key: ballot.options[0] });
        assert(stats.refused === before + 1, 'a coach off the list cannot vote');
      }
      const before = stats.refused;
      room = act(room, voters[0], { type: 'voteCoalition', key: 'nonsense' });
      assert(stats.refused === before + 1, 'an unknown option is refused');
      const byClock = Math.random() < 0.5;
      const voting = byClock ? voters.slice(0, voters.length - 1) : voters;
      for (const id of voting) room = act(room, id, { type: 'voteCoalition', key: pick(ballot.options) });
      if (room.phase.kind === 'coalition') {
        assert(byClock, 'the vote closes once every human is in');
        now = phase.deadline + 1;
        room = advanceExpired(touch(room), now);
        stats.coalitionByClock += 1;
      } else {
        stats.coalitionByVotes += 1;
      }
      assert(room.phase.kind !== 'coalition', `coalition closed, got ${room.phase.kind}`);
      const closed = room.league!.lastElection!.result;
      const winner = closed.coalition?.winner;
      assert(winner, 'the vote has a winner');
      assert(
        closed.government.join('+') === `${closed.coalition?.leader}+${winner}`,
        `government from the vote: ${closed.government.join('+')} vs ${winner}`,
      );
      const last = room.league!.governments[room.league!.governments.length - 1];
      assert(last.government.join('+') === closed.government.join('+'), 'governments log the voted coalition');
      if (byClock) assert(closed.coalition?.ballots.some((b) => b.auto), 'a silent human gets the AI vote');
    } else if (phase.kind === 'laws') {
      const league = room.league!;
      const ballot = league.parliament?.lawBallot;
      assert(ballot && ballot.outcome === null, 'laws phase has an open ballot');
      assert(isLawYear(league.year) && league.season === 0, `laws in a law year after the winter cup, y${league.year}s${league.season}`);
      assert(phase.deadline !== null, 'laws phase has a deadline');
      if (!ballot || phase.deadline === null) break;
      const year = league.year;
      const slugOf = (id: string) => room.league!.coachStates[id].slug;
      if (phase.stage === 'pick') {
        const picker = ids.find((id) => slugOf(id) === ballot.picker);
        assert(picker, 'a human picker in the pick stage');
        const other = ids.find((id) => id !== picker);
        if (other) {
          const before = stats.refused;
          room = act(room, other, { type: 'pickLaw', index: 0 });
          assert(stats.refused === before + 1, 'only the picker picks');
        }
        if (picker) {
          const before = stats.refused;
          room = act(room, picker, { type: 'pickLaw', index: 9 });
          assert(stats.refused === before + 1, 'a card off the ballot is refused');
        }
        if (picker && Math.random() < 0.7) {
          room = act(room, picker, { type: 'pickLaw', index: Math.floor(Math.random() * ballot.cards.length) });
        } else {
          now = phase.deadline + 1;
          room = advanceExpired(touch(room), now);
          stats.lawsAutoPick += 1;
          if (room.phase.kind === 'laws') {
            assert(room.league!.parliament?.lawBallot?.autoPick, 'the clock picks for a silent picker');
          }
        }
        continue;
      }
      const open = ballot;
      const voters = ids.filter((id) => lawVoter(open, slugOf(id)));
      const outsider = ids.find((id) => !voters.includes(id));
      if (outsider) {
        const before = stats.refused;
        room = act(room, outsider, { type: 'voteLaw', vote: 'yes' });
        assert(stats.refused === before + 1, 'a coach off the governing lists cannot vote');
      }
      if (voters.length > 0) {
        const before = stats.refused;
        room = act(room, voters[0], { type: 'voteLaw', vote: 'maybe' as 'yes' });
        assert(stats.refused === before + 1, 'a bad vote is refused');
      }
      const byClock = voters.length === 0 || Math.random() < 0.5;
      const voting = byClock ? voters.slice(0, Math.max(0, voters.length - 1)) : voters;
      for (const id of voting) room = act(room, id, { type: 'voteLaw', vote: Math.random() < 0.6 ? 'yes' : 'no' });
      if (room.phase.kind === 'laws') {
        assert(byClock, 'the law vote closes once every human is in');
        now = (room.phase.deadline ?? now) + 1;
        room = advanceExpired(touch(room), now);
        stats.lawsByClock += 1;
      } else {
        stats.lawsByVotes += 1;
      }
      assert(room.phase.kind !== 'laws', `laws closed, got ${room.phase.kind}`);
      const parl = room.league!.parliament!;
      const closed = parl.lawVotes?.at(-1);
      assert(closed && closed.year === year && closed.outcome !== null, 'the vote is on record');
      assert(!parl.lawBallot, 'no ballot left open');
      if (byClock && voters.length > 0) assert(closed?.ballots.some((b) => b.auto), 'a silent voter gets the AI vote');
      Object.values(room.league!.coachStates).forEach((cs) => {
        assert(cs.mail.some((m) => m.kind === 'law' && m.year === year && m.templateKey === 'law-vote'), 'every coach gets the law letter');
      });
    } else if (phase.kind === 'window' || phase.kind === 'finished') {
      break;
    } else {
      room = runOutClock(room);
    }
    if (room.league && room.phase.kind === 'window') {
      const laws = room.league.parliament?.laws ?? [];
      stats.maxLawsInForce = Math.max(stats.maxLawsInForce, laws.length);
      assert(laws.length <= MAX_LAWS_IN_FORCE, `at most ${MAX_LAWS_IN_FORCE} laws in force, got ${laws.length}`);
      assert(new Set(laws.map((l) => l.id)).size === laws.length, 'no law twice');
    }
    if (room.phase.kind !== 'window') checkInvariants(room, `phase ${room.phase.kind}`);
  }
  return room;
}

// Reducer-level roster and settings checks, run on every smoke regardless of
// the arguments
function startedCharacters(room: Room): string[] {
  return Object.keys(applyAction(room, room.hostCoachId, { type: 'start' }, now).room.league!.characters).sort();
}
{
  for (let coaches = MIN_COACHES; coaches <= MAX_COACHES; coaches++) {
    const lobby = lobbyRoom(coaches);
    const got = startedCharacters(lobby);
    const whole = lobby.roster.map((e) => e.slug).sort();
    assert(lobby.roster.length === TABLE, `a room carries a league of ${TABLE}, got ${lobby.roster.length}`);
    assert(JSON.stringify(got) === JSON.stringify(whole), `${coaches} coaches play the whole roster: ${got.join(',')}`);
    assert(JSON.stringify(got) === JSON.stringify(offered(lobby).sort()), 'the league is what the lobby offered');
  }
  const lobby = lobbyRoom(2);
  const stale = applyAction(
    lobby,
    lobby.hostCoachId,
    { type: 'setSettings', settings: { leagueSize: 20 } as Partial<Room['settings']> },
    now,
  ).room;
  assert(!('leagueSize' in stale.settings), 'a stored league size is dropped with the next setting');
  assert(startedCharacters(stale).length === TABLE, `a stale league size still plays ${TABLE}`);
  for (const points of OVERLORD_POINT_OPTIONS) {
    const set = applyAction(lobby, lobby.hostCoachId, { type: 'setSettings', settings: { overlordPoints: points } }, now).room;
    assert(set.settings.overlordPoints === points, `host sets the ${points} point crown`);
    assert(applyAction(set, set.hostCoachId, { type: 'start' }, now).room.league!.overlordPoints === points, `the league plays to ${points}`);
  }
  const odd = applyAction(lobby, lobby.hostCoachId, { type: 'setSettings', settings: { overlordPoints: 300 as 250 } }, now).room;
  assert(odd.settings.overlordPoints === DEFAULT_SETTINGS.overlordPoints, 'an unknown crown falls back to the default');
  const started = applyAction(lobby, lobby.hostCoachId, { type: 'start' }, now).room;
  Object.values(started.league!.coachStates).forEach((cs) =>
    assert(started.league!.characters[cs.rivalSlug ?? ''], 'first rival is in the league'),
  );
}

// Reducer-level lobby pick checks: join by name, pick, taken, change, start
// gate, refusals after the start
{
  let lobby = joinedRoom(3);
  const [host, second, third] = Object.keys(lobby.coaches);
  const offer = offered(lobby);
  assert(Object.values(lobby.coaches).every((c) => c.slug === null), 'coaches join without a character');
  assert(refused(() => applyAction(lobby, host, { type: 'start' }, now), 'missing-slug'), 'start refused before anyone picked');
  lobby = applyAction(lobby, host, { type: 'pickCharacter', slug: offer[0] }, now).room;
  assert(lobby.coaches[host].slug === offer[0], 'host picks in the lobby');
  assert(
    refused(() => applyAction(lobby, second, { type: 'pickCharacter', slug: offer[0] }, now), 'character-taken'),
    'a taken character is refused',
  );
  assert(refused(() => applyAction(lobby, second, { type: 'pickCharacter', slug: 'nobody' }, now), 'bad-slug'), 'an unknown slug is refused');
  const outsider = generateLeague(randomSeed()).find((e) => !lobby.roster.some((r) => r.slug === e.slug))!.slug;
  assert(
    refused(() => applyAction(lobby, second, { type: 'pickCharacter', slug: outsider }, now), 'bad-slug'),
    'a slug from another league is refused',
  );
  assert(
    refused(() => applyAction(lobby, second, { type: 'pickCharacter', slug: 42 as unknown as string }, now), 'bad-slug'),
    'a non-string slug is refused',
  );
  lobby = applyAction(lobby, second, { type: 'pickCharacter', slug: offer[1] }, now).room;
  assert(refused(() => applyAction(lobby, host, { type: 'start' }, now), 'missing-slug'), 'start refused while one coach has not picked');
  lobby = applyAction(lobby, second, { type: 'ready', ready: true }, now).room;
  lobby = applyAction(lobby, second, { type: 'pickCharacter', slug: offer[2] }, now).room;
  assert(lobby.coaches[second].slug === offer[2], 'a coach changes the pick');
  assert(!lobby.coaches[second].ready, 'changing the pick drops ready');
  lobby = applyAction(lobby, third, { type: 'pickCharacter', slug: offer[1] }, now).room;
  assert(lobby.coaches[third].slug === offer[1], 'a dropped pick frees the character');
  assert(refused(() => applyAction(lobby, third, { type: 'start' }, now), 'not-host'), 'only the host starts');
  assert(refused(() => applyAction(lobby, host, { type: 'start' }, now), 'not-ready'), 'start refused while a coach is not ready');
  lobby = applyAction(lobby, second, { type: 'ready', ready: true }, now).room;
  assert(refused(() => applyAction(lobby, host, { type: 'start' }, now), 'not-ready'), 'start refused while one coach is not ready');
  lobby = applyAction(lobby, third, { type: 'ready', ready: true }, now).room;
  const started = applyAction(lobby, host, { type: 'start' }, now).room;
  assert(started.status === 'playing', 'start once everyone picked and the others are ready');
  assert(
    JSON.stringify([...started.league!.humanSlugs].sort()) === JSON.stringify([offer[0], offer[1], offer[2]].sort()),
    'the league seats the lobby picks',
  );
  assert(started.league!.coachStates[second].slug === offer[2], 'the lens reads the changed pick');
  assert(
    refused(() => applyAction(started, second, { type: 'pickCharacter', slug: offer[3] }, now), 'league-started'),
    'pick after the start is refused',
  );
  const legacy = joinedRoom(2);
  const [a, b] = Object.keys(legacy.coaches);
  const legacyOffer = offered(legacy);
  legacy.coaches[a] = { ...legacy.coaches[a], slug: legacyOffer[4] };
  legacy.coaches[b] = { ...legacy.coaches[b], slug: legacyOffer[5] };
  const legacyStarted = applyAction(legacy, a, { type: 'start' }, now).room;
  assert(legacyStarted.league!.coachStates[b].slug === legacyOffer[5], 'a room saved with a slug from the join still starts');
  const full = lobbyRoom(MAX_COACHES);
  const fullStarted = applyAction(full, full.hostCoachId, { type: 'start' }, now).room;
  assert(
    Object.values(full.coaches).every((c) => fullStarted.league!.characters[c.slug!]),
    'every lobby pick is in the league',
  );
}

// The room's own league in the lobby: new faces keep every pick in place,
// and a coach can write his own man in over his pick or over a free face
{
  let lobby = joinedRoom(3);
  const [host, second, third] = Object.keys(lobby.coaches);
  const last = TABLE - 1;
  const kept = TABLE - 3;
  assert(isLeagueRoster(lobby.roster) && lobby.roster.length === TABLE, `a room carries a league of ${TABLE}`);
  lobby = applyAction(lobby, host, { type: 'pickCharacter', slug: lobby.roster[3].slug }, now).room;
  lobby = applyAction(lobby, second, { type: 'pickCharacter', slug: lobby.roster[kept].slug }, now).room;
  lobby = applyAction(lobby, second, { type: 'ready', ready: true }, now).room;
  const before = lobby.roster;
  const rerolled = applyAction(lobby, third, { type: 'rerollLeague' }, now).room;
  assert(isLeagueRoster(rerolled.roster) && rerolled.roster.length === TABLE, `new faces are still a league of ${TABLE}`);
  assert(rerolled.roster[3] === before[3] && rerolled.roster[kept] === before[kept], 'new faces keep every pick where it stood');
  assert(
    rerolled.roster.filter((e, i) => i !== 3 && i !== kept && e.slug !== before[i].slug).length >= TABLE - 5,
    'new faces replace the free places',
  );
  assert(rerolled.coaches[second].ready, 'new faces leave ready alone');
  assert(
    new Set(rerolled.roster.map((e) => e.epithet)).size === TABLE,
    'new faces never share an epithet with a kept one',
  );
  lobby = rerolled;

  const named = applyAction(lobby, third, { type: 'nameCharacter', name: '  Smoke   Tester ' }, now).room;
  const seat = named.coaches[third].slug!;
  const entry = named.roster.find((e) => e.slug === seat);
  assert(entry?.name === 'Smoke Tester', `a written name is cleaned and seated, got ${entry?.name}`);
  assert(isLeagueRoster(named.roster) && named.roster.length === TABLE, `a written name keeps the league at ${TABLE}`);
  assert(named.roster.findIndex((e) => e.slug === seat) === last, 'a coach without a pick writes over the last free face');
  assert(offered(named).includes(seat), 'the written name is on offer');
  lobby = named;

  const renamed = applyAction(lobby, second, { type: 'nameCharacter', name: 'Smoke Second' }, now).room;
  assert(renamed.roster[kept].name === 'Smoke Second', 'a coach with a pick writes over it');
  assert(renamed.coaches[second].slug === renamed.roster[kept].slug && !renamed.coaches[second].ready, 'the written name seats him and drops ready');
  assert(!renamed.roster.some((e) => e.slug === before[kept].slug), 'the old pick leaves the league');
  lobby = renamed;

  assert(
    refused(() => applyAction(lobby, host, { type: 'nameCharacter', name: 'X' }, now), 'bad-character-name'),
    'a name too short is refused',
  );
  assert(
    refused(() => applyAction(lobby, host, { type: 'nameCharacter', name: 42 as unknown as string }, now), 'bad-character-name'),
    'a name that is not text is refused',
  );
  assert(
    refused(() => applyAction(lobby, host, { type: 'nameCharacter', name: 'smoke tester' }, now), 'character-name-taken'),
    'a name already in the league is refused',
  );
  assert(
    refused(() => applyAction(lobby, host, { type: 'nameCharacter', name: lobby.roster[0].name }, now), 'character-name-taken'),
    'a generated name already in the league is refused',
  );
  const same = applyAction(lobby, third, { type: 'nameCharacter', name: 'Smoke Tester' }, now).room;
  assert(same.coaches[third].slug === seat, 'writing his own name again keeps the seat');

  lobby = applyAction(lobby, second, { type: 'ready', ready: true }, now).room;
  lobby = applyAction(lobby, third, { type: 'ready', ready: true }, now).room;
  const started = applyAction(lobby, host, { type: 'start' }, now).room;
  assert(started.league!.roster.length === TABLE, 'the league keeps its roster');
  assert(
    JSON.stringify(started.league!.roster) === JSON.stringify(viewFor(lobby, host, now).roster),
    'the league is exactly what the lobby offered',
  );
  assert(
    JSON.stringify(viewFor(started, host, now).roster) === JSON.stringify(started.league!.roster),
    'the view names the started league',
  );
  const career = careerFor(started.league!, third);
  assert(career.league.some((e) => e.name === 'Smoke Tester'), 'the coach lens carries the league names');
  assert(
    refused(() => applyAction(started, host, { type: 'rerollLeague' }, now), 'league-started'),
    'new faces after the start are refused',
  );
  assert(
    refused(() => applyAction(started, host, { type: 'nameCharacter', name: 'Too Late' }, now), 'league-started'),
    'a written name after the start is refused',
  );
}

// A room stored with the fixed roster, before leagues were generated, reads
// as gone and never throws
{
  const old = { ...joinedRoom(2) } as Partial<Room>;
  delete old.roster;
  assert(currentRoom(old as Room) === null, 'a room without a roster reads as gone');
  assert(currentRoom({ ...joinedRoom(2), roster: [] }) === null, 'a room with an empty roster reads as gone');
  assert(
    currentRoom({ ...joinedRoom(2), roster: generateLeague(randomSeed(), 20) }) === null,
    'a room drawn for a league of twenty reads as gone',
  );
  assert(currentRoom(lobbyRoom(2)) !== null, 'a room with its league loads');
}

// The HTTP layer over the dev store: create, join, poll and act through the
// handlers, the error codes they answer with, and the create limit. Skipped
// when Redis credentials are set, so the smoke never touches the network
if (!redisCredentials()) {
  const base = 'http://smoke.local/api/career-mp/rooms';
  const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
    new Request(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const get = (path: string, token?: string) =>
    new Request(`${base}${path}`, { headers: token ? { [COACH_TOKEN_HEADER]: token } : {} });
  type Seated = { code: string; coachId: string; token: string; view: RoomView };
  const errorOf = async (res: Response) => ((await res.json()) as { error?: string }).error;

  const created = await handleCreate(post('', { coachName: 'Host' }));
  assert(created.status === 200, `create answers 200, got ${created.status}`);
  const host = (await created.json()) as Seated;
  assert(host.view.status === 'lobby' && host.view.coachId === host.coachId, 'create seats the host in a lobby');
  const joined = await handleJoin(post(`/${host.code}/join`, { coachName: 'Guest' }), host.code.toLowerCase());
  assert(joined.status === 200, `join answers 200, got ${joined.status}`);
  const guest = (await joined.json()) as Seated;
  const twin = await handleJoin(post(`/${host.code}/join`, { coachName: 'Guest' }), host.code);
  assert(twin.status === 409 && (await errorOf(twin)) === 'name-taken', 'a taken name is refused');
  const nowhere = await handleJoin(post('/ZZZZZZ/join', { coachName: 'Lost' }), 'ZZZZZZ');
  assert((await errorOf(nowhere)) === 'not-found', 'a join to no room is not-found');
  const stranger = await handleGet(get(`/${host.code}`, 'nobody'), host.code);
  assert(stranger.status === 401 && (await errorOf(stranger)) === 'unauthorized', 'a poll without a seat token is refused');
  const polled = await handleGet(get(`/${host.code}`, guest.token), host.code);
  const guestView = (await polled.json()) as RoomView;
  assert(guestView.coaches.length === 2 && guestView.coachId === guest.coachId, 'the guest polls a two-seat lobby');
  const actOver = (seat: Seated, action: RoomAction) =>
    handleAction(post(`/${host.code}/action`, { action }, { [COACH_TOKEN_HEADER]: seat.token }), host.code);
  assert(host.view.roster.length === 16 && isLeagueRoster(host.view.roster), 'the lobby view offers the head of the league');
  const firstSlug = host.view.roster[0].slug;
  const picked = await actOver(host, { type: 'pickCharacter', slug: firstSlug });
  const pickedView = ((await picked.json()) as { view: RoomView }).view;
  assert(pickedView.coaches.find((c) => c.id === host.coachId)?.slug === firstSlug, 'an action answers with the fresh view');
  const written = await actOver(guest, { type: 'nameCharacter', name: 'Wire Writer' });
  const writtenView = ((await written.json()) as { view: RoomView }).view;
  const guestSlug = writtenView.coaches.find((c) => c.id === guest.coachId)?.slug;
  assert(
    writtenView.roster.some((e) => e.slug === guestSlug && e.name === 'Wire Writer'),
    'a written name comes back in the view roster',
  );
  const twinName = await actOver(host, { type: 'nameCharacter', name: 'Wire Writer' });
  assert(twinName.status === 409 && (await errorOf(twinName)) === 'character-name-taken', 'a taken written name is refused over the wire');
  const shortName = await actOver(host, { type: 'nameCharacter', name: 'W' });
  assert(shortName.status === 400 && (await errorOf(shortName)) === 'bad-character-name', 'a short written name is refused over the wire');
  const fresh = await actOver(guest, { type: 'rerollLeague' });
  const freshView = ((await fresh.json()) as { view: RoomView }).view;
  assert(
    freshView.roster.some((e) => e.slug === firstSlug) && freshView.roster.some((e) => e.slug === guestSlug),
    'new faces over the wire keep both picks',
  );
  const late = await handleJoin(post(`/${host.code}/join`, { coachName: 'Late', slug: freshView.roster[5].slug }), host.code);
  const lateSeat = (await late.json()) as Seated;
  assert(
    lateSeat.view.coaches.find((c) => c.id === lateSeat.coachId)?.slug === freshView.roster[5].slug,
    'an old client joining with an offered slug is seated on it',
  );
  const lost = await handleJoin(post(`/${host.code}/join`, { coachName: 'Lost Slug', slug: 'nobody' }), host.code);
  const lostSeat = (await lost.json()) as Seated;
  assert(lostSeat.view.coaches.find((c) => c.id === lostSeat.coachId)?.slug === null, 'an old client with a slug off the roster joins without one');
  const notHost = await actOver(guest, { type: 'start' });
  assert((await errorOf(notHost)) === 'not-host', 'only the host starts over the wire');
  const malformed = await handleAction(post(`/${host.code}/action`, { nothing: true }, { [COACH_TOKEN_HEADER]: host.token }), host.code);
  assert(malformed.status === 400 && (await errorOf(malformed)) === 'bad-body', 'a body without an action is refused');
  const board = ((await (await handleList(get(''))).json()) as { rooms: { code: string }[] }).rooms;
  assert(board.some((r) => r.code === host.code), 'the room board lists the new room');

  // A room the dev store kept from the fixed roster: polls and joins read it
  // as gone and the board leaves it out
  const devStore = createRoomStore<Room>({ namespace: CAREER_MP_ROOM_NAMESPACE, memoryKey: '__careerMpRooms' });
  const stale = { ...joinedRoom(2), code: 'OLDRST', updatedAt: Date.now() } as Partial<Room>;
  delete stale.roster;
  await devStore.create(stale as Room);
  const staleToken = 'token-0';
  const stalePoll = await handleGet(get('/OLDRST', staleToken), 'OLDRST');
  assert(stalePoll.status === 404 && (await errorOf(stalePoll)) === 'not-found', `a fixed-roster room polls as not-found, got ${stalePoll.status}`);
  const staleJoin = await handleJoin(post('/OLDRST/join', { coachName: 'Back' }), 'OLDRST');
  assert((await errorOf(staleJoin)) === 'not-found', 'a fixed-roster room cannot be joined');
  const staleAct = await handleAction(post('/OLDRST/action', { action: { type: 'ready', ready: true } }, { [COACH_TOKEN_HEADER]: staleToken }), 'OLDRST');
  assert((await errorOf(staleAct)) === 'not-found', 'a fixed-roster room takes no action');
  const boardAfter = ((await (await handleList(get(''))).json()) as { rooms: { code: string }[] }).rooms;
  assert(!boardAfter.some((r) => r.code === 'OLDRST'), 'the board leaves a fixed-roster room out');

  // One client address gets its hourly allowance and no more, unless the
  // test kit lifts the limit
  const bypass = process.env.CAREER_MP_UNLIMITED;
  delete process.env.CAREER_MP_UNLIMITED;
  const client = { 'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 250) + 1}` };
  for (let i = 0; i < ROOM_CREATE_PER_HOUR; i++) {
    const res = await handleCreate(post('', { coachName: `Limit ${i}` }, client));
    assert(res.status === 200, `create ${i + 1} of ${ROOM_CREATE_PER_HOUR} is allowed, got ${res.status}`);
  }
  const over = await handleCreate(post('', { coachName: 'Over' }, client));
  assert(over.status === 429 && (await errorOf(over)) === 'rate-limited', `create past the allowance is rate-limited, got ${over.status}`);
  process.env.CAREER_MP_UNLIMITED = '1';
  const lifted = await handleCreate(post('', { coachName: 'Lifted' }, client));
  assert(lifted.status === 200, 'the test kit lifts the create limit');
  if (bypass === undefined) delete process.env.CAREER_MP_UNLIMITED;
  else process.env.CAREER_MP_UNLIMITED = bypass;
}

let room = lobbyRoom();
room = applyAction(room, room.hostCoachId, { type: 'start' }, now).room;
assert(room.status === 'playing', 'started');
assert(room.phase.kind === 'window', 'first window open');
{
  const order = rankBySeeding(room.league!.characters, new Set(room.league!.humanSlugs));
  const tail = new Set(order.slice(order.length - 8));
  assert(room.league!.humanSlugs.every((slug) => tail.has(slug)), 'every human opens on the last 8 seeds');
  assert(room.league!.humanSlugs.every((slug) => room.league!.characters[slug]), 'every human is in the league');
}

let seasons = 0;
while (room.league!.year <= YEARS && seasons < YEARS * 4 + 4) {
  room = runWindow(room);
  const league = room.league!;
  if (stats.windows === 1) {
    // Every human opened the campaign on the last seeds; a media-heavy first
    // window can lift any of them past a low-fame veteran, exactly as in
    // single player, but only on points, never on the tie-break
    const seeds = league.cupStartRanks ?? [];
    const humans = new Set(league.humanSlugs);
    const tail = seeds.slice(seeds.length - humans.size);
    const record = (slug: string) => {
      const ch = league.characters[slug];
      return [careerPoints(ch), ch.titles, ch.wins, -ch.losses];
    };
    const ahead = (x: number[], y: number[]) => {
      const i = x.findIndex((v, k) => v !== y[k]);
      return i >= 0 && x[i] > y[i];
    };
    const veterans = tail.filter((slug) => !humans.has(slug));
    league.humanSlugs
      .filter((slug) => !tail.includes(slug))
      .forEach((slug) => {
        stats.seedEscapes += 1;
        const beaten = veterans.find((v) => !ahead(record(slug), record(v)));
        assert(!beaten, `human ${slug} leaves the last seeds without outscoring ${beaten}: ${record(slug)} vs ${beaten && record(beaten)}`);
      });
  }
  assert(league.pendingSabotages.length === 0, 'plots resolved at close');
  // A quiet window can print an empty issue, as in single player; the index
  // story is the one item the paper owes whenever the price moved
  assert(
    league.lastIssue?.year === league.year && league.lastIssue.season === league.season && league.newsQueue.length === 0,
    'paper printed',
  );
  const priceStory = league.lastIssue?.news.some((n) => ['glizi-price-up', 'glizi-price-down'].includes(n.templateKey)) ?? false;
  assert(priceStory === (league.gliziPricePct !== undefined), `the index story prints when the price moves, pct ${league.gliziPricePct}`);
  if (league.lastIssue?.news.length === 0) stats.emptyPapers += 1;
  assertRoomSpeaksNoLanguage(room, `paper ${seasons + 1}`);
  room = runSeason(room);
  seasons += 1;
  if (room.status === 'finished') {
    stats.finishes += 1;
    assert(room.report && room.report.coaches.length === COACHES, 'report built');
    assert(room.phase.kind === 'finished', 'finished phase');
    const ids = Object.keys(room.coaches);
    const majority = Math.floor(ids.length / 2) + 1;
    for (const id of ids.slice(0, majority)) room = act(room, id, { type: 'voteReopen', on: true });
    room = runOutClock(room);
    assert(room.status === 'playing' && room.phase.kind === 'window', 'reopened into a window');
    stats.reopens += 1;
  }
  assert(room.phase.kind === 'window', `season ended into a window, got ${room.phase.kind}`);
  {
    const parl = room.league!.parliament;
    const y = room.league!.year;
    if (room.league!.season === 1 && isLawYear(y) && (parl?.government.length ?? 0) > 0) {
      const votes = (parl?.lawVotes ?? []).filter((v) => v.year === y);
      assert(votes.length <= 1, `one law vote a year, y${y}`);
      if (votes.length === 1) {
        if (votes[0].outcome === 'passed') stats.lawsPassed += 1;
        if (!votes[0].ballots.some((b) => b.human) && !(votes[0].picker && room.league!.humanSlugs.includes(votes[0].picker)))
          stats.lawsNoHuman += 1;
      }
    }
  }
  assertRoomSpeaksNoLanguage(room, `season ${seasons}`);
  now += 1000;
}

const league = room.league!;
console.log(
  JSON.stringify({
    coaches: COACHES,
    years: YEARS,
    table: TABLE,
    seasons,
    failures,
    stats,
    year: league.year,
    season: league.season,
    standings: league.standingsHistory.length,
    balances: Object.values(league.coachStates).map((cs) => cs.balance),
    loans: Object.values(league.coachStates).map((cs) => loanOf(league.characters[cs.slug])),
    places: Object.values(league.coachStates).map((cs) => cs.cupPlaces.filter((p) => p > 0).length),
    overlord: league.overlordSlug ?? null,
    overlordPoints: overlordGoal(league),
    governments: league.governments.length,
    logEntries: room.log.length,
  }),
);
process.exit(failures > 0 ? 1 : 0);

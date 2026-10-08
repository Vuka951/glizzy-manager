import en from '@/data/games/locales/en.json';
import sr from '@/data/games/locales/sr.json';
import { COACH_COLOR_ORDER, MAX_COACHES, MIN_COACHES, ROOM_ERROR_CODES } from '@/lib/constants/careerMp';
import { CAREER_BET_STAKES, OFFSEASON_SLOTS } from '@/data/games/careerEconomy';
import { OUTSIDER_DONATION_STEPS, PARTY_SEAT_ORDER } from '@/data/games/careerElections';
import { INVESTMENT_ORDER } from '@/data/games/careerInvestments';
import { TRAINING_ORDER } from '@/data/games/careerTraining';
import { applyAction } from '@/lib/server/career-mp/reducer';
import { careerFor } from '@/lib/server/career-mp/lens';
import { clipEndsAt } from '@/lib/server/career-mp/playback';
import { advanceExpired } from '@/lib/server/career-mp/timers';
import { viewFor } from '@/lib/server/career-mp/view';
import { ROSTER_SLUGS } from '@/lib/server/career-mp/roster';
import {
  DEFAULT_SETTINGS,
  hashToken,
  newCoachId,
  type Room,
} from '@/lib/server/career-mp/room';
import { ActionError } from '@/lib/server/career-mp/errors';
import type { RoomAction } from '@/lib/types/careerMp';
import { roundParticipants, canRemove, favorsLeft } from '@/lib/utils/careerElections';
import { rankBySeeding } from '@/lib/utils/careerPoints';
import { MESSAGE_REF_KINDS } from '@/lib/utils/message';
import { cupStandings } from '@/lib/utils/tournamentSim';

const COACHES = Number(process.argv[2] ?? 8);
const YEARS = Number(process.argv[3] ?? 20);

if (!Number.isInteger(COACHES) || COACHES < MIN_COACHES || COACHES > MAX_COACHES) {
  console.error(`coaches must be an integer from ${MIN_COACHES} to ${MAX_COACHES}, got ${process.argv[2]}`);
  process.exit(2);
}
const LEAGUE_SIZE = ROSTER_SLUGS.length;

let failures = 0;
function assert(cond: unknown, message: string) {
  if (!cond) {
    failures += 1;
    if (failures < 40) console.error('ASSERT FAILED:', message);
  }
}

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

const stats = {
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
};

let now = Date.now();

// Coaches join by name only, then each picks a character in the lobby
function joinedRoom(
  count = COACHES,
  settings: Partial<Room['settings']> = {},
): Room {
  const coaches: Room['coaches'] = {};
  for (let i = 0; i < count; i++) {
    const id = newCoachId();
    coaches[id] = {
      id,
      name: `Trener ${i + 1}`,
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
    coaches,
    league: null,
    phase: { kind: 'window', deadline: null },
    log: [],
    report: null,
  };
}

function lobbyRoom(
  count = COACHES,
  slugs = [...ROSTER_SLUGS].sort(() => Math.random() - 0.5),
  settings: Partial<Room['settings']> = {},
): Room {
  let room = joinedRoom(count, settings);
  Object.keys(room.coaches).forEach((id, i) => {
    room = applyAction(room, id, { type: 'pickCharacter', slug: slugs[i] }, now).room;
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
// The only free text allowed is a name a coach typed. Every message (a receipt title, a story) must also name a
// template that exists in both languages and fill each of its placeholders,
// so a renamed locale key or a parameter that went missing fails here too
const MACHINE_TEXT = /^[A-Za-z0-9_.:|,#/-]*$/;
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
  const coachNames = new Set(Object.values(room.coaches).map((c) => c.name));
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
    {
      type: 'sabotage',
      targetSlug: pick(Object.keys(career.characters).filter((s) => s !== career.playerSlug)),
      tier: pick([1, 2, 3] as const),
      boostSteps: Math.floor(Math.random() * 3),
    },
  ];
  return pick(kinds);
}

// The Korporacija tax letter can push a wallet below zero at window open,
// exactly as in single player; nothing a coach does may take it lower
const floorByCoach: Record<string, number> = {};

function checkInvariants(room: Room, label: string) {
  const league = room.league!;
  const slugs = Object.values(league.coachStates).map((cs) => cs.slug);
  assert(new Set(slugs).size === slugs.length, `${label}: unique slugs`);
  assert(
    Object.keys(league.characters).length === LEAGUE_SIZE,
    `${label}: league of ${LEAGUE_SIZE}, got ${Object.keys(league.characters).length}`,
  );
  Object.entries(league.coachStates).forEach(([id, cs]) => {
    const floor = Math.min(0, floorByCoach[id] ?? 0);
    assert(cs.balance >= floor, `${label}: coach ${id} balance ${cs.balance}`);
    assert(cs.slotsUsed <= OFFSEASON_SLOTS, `${label}: coach ${id} slots ${cs.slotsUsed}`);
    assert(league.characters[cs.slug], `${label}: character exists`);
  });
}

function runWindow(room: Room): Room {
  const ids = Object.keys(room.coaches);
  ids.forEach((id) => {
    floorByCoach[id] = room.league!.coachStates[id].balance;
  });
  for (let step = 0; step < 10; step++) {
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
        room = act(room, id, action);
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
        firstRound.length === 16 &&
          new Set(firstRound).size === 16 &&
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
      assert(room.phase.kind !== 'cup-pre', `cup-pre closed, got ${room.phase.kind}`);
    } else if (phase.kind === 'season-end') {
      const league = room.league!;
      assert(league.cup && league.cup.rounds.flat().every((m) => !m.a || !m.b || m.result), 'bracket complete at season end');
      assert(league.standingsHistory.length > 0, 'standings recorded');
      if (league.cup) {
        const placed = cupStandings(league.cup.rounds).filter((s) => s.place > 0).length;
        assert(placed === LEAGUE_SIZE, `cup placed ${placed} of ${LEAGUE_SIZE}`);
      }
      const ranks = league.standingsHistory[league.standingsHistory.length - 1].ranks;
      assert(ranks.length === LEAGUE_SIZE, `standings rank ${ranks.length} of ${LEAGUE_SIZE}`);
      for (const id of ids) room = act(room, id, { type: 'setDone', done: true });
    } else {
      break;
    }
    if (room.phase.kind !== 'window') checkInvariants(room, `phase ${room.phase.kind}`);
  }
  return room;
}

// Reducer-level roster checks, run on every smoke regardless of the arguments
function startedCharacters(room: Room): string[] {
  return Object.keys(applyAction(room, room.hostCoachId, { type: 'start' }, now).room.league!.characters).sort();
}
function refused(fn: () => unknown, code: string): boolean {
  try {
    fn();
    return false;
  } catch (e) {
    return e instanceof ActionError && e.message === code;
  }
}
{
  for (let coaches = MIN_COACHES; coaches <= MAX_COACHES; coaches++) {
    const got = startedCharacters(lobbyRoom(coaches));
    assert(
      JSON.stringify(got) === JSON.stringify([...ROSTER_SLUGS].sort()),
      `${coaches} coaches play the whole league: ${got.join(',')}`,
    );
  }
  const lobby = lobbyRoom(2);
  const started = applyAction(lobby, lobby.hostCoachId, { type: 'start' }, now).room;
  assert(Object.keys(started.league!.characters).length === LEAGUE_SIZE, 'the league seats the whole roster');
  Object.values(started.league!.coachStates).forEach((cs) =>
    assert(started.league!.characters[cs.rivalSlug ?? ''], 'first rival is in the league'),
  );
}

// Reducer-level lobby pick checks: join by name, pick, taken, change, start
// gate, refusals after the start
{
  let lobby = joinedRoom(3);
  const [host, second, third] = Object.keys(lobby.coaches);
  assert(Object.values(lobby.coaches).every((c) => c.slug === null), 'coaches join without a character');
  assert(refused(() => applyAction(lobby, host, { type: 'start' }, now), 'missing-slug'), 'start refused before anyone picked');
  lobby = applyAction(lobby, host, { type: 'pickCharacter', slug: ROSTER_SLUGS[0] }, now).room;
  assert(lobby.coaches[host].slug === ROSTER_SLUGS[0], 'host picks in the lobby');
  assert(
    refused(() => applyAction(lobby, second, { type: 'pickCharacter', slug: ROSTER_SLUGS[0] }, now), 'character-taken'),
    'a taken character is refused',
  );
  assert(refused(() => applyAction(lobby, second, { type: 'pickCharacter', slug: 'nobody' }, now), 'bad-slug'), 'an unknown slug is refused');
  assert(
    refused(() => applyAction(lobby, second, { type: 'pickCharacter', slug: 42 as unknown as string }, now), 'bad-slug'),
    'a non-string slug is refused',
  );
  lobby = applyAction(lobby, second, { type: 'pickCharacter', slug: ROSTER_SLUGS[1] }, now).room;
  assert(refused(() => applyAction(lobby, host, { type: 'start' }, now), 'missing-slug'), 'start refused while one coach has not picked');
  lobby = applyAction(lobby, second, { type: 'ready', ready: true }, now).room;
  lobby = applyAction(lobby, second, { type: 'pickCharacter', slug: ROSTER_SLUGS[2] }, now).room;
  assert(lobby.coaches[second].slug === ROSTER_SLUGS[2], 'a coach changes the pick');
  assert(!lobby.coaches[second].ready, 'changing the pick drops ready');
  lobby = applyAction(lobby, third, { type: 'pickCharacter', slug: ROSTER_SLUGS[1] }, now).room;
  assert(lobby.coaches[third].slug === ROSTER_SLUGS[1], 'a dropped pick frees the character');
  assert(refused(() => applyAction(lobby, third, { type: 'start' }, now), 'not-host'), 'only the host starts');
  const started = applyAction(lobby, host, { type: 'start' }, now).room;
  assert(started.status === 'playing', 'start once everyone picked');
  assert(
    JSON.stringify([...started.league!.humanSlugs].sort()) === JSON.stringify([ROSTER_SLUGS[0], ROSTER_SLUGS[1], ROSTER_SLUGS[2]].sort()),
    'the league seats the lobby picks',
  );
  assert(started.league!.coachStates[second].slug === ROSTER_SLUGS[2], 'the lens reads the changed pick');
  assert(
    refused(() => applyAction(started, second, { type: 'pickCharacter', slug: ROSTER_SLUGS[3] }, now), 'league-started'),
    'pick after the start is refused',
  );
  const legacy = joinedRoom(2);
  const [a, b] = Object.keys(legacy.coaches);
  legacy.coaches[a] = { ...legacy.coaches[a], slug: ROSTER_SLUGS[4] };
  legacy.coaches[b] = { ...legacy.coaches[b], slug: ROSTER_SLUGS[5] };
  const legacyStarted = applyAction(legacy, a, { type: 'start' }, now).room;
  assert(legacyStarted.league!.coachStates[b].slug === ROSTER_SLUGS[5], 'a room saved with a slug from the join still starts');
  const full = lobbyRoom(MAX_COACHES);
  const fullStarted = applyAction(full, full.hostCoachId, { type: 'start' }, now).room;
  assert(
    Object.values(full.coaches).every((c) => fullStarted.league!.characters[c.slug!]),
    'every lobby pick is in the league',
  );
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
    // window can lift one past a low-fame veteran, exactly as in single player
    const seeds = league.cupStartRanks ?? [];
    const tail = seeds.slice(seeds.length - league.humanSlugs.length);
    const inTail = league.humanSlugs.filter((slug) => tail.includes(slug)).length;
    assert(inTail >= league.humanSlugs.length - 1, `humans on the last seeds: ${inTail} of ${league.humanSlugs.length}`);
  }
  assert(league.pendingSabotages.length === 0, 'plots resolved at close');
  assert(league.lastIssue && league.lastIssue.news.length > 0, 'paper printed');
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
    assert(room.status === 'playing' && room.phase.kind === 'window', 'reopened into a window');
    stats.reopens += 1;
  }
  assert(room.phase.kind === 'window', `season ended into a window, got ${room.phase.kind}`);
  assertRoomSpeaksNoLanguage(room, `season ${seasons}`);
  now += 1000;
}

const league = room.league!;
console.log(
  JSON.stringify({
    coaches: COACHES,
    years: YEARS,
    seasons,
    failures,
    stats,
    year: league.year,
    season: league.season,
    standings: league.standingsHistory.length,
    balances: Object.values(league.coachStates).map((cs) => cs.balance),
    places: Object.values(league.coachStates).map((cs) => cs.cupPlaces.filter((p) => p > 0).length),
    overlord: league.overlordSlug ?? null,
    governments: league.governments.length,
    logEntries: room.log.length,
  }),
);
process.exit(failures > 0 ? 1 : 0);

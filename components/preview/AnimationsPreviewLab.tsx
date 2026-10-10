'use client';

import { useMemo, useState } from 'react';
import CareerIntroCutscene from '@/components/games/career/CareerIntroCutscene';
import OverlordCelebration from '@/components/games/career/OverlordCelebration';
import FreezeframeGraphic from '@/components/games/career/FreezeframeGraphic';
import MatchEventOverlay from '@/components/games/match/MatchEventOverlay';
import SniffCue from '@/components/games/match/SniffCue';
import SniffScent from '@/components/games/match/SniffScent';
import MatchExitScene from '@/components/games/match/MatchExitScene';
import ActionScenePreview from '@/components/preview/ActionScenePreview';
import SabotageHitPreview from '@/components/preview/SabotageHitPreview';
import QuoteScenePreview from '@/components/preview/QuoteScenePreview';
import FinalReportPreview from '@/components/preview/FinalReportPreview';
import ElectionPreviewLab from '@/components/preview/ElectionPreviewLab';
import LabSection from '@/components/preview/LabSection';
import TriggerButton from '@/components/preview/TriggerButton';
import BroadcastOpenPanel from '@/components/games/career/BroadcastOpenPanel';
import CareerCupPhase from '@/components/games/career/CareerCupPhase';
import CareerMailbox from '@/components/games/career/CareerMailbox';
import CareerTable from '@/components/games/career/CareerTable';
import GlizacijaPanel from '@/components/games/career/GlizacijaPanel';
import GlizacijaPill from '@/components/games/career/GlizacijaPill';
import GovernmentEffectsInfoPanel from '@/components/games/career/GovernmentEffectsInfoPanel';
import ParliamentPanel from '@/components/games/career/ParliamentPanel';
import SeasonPriceInfoPanel from '@/components/games/career/SeasonPriceInfoPanel';
import YearCalendar from '@/components/games/career/YearCalendar';
import { rankBySeeding } from '@/lib/utils/careerPoints';
import { sampleCareer, sampleFinishedCareer } from '@/components/preview/sampleCareer';
import type { SavedCareer } from '@/lib/utils/careerSave';
import CalendarResultPreview from '@/components/preview/CalendarResultPreview';
import MoodActivityPreview from '@/components/preview/MoodActivityPreview';
import MoodPreviewGrid from '@/components/preview/MoodPreviewGrid';
import SponsorFlavorPreview from '@/components/preview/SponsorFlavorPreview';
import NewspaperSpread from '@/components/games/career/NewspaperSpread';
import RivalChoiceDialog from '@/components/games/career/RivalChoiceDialog';
import type { RivalCandidate } from '@/lib/utils/careerSave';
import MatchViewer from '@/components/games/match/MatchViewer';
import { SEASON_COUNT } from '@/data/games/careerSeasons';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import { seasonName } from '@/lib/utils/localeNames';
import { CHARACTER_ROSTER } from '@/data/games/roster';
import { GAMES_UI } from '@/data/games/locale';
import type { NewsItem, SponsorId } from '@/lib/utils/careerSave';
import type {
  CupMatchResult,
  CupTurn,
  MatchEventKind,
  MatchForfeitReason,
} from '@/lib/utils/tournamentSim';

const EXIT_REASONS: { reason: MatchForfeitReason; label: string }[] = [
  { reason: 'meltdown', label: 'Nervous breakdown' },
  { reason: 'police', label: 'Police' },
  { reason: 'overfull-forfeit', label: 'Ate too much' },
  { reason: 'withdrawn', label: 'Withdrew' },
  { reason: 'removed', label: 'Removed (party)' },
];

const EVENT_KINDS: MatchEventKind[] = [
  'police',
  'removed',
  'meltdown',
  'overfull-forfeit',
  'binge-grab',
  'random-pick',
  'tiebreak',
];

const FREEZEFRAME_SCENES = [
  'champion',
  'place-finalist',
  'place-semis',
  'place-quarters',
  'place-early',
  'stress',
  'signing',
  'signing-zidari',
  'signing-ostrvo',
  'signing-korporacija',
  'signing-stranka',
  'caught',
  'blocked',
  'evidence-failed',
  'binge',
  'police',
  'meltdown',
  'fired',
  'stamp-banned',
  'stamp-allowed',
  'stamp-investigation',
  'crying',
  'heartbreak',
  'interview',
  'statement',
  'scandal-flash',
  'poison-glizi',
  'poison-kafana',
  'witch-curse',
  'nutrition-bribed',
  'demons',
  'zeka',
  'rumor',
  'police-tax',
  'police-stash',
  'police-island',
  'police-smuggling',
  'table-up',
  'table-down',
  'fact-record',
  'fact-record-down',
  'no-appetite',
  'fact-ambition',
  'fact-ambition-low',
  'fact-ego',
  'fact-ego-low',
  'fact-fame',
  'fact-fame-low',
  'train-stomach',
  'train-sniffer',
  'train-nutrition',
  'train-fans',
  'train-down-stomach',
  'train-down-sniffer',
  'train-down-nutrition',
  'train-down-fans',
];

// One of every article the paper can print, with its freezeframe scene
const SAMPLE_ARTICLES: {
  templateKey: string;
  freezeframe: string;
  params?: NewsItem['params'];
  refs?: NewsItem['refs'];
}[] = [
  { templateKey: 'cupChampion', freezeframe: 'champion' },
  {
    templateKey: 'cupPlace-finalist',
    freezeframe: 'place-finalist',
    params: { place: 2 },
  },
  {
    templateKey: 'cupPlace-semis',
    freezeframe: 'place-semis',
    params: { place: 3 },
    refs: { place: 'ordinal' },
  },
  {
    templateKey: 'cupPlace-quarters',
    freezeframe: 'place-quarters',
    params: { place: 6 },
    refs: { place: 'ordinal' },
  },
  {
    templateKey: 'cupPlace-early',
    freezeframe: 'place-early',
    params: { place: 11 },
    refs: { place: 'ordinal' },
  },
  {
    templateKey: 'signing',
    freezeframe: 'signing-korporacija',
    params: { sponsor: 'korporacija' },
    refs: { sponsor: 'sponsor' },
  },
  { templateKey: 'police-tax', freezeframe: 'police-tax' },
  { templateKey: 'police-stash', freezeframe: 'police-stash' },
  { templateKey: 'police-island', freezeframe: 'police-island' },
  { templateKey: 'police-smuggling', freezeframe: 'police-smuggling' },
  { templateKey: 'catfish-date', freezeframe: 'heartbreak' },
  { templateKey: 'catfish-zeka', freezeframe: 'zeka' },
  { templateKey: 'catfish-demons', freezeframe: 'demons' },
  { templateKey: 'poison-glizimaker', freezeframe: 'poison-glizi' },
  { templateKey: 'poison-kafana', freezeframe: 'poison-kafana' },
  { templateKey: 'witch-curse', freezeframe: 'witch-curse' },
  { templateKey: 'nutrition-bribed', freezeframe: 'nutrition-bribed' },
  { templateKey: 'fans-rumor', freezeframe: 'rumor' },
  { templateKey: 'media-interview', freezeframe: 'interview' },
  { templateKey: 'media-scandal', freezeframe: 'scandal-flash' },
  { templateKey: 'cup-police', freezeframe: 'police' },
  { templateKey: 'sabotageCaught', freezeframe: 'caught' },
  { templateKey: 'sabotageBlocked', freezeframe: 'blocked' },
  { templateKey: 'korp-vendetta-failed', freezeframe: 'evidence-failed' },
  { templateKey: 'scandal', freezeframe: 'crying' },
  { templateKey: 'cup-meltdown', freezeframe: 'meltdown' },
  { templateKey: 'cup-withdrawn', freezeframe: 'fired' },
  { templateKey: 'cup-removed', freezeframe: 'police' },
  { templateKey: 'removal-zidari', freezeframe: 'removal-zidari' },
  { templateKey: 'removal-ostrvo', freezeframe: 'removal-ostrvo' },
  { templateKey: 'removal-korporacija', freezeframe: 'removal-korporacija' },
  { templateKey: 'removal-stranka', freezeframe: 'removal-stranka' },
  {
    templateKey: 'election-year',
    freezeframe: 'ballot',
    params: { parties: 'ostrvo,stranka,korporacija,zidari' },
    refs: { parties: 'sponsorList' },
  },
  {
    templateKey: 'election-poll',
    freezeframe: 'poll',
    params: { stranka: 31, korporacija: 27, zidari: 24, ostrvo: 18 },
  },
  {
    templateKey: 'election-result',
    freezeframe: 'election-result',
    params: {
      stranka: 33,
      korporacija: 27,
      zidari: 25,
      ostrvo: 15,
      government: 'stranka,zidari',
      parties: 'stranka,zidari',
      seats: 58,
    },
    refs: { parties: 'sponsorCoalition' },
  },
  {
    templateKey: 'glizi-price-up',
    freezeframe: 'price-up',
    params: { pct: 10 },
  },
  {
    templateKey: 'glizi-price-down',
    freezeframe: 'price-down',
    params: { pct: 10 },
  },
  { templateKey: 'stressWarning', freezeframe: 'stress' },
  {
    templateKey: 'tableClimb',
    freezeframe: 'table-up',
    params: { places: 4, place: 3 },
    refs: { places: 'count', place: 'ordinal' },
  },
  {
    templateKey: 'tableFall',
    freezeframe: 'table-down',
    params: { places: 5, place: 14 },
    refs: { places: 'count', place: 'ordinal' },
  },
  { templateKey: 'betting-banned', freezeframe: 'stamp-banned' },
  { templateKey: 'betting-unlocked', freezeframe: 'stamp-allowed' },
  {
    templateKey: 'factRecord',
    freezeframe: 'fact-record',
    params: { wins: 9, losses: 2 },
    refs: { wins: 'count' },
  },
  {
    templateKey: 'factRecordWorst',
    freezeframe: 'fact-record-down',
    params: { wins: 1, losses: 8 },
    refs: { wins: 'count' },
  },
  {
    templateKey: 'factEgoHigh',
    freezeframe: 'fact-ego',
    params: { value: 93 },
  },
  {
    templateKey: 'factEgoLow',
    freezeframe: 'fact-ego-low',
    params: { value: 7 },
  },
  {
    templateKey: 'factFameHigh',
    freezeframe: 'fact-fame',
    params: { value: 88 },
  },
  {
    templateKey: 'factFameLow',
    freezeframe: 'fact-fame-low',
    params: { value: 9 },
  },
  {
    templateKey: 'factAmbitionHigh',
    freezeframe: 'fact-ambition',
    params: { value: 90 },
  },
  {
    templateKey: 'factAmbitionLow',
    freezeframe: 'fact-ambition-low',
    params: { value: 11 },
  },
  {
    templateKey: 'factAppetiteLow',
    freezeframe: 'no-appetite',
    params: { value: 12 },
  },
  {
    templateKey: 'factStomachBest',
    freezeframe: 'train-stomach',
    params: { value: 3 },
  },
];

type ViewerScenario = {
  id: string;
  label: string;
  result: CupMatchResult;
};

function turn(
  matchRound: number,
  seeker: 'a' | 'b',
  picked: CupTurn['picked'],
  hidden: CupTurn['hidden'],
): CupTurn {
  return { matchRound, seeker, picked, hidden, hit: picked === hidden };
}

function forfeitResult(
  reason: MatchForfeitReason,
  removedBy?: SponsorId,
): CupMatchResult {
  return {
    ...(removedBy ? { removedBy } : {}),
    turns: [turn(1, 'a', 'hat', 'sock'), turn(1, 'b', 'box', 'box')],
    livesA: 3,
    livesB: 2,
    winner: 'a',
    reason,
    events:
      reason === 'withdrawn' || reason === 'removed'
        ? []
        : [{ afterTurn: 1, side: 'b', kind: reason }],
    livesCapA: 3,
    livesCapB: 3,
  };
}

const VIEWER_SCENARIOS: ViewerScenario[] = [
  {
    id: 'normal',
    label: 'Regular match',
    result: {
      turns: [
        turn(1, 'a', 'hat', 'sock'),
        turn(1, 'b', 'box', 'box'),
        turn(2, 'a', 'sock', 'sock'),
        turn(2, 'b', 'hat', 'hat'),
        turn(3, 'a', 'box', 'hat'),
        turn(3, 'b', 'sock', 'sock'),
      ],
      livesA: 2,
      livesB: 0,
      winner: 'a',
      reason: null,
      livesCapA: 3,
      livesCapB: 3,
    },
  },
  {
    id: 'sniff',
    label: 'Sniffing on both sides',
    result: {
      // Three dodges: the top seat twice, the bottom seat once, each one a
      // turn where the nose caught the spot and the hand went elsewhere
      turns: [
        turn(1, 'a', 'hat', 'sock'),
        turn(1, 'b', 'box', 'hat'),
        turn(2, 'a', 'box', 'sock'),
        turn(2, 'b', 'sock', 'box'),
        turn(3, 'a', 'sock', 'sock'),
        turn(3, 'b', 'hat', 'hat'),
      ],
      events: [
        { afterTurn: 0, side: 'a', kind: 'sniff-dodge' },
        { afterTurn: 1, side: 'b', kind: 'sniff-dodge' },
        { afterTurn: 2, side: 'a', kind: 'sniff-dodge' },
        { afterTurn: 3, side: 'b', kind: 'sniff-dodge' },
      ],
      livesA: 2,
      livesB: 2,
      winner: 'a',
      reason: null,
      livesCapA: 3,
      livesCapB: 3,
    },
  },
  {
    id: 'tiebreak',
    label: 'Overtime',
    // Level at the seek cap, so the sixth round is sudden death
    result: {
      turns: [
        turn(1, 'a', 'hat', 'sock'),
        turn(1, 'b', 'box', 'hat'),
        turn(2, 'a', 'sock', 'sock'),
        turn(2, 'b', 'hat', 'hat'),
        turn(3, 'a', 'box', 'hat'),
        turn(3, 'b', 'sock', 'box'),
        turn(4, 'a', 'hat', 'box'),
        turn(4, 'b', 'box', 'sock'),
        turn(5, 'a', 'sock', 'hat'),
        turn(5, 'b', 'hat', 'sock'),
        { ...turn(6, 'a', 'box', 'sock'), secondHidden: 'hat' },
        { ...turn(6, 'b', 'sock', 'sock'), secondHidden: 'box' },
      ],
      livesA: 2,
      livesB: 2,
      winner: 'a',
      reason: null,
      livesCapA: 3,
      livesCapB: 3,
    },
  },
  { id: 'meltdown', label: 'Nervous breakdown', result: forfeitResult('meltdown') },
  { id: 'police', label: 'Police', result: forfeitResult('police') },
  {
    id: 'overfull-forfeit',
    label: 'Ate too much',
    result: forfeitResult('overfull-forfeit'),
  },
  { id: 'withdrawn', label: 'Withdrew', result: forfeitResult('withdrawn') },
  {
    id: 'removed',
    label: 'Removed (party)',
    result: forfeitResult('removed', 'stranka'),
  },
];

// Four shapes of form: a losing run, a winning run, and two mixed bags
const SAMPLE_RUNS: ('w' | 'l')[][] = [
  ['w', 'w', 'l', 'l', 'l'],
  ['l', 'w', 'w', 'w', 'w'],
  ['w', 'l', 'w', 'l', 'w'],
  ['l', 'l', 'w', 'w', 'l'],
];

export default function AnimationsPreviewLab() {
  const characters = CHARACTER_ROSTER;
  const characterBySlug = useMemo(
    () => new Map(characters.map((c) => [c.slug, c])),
    [characters],
  );
  // The Egg Man stands in for every single-character preview
  const charA = characters.find((c) => c.slug === 'cone') ?? characters[0];
  const charB = characters.find((c) => c.slug !== charA.slug) ?? charA;
  const pick = (i: number) => characters[i % characters.length];
  const rivalShortlist: RivalCandidate[] = [
    { slug: pick(1).slug, reason: 'eliminated' },
    { slug: pick(2).slug, reason: 'sabotage' },
    { slug: pick(3).slug, reason: 'champion' },
  ];

  const [exit, setExit] = useState<{
    reason: MatchForfeitReason;
    side: 'top' | 'bottom';
    key: number;
  }>({ reason: 'meltdown', side: 'bottom', key: 0 });
  const [exitParty, setExitParty] = useState<SponsorId>('stranka');
  const [sniffKey, setSniffKey] = useState(0);
  const [event, setEvent] = useState<{ kind: MatchEventKind; key: number }>({
    kind: 'meltdown',
    key: 0,
  });
  const [viewer, setViewer] = useState<{ id: string; key: number } | null>(
    null,
  );
  const [matchSponsor, setMatchSponsor] = useState<SponsorId | null>('zidari');
  const [opponentSponsor, setOpponentSponsor] = useState<SponsorId | null>(
    'ostrvo',
  );
  const [newspaperKey, setNewspaperKey] = useState(0);
  const [overlordKey, setOverlordKey] = useState(0);
  const [reportWinner, setReportWinner] = useState<'ai' | 'player'>('ai');
  const [introKey, setIntroKey] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [rivalKey, setRivalKey] = useState(0);
  const [showRival, setShowRival] = useState(false);
  const slugs = useMemo(() => characters.map((c) => c.slug), [characters]);
  const governedCareer = useMemo(
    () => sampleCareer({ slugs, phase: 'offseason', year: 3, season: 0 }),
    [slugs],
  );
  const [mail, setMail] = useState(() => governedCareer.mail);
  const finishedCareer = useMemo(
    () => sampleFinishedCareer(slugs, reportWinner === 'ai' ? 'cone' : 'vuka'),
    [slugs, reportWinner],
  );
  const finishedOverlord =
    characters.find((c) => c.slug === finishedCareer.overlordSlug) ?? charA;
  const finishedPlayer =
    characters.find((c) => c.slug === finishedCareer.playerSlug) ?? charA;
  const [cupCareer, setCupCareer] = useState<SavedCareer | null>(null);
  const [openSeason, setOpenSeason] = useState(1);
  const [openYear, setOpenYear] = useState(3);
  const [openKey, setOpenKey] = useState(0);
  const [showOpen, setShowOpen] = useState(false);
  // Recent results and edition records so the streaks and season cards have
  // something to show
  const openCareer = useMemo(() => {
    const base = sampleCareer({ slugs, phase: 'cup', year: openYear, season: openSeason });
    const characters = Object.fromEntries(
      Object.entries(base.characters).map(([slug, ch], i) => [
        slug,
        {
          ...ch,
          recentResults: SAMPLE_RUNS[i % SAMPLE_RUNS.length],
          editionRecord: { [openSeason]: [3 + (i % 5), 1 + (i % 3)] as [number, number] },
        },
      ]),
    );
    return { ...base, characters };
  }, [slugs, openYear, openSeason]);

  const viewerScenario = viewer
    ? VIEWER_SCENARIOS.find((s) => s.id === viewer.id)
    : null;

  const sampleNews: NewsItem[] = SAMPLE_ARTICLES.map((article, i) => ({
    kind: 'recap',
    templateKey: article.templateKey,
    params: article.params ?? {},
    refs: article.refs,
    slugs: [pick(i).slug],
    freezeframe: article.freezeframe,
  }));

  return (
    <div className="flex flex-col gap-5">
      <LabSection
        title="Mood bubbles"
        note="Every reaction to cholesterol, appetite, ambition, ego and fame, with the values that trigger it."
      >
        <MoodPreviewGrid character={charA} />
      </LabSection>

      <LabSection
        title="Off-season behaviour"
        note="Change the mood or the season to check the pose, the effects and the transition between animations."
      >
        <MoodActivityPreview character={charA} />
      </LabSection>

      <LabSection
        title="Monthly activity scenes"
        note="ActionCutscene: a short scene for every training, rest, media, security, investment and sabotage. Full window opens the real modal with the receipt."
      >
        <ActionScenePreview character={charA} />
      </LabSection>

      <LabSection
        title="Sabotage against you"
        note="SabotageHitReel: before the paper opens, one scene for every story about a hit on your character. Full window opens the modal with the receipt, full reel plays three in a row."
      >
        <SabotageHitPreview character={charA} />
      </LabSection>

      <LabSection
        title="Quote scenes"
        note="QuoteCutscene: a character's recorded line after a cup event. Full window plays the clip and the subtitle as in the game."
      >
        <QuoteScenePreview characterBySlug={characterBySlug} />
      </LabSection>

      <LabSection
        title="Sponsor look"
        note="Compare the off-season sponsor atmosphere across every season."
      >
        <SponsorFlavorPreview character={charA} />
      </LabSection>

      <LabSection
        title="Calendar results"
        note="Every placing badge shown after a finished cup."
      >
        <CalendarResultPreview />
      </LabSection>

      <LabSection
        title="Exit scene after a match"
        note="MatchExitScene: the stretcher, the arrest, the puking and the white flag, top or bottom."
      >
        <div className="flex flex-wrap gap-2">
          {EXIT_REASONS.map(({ reason, label }) =>
            (['top', 'bottom'] as const).map((side) => (
              <TriggerButton
                key={`${reason}-${side}`}
                label={`${label} · ${side === 'top' ? 'top' : 'bottom'}`}
                active={exit.reason === reason && exit.side === side}
                onClick={() => setExit({ reason, side, key: exit.key + 1 })}
              />
            )),
          )}
          <TriggerButton
            label="Replay"
            onClick={() => setExit({ ...exit, key: exit.key + 1 })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Who removes
          </span>
          {SPONSOR_IDS.map((id) => (
            <TriggerButton
              key={id}
              label={
                (GAMES_UI.career.sponsors.names as Record<SponsorId, string>)[
                  id
                ]
              }
              active={exitParty === id}
              onClick={() => {
                setExitParty(id);
                setExit({
                  reason: 'removed',
                  side: exit.side,
                  key: exit.key + 1,
                });
              }}
            />
          ))}
        </div>
        <div className="relative h-48 overflow-hidden rounded-2xl border border-sky-200/10 bg-slate-950/70">
          <MatchExitScene
            key={exit.key}
            reason={exit.reason}
            loser={charB}
            side={exit.side}
            party={exitParty}
            walkOff={
              exit.reason === 'meltdown' ||
              exit.reason === 'police' ||
              exit.reason === 'removed'
            }
          />
        </div>
      </LabSection>

      <LabSection
        title="Match events"
        note="MatchEventOverlay: comic interruptions over the table."
      >
        <div className="flex flex-wrap gap-2">
          {EVENT_KINDS.map((kind) => (
            <TriggerButton
              key={kind}
              label={kind}
              active={event.kind === kind}
              onClick={() => setEvent({ kind, key: event.key + 1 })}
            />
          ))}
          <TriggerButton
            label="Replay"
            onClick={() => setEvent({ ...event, key: event.key + 1 })}
          />
        </div>
        <div className="relative h-32 overflow-hidden rounded-2xl border border-sky-200/10 bg-slate-950/70">
          <MatchEventOverlay key={event.key} kind={event.kind} />
        </div>
      </LabSection>

      <LabSection
        title="Sniffing in a match"
        note="SniffCue: Super Sniffer smells the glizzy and pulls the hand away from that box."
      >
        <div className="flex flex-wrap gap-2">
          <TriggerButton
            label="Replay"
            onClick={() => setSniffKey((k) => k + 1)}
          />
        </div>
        <div className="relative flex h-36 items-center justify-center gap-16 rounded-2xl border border-sky-200/10 bg-slate-950/70">
          <span className="flex flex-col items-center gap-2">
            <SniffCue key={`l-${sniffKey}`} tailSide="left" />
            <SniffScent
              key={`su-${sniffKey}`}
              direction="up"
              className="relative"
            />
          </span>
          <span className="flex flex-col items-center gap-2">
            <SniffCue key={`r-${sniffKey}`} tailSide="right" />
            <SniffScent
              key={`sd-${sniffKey}`}
              direction="down"
              className="relative"
            />
          </span>
        </div>
      </LabSection>

      <LabSection
        title="Full match"
        note="MatchViewer with the crowd, random banners and sponsor fans."
      >
        <div className="flex flex-wrap gap-2">
          {VIEWER_SCENARIOS.map((scenario) => (
            <TriggerButton
              key={scenario.id}
              label={scenario.label}
              active={viewer?.id === scenario.id}
              onClick={() =>
                setViewer({ id: scenario.id, key: (viewer?.key ?? 0) + 1 })
              }
            />
          ))}
          {viewer && (
            <TriggerButton label="Hide" onClick={() => setViewer(null)} />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Top player
          </span>
          <TriggerButton
            label="No sponsor"
            active={matchSponsor === null}
            onClick={() => setMatchSponsor(null)}
          />
          {SPONSOR_IDS.map((id) => (
            <TriggerButton
              key={id}
              label={
                (GAMES_UI.career.sponsors.names as Record<SponsorId, string>)[
                  id
                ]
              }
              active={matchSponsor === id}
              onClick={() => setMatchSponsor(id)}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Bottom player
          </span>
          <TriggerButton
            label="No sponsor"
            active={opponentSponsor === null}
            onClick={() => setOpponentSponsor(null)}
          />
          {SPONSOR_IDS.map((id) => (
            <TriggerButton
              key={id}
              label={
                (GAMES_UI.career.sponsors.names as Record<SponsorId, string>)[
                  id
                ]
              }
              active={opponentSponsor === id}
              onClick={() => setOpponentSponsor(id)}
            />
          ))}
        </div>
        {viewer && viewerScenario && (
          <MatchViewer
            key={`${viewer.id}-${viewer.key}`}
            a={charA}
            b={charB}
            result={viewerScenario.result}
            betSlug={charA.slug}
            supportedSlug={charA.slug}
            sponsorA={matchSponsor}
            sponsorB={opponentSponsor}
            onDone={() => setViewer(null)}
          />
        )}
      </LabSection>

      <LabSection
        title="Newspaper pictures"
        note="FreezeframeGraphic: every scene that can turn up in the paper."
      >
        <div className="flex flex-wrap items-end gap-3">
          {FREEZEFRAME_SCENES.map((scene, i) => (
            <div key={scene} className="flex flex-col items-center gap-1">
              <FreezeframeGraphic scene={scene} character={pick(i)} />
              <span className="font-mono text-[9px] text-slate-500">
                {scene}
              </span>
            </div>
          ))}
        </div>
      </LabSection>

      <LabSection
        title="Newspaper"
        note="NewspaperSpread: a sample issue with every kind of article and picture."
      >
        <div className="flex flex-wrap gap-2">
          <TriggerButton
            label="Replay the spin"
            onClick={() => setNewspaperKey(newspaperKey + 1)}
          />
        </div>
        <div className="flex justify-center">
          <NewspaperSpread
            key={newspaperKey}
            news={sampleNews}
            season={1}
            year={2}
            characterBySlug={characterBySlug}
            onDone={() => setNewspaperKey(newspaperKey + 1)}
          />
        </div>
      </LabSection>

      <LabSection
        title="Election news"
        note="NewspaperSpread with only the city news: election year, poll, result, glizzy price and party favors, each with its own picture."
      >
        <div className="flex justify-center">
          <NewspaperSpread
            key={`election-${newspaperKey}`}
            news={sampleNews.filter(
              (item) =>
                item.templateKey.startsWith('election') ||
                item.templateKey.startsWith('glizi-price') ||
                item.templateKey.startsWith('removal-'),
            )}
            season={0}
            year={3}
            characterBySlug={characterBySlug}
            onDone={() => setNewspaperKey(newspaperKey + 1)}
          />
        </div>
      </LabSection>

      <LabSection
        title="Election"
        note="Election night, the assembly and the poll over sample results, the same as /preview/election."
      >
        <ElectionPreviewLab />
      </LabSection>

      <LabSection
        title="Assembly in the career"
        note="ParliamentPanel, both tabs side by side: the assembly with a Party and Masons government and the pre-election poll, then popularity with the war chest, affairs, rating and the rating chart. Below, the info panel with the effects of each party in power."
      >
        <div className="mx-auto grid w-full max-w-3xl gap-6 sm:grid-cols-2">
          <ParliamentPanel
            career={governedCareer}
            characterBySlug={characterBySlug}
          />
          <ParliamentPanel
            career={governedCareer}
            characterBySlug={characterBySlug}
            initialTab="popularity"
          />
        </div>
        <div className="mx-auto w-full max-w-sm">
          <GovernmentEffectsInfoPanel
            leader={governedCareer.parliament?.government[0] ?? null}
          />
        </div>
      </LabSection>

      <LabSection
        title="Mail"
        note="CareerMailbox: one letter of every kind, including the poll, the donation, the election result, the favor, the tax and the refund."
      >
        <div className="flex flex-wrap gap-2">
          <TriggerButton
            label="Restore all letters"
            onClick={() => setMail(governedCareer.mail)}
          />
        </div>
        <div className="mx-auto w-full max-w-sm">
          <CareerMailbox
            mail={mail}
            canAcceptSponsor
            canDonate={() => true}
            balance={640}
            onMarkRead={(id) =>
              setMail((m) =>
                m.map((x) => (x.id === id ? { ...x, read: true } : x)),
              )
            }
            onMarkAllRead={() =>
              setMail((m) => m.map((x) => ({ ...x, read: true })))
            }
            onAcceptSponsor={(id) =>
              setMail((m) =>
                m.map((x) =>
                  x.id === id || x.kind === 'sponsor-offer'
                    ? { ...x, read: true }
                    : x,
                ),
              )
            }
            onDonate={(id) =>
              setMail((m) =>
                m.map((x) => (x.id === id ? { ...x, read: true } : x)),
              )
            }
          />
        </div>
      </LabSection>

      <LabSection
        title="Career table"
        note="CareerTable: the league table with sponsors and the rival, without party colors."
      >
        <CareerTable
          characters={governedCareer.characters}
          characterBySlug={characterBySlug}
          playerSlug={governedCareer.playerSlug}
          lastCupRanks={governedCareer.lastCupRanks}
          rivalSlug={governedCareer.rivalSlug}
        />
      </LabSection>

      <LabSection
        title="Calendar with elections"
        note="YearCalendar: the ELECTION mark on the Bloody Cup of an election year (years 2 and 4)."
      >
        <div className="mx-auto w-full max-w-2xl">
          <YearCalendar career={{ ...governedCareer, year: 4 }} />
          <SeasonPriceInfoPanel career={governedCareer} />
          <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
            <GlizacijaPill career={governedCareer} onOpen={() => {}} />
            <GlizacijaPanel career={governedCareer} />
          </div>
        </div>
      </LabSection>

      <LabSection
        title="Cup with a party favor"
        note="CareerCupPhase live: the player donates to the leading party, so there is a Call the party button before a match. Play or watch the matches, the AI uses favors too."
      >
        <div className="flex flex-wrap gap-2">
          <TriggerButton
            label={cupCareer ? 'Again' : 'Show'}
            onClick={() =>
              setCupCareer(
                sampleCareer({ slugs, phase: 'cup', year: 3, season: 1 }),
              )
            }
          />
          {cupCareer && (
            <TriggerButton label="Hide" onClick={() => setCupCareer(null)} />
          )}
        </div>
        {cupCareer && (
          <div className="overflow-hidden rounded-2xl border border-sky-200/10">
            <CareerCupPhase
              career={cupCareer}
              characterBySlug={characterBySlug}
              topBar={null}
              onOpenTable={() => undefined}
              onUpdate={setCupCareer}
              onFinish={() => setCupCareer(null)}
            />
          </div>
        )}
      </LabSection>

      <LabSection
        title="Studio intro before the cup"
        note="BroadcastOpenPanel: the cards rotate on their own (weather forecast, their season, streaks, title chance), the strip on top jumps to a card, and the countdown only starts on the last one. The temperature and the text roll by year and season."
      >
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: SEASON_COUNT }, (_, season) => (
            <TriggerButton
              key={season}
              label={seasonName(season)}
              active={openSeason === season}
              onClick={() => setOpenSeason(season)}
            />
          ))}
          <TriggerButton
            label={`Year ${openYear}: new forecast`}
            onClick={() => setOpenYear((y) => y + 1)}
          />
          <TriggerButton
            label="Show"
            onClick={() => {
              setOpenKey((k) => k + 1);
              setShowOpen(true);
            }}
          />
        </div>
        {showOpen && (
          <BroadcastOpenPanel
            key={openKey}
            career={openCareer}
            characterBySlug={characterBySlug}
            preview
          />
        )}
      </LabSection>

      <LabSection
        title="Glizzy Overlord"
        note="OverlordCelebration: the celebration for the first character to reach 300 points."
      >
        <div className="flex flex-wrap gap-2">
          <TriggerButton
            label="Replay"
            onClick={() => setOverlordKey(overlordKey + 1)}
          />
        </div>
        <div className="flex justify-center">
          <OverlordCelebration
            key={overlordKey}
            character={charA}
            player={charA}
            playerPlace={1}
            onContinue={() => setOverlordKey(overlordKey + 1)}
          />
        </div>
      </LabSection>

      <LabSection
        title="End of the campaign"
        note="OverlordCelebration, then the campaign report on a click: the single-player version and the room version (Glizzy Rivals)."
      >
        <div className="flex flex-wrap gap-2">
          <TriggerButton
            label="Crown to an AI character"
            active={reportWinner === 'ai'}
            onClick={() => setReportWinner('ai')}
          />
          <TriggerButton
            label="Crown to the player"
            active={reportWinner === 'player'}
            onClick={() => setReportWinner('player')}
          />
        </div>
        <div className="flex justify-center">
          <OverlordCelebration
            key={reportWinner}
            character={finishedOverlord}
            player={finishedPlayer}
            playerPlace={
              rankBySeeding(
                finishedCareer.characters,
                finishedCareer.playerSlug,
              ).indexOf(finishedCareer.playerSlug) + 1
            }
            onContinue={() => undefined}
          />
        </div>
        <FinalReportPreview career={finishedCareer} characters={characters} />
      </LabSection>

      <LabSection
        title="Rival choice"
        note="RivalChoiceDialog: the press conference and calling someone out from the table."
      >
        <div className="flex flex-wrap gap-2">
          <TriggerButton
            label={showRival ? 'Replay' : 'Show'}
            onClick={() => {
              setShowRival(true);
              setRivalKey(rivalKey + 1);
            }}
          />
          {showRival && (
            <TriggerButton label="Hide" onClick={() => setShowRival(false)} />
          )}
        </div>
        {showRival && (
          <RivalChoiceDialog
            key={rivalKey}
            candidates={rivalShortlist}
            characterBySlug={characterBySlug}
            player={charA}
            onChoose={() => setShowRival(false)}
          />
        )}
      </LabSection>

      <LabSection
        title="Intro scene"
        note="CareerIntroCutscene: the newspaper that spins in at the start of a career."
      >
        <div className="flex flex-wrap gap-2">
          <TriggerButton
            label={showIntro ? 'Replay' : 'Show'}
            onClick={() => {
              setShowIntro(true);
              setIntroKey(introKey + 1);
            }}
          />
          {showIntro && (
            <TriggerButton label="Hide" onClick={() => setShowIntro(false)} />
          )}
        </div>
        {showIntro && (
          <div className="flex justify-center">
            <CareerIntroCutscene
              key={introKey}
              onDone={() => setShowIntro(false)}
            />
          </div>
        )}
      </LabSection>
    </div>
  );
}

import type { DuelCharacter } from '@/data/games/glizzyDuel';
import type { NewsItem } from '@/lib/utils/careerSave';

const PLACE = { place: 'ordinal' } as const;
const TABLE_MOVE = { places: 'count', place: 'ordinal' } as const;
const GOVERNMENT = { parties: 'sponsorCoalition' } as const;
const COALITION = { parties: 'sponsorCoalition', leader: 'sponsor' } as const;

// One of every article the paper can print, with its freezeframe scene. A
// premier or a seat is a position in the preview roster
const SAMPLE_ARTICLES: {
  templateKey: string;
  freezeframe: string;
  params?: NewsItem['params'];
  refs?: NewsItem['refs'];
  premier?: number;
  seat?: number;
}[] = [
  { templateKey: 'cupChampion', freezeframe: 'champion' },
  {
    templateKey: 'cupPlace-finalist',
    freezeframe: 'place-finalist',
    params: { place: 2 },
    refs: PLACE,
  },
  {
    templateKey: 'cupPlace-semis',
    freezeframe: 'place-semis',
    params: { place: 3 },
    refs: PLACE,
  },
  {
    templateKey: 'cupPlace-quarters',
    freezeframe: 'place-quarters',
    params: { place: 6 },
    refs: PLACE,
  },
  {
    templateKey: 'cupPlace-early',
    freezeframe: 'place-early',
    params: { place: 11 },
    refs: PLACE,
  },
  {
    templateKey: 'signing',
    freezeframe: 'signing-yellow',
    params: { sponsor: 'yellow' },
    refs: { sponsor: 'sponsor' },
  },
  { templateKey: 'police-tax', freezeframe: 'police-tax' },
  { templateKey: 'police-island', freezeframe: 'police-island' },
  { templateKey: 'police-smuggling', freezeframe: 'police-smuggling' },
  { templateKey: 'catfish-date', freezeframe: 'heartbreak' },
  { templateKey: 'catfish-beast', freezeframe: 'beast' },
  { templateKey: 'catfish-demons', freezeframe: 'demons' },
  { templateKey: 'poison-glizimaker', freezeframe: 'poison-glizi' },
  { templateKey: 'poison-kafana', freezeframe: 'poison-kafana' },
  { templateKey: 'witch-curse', freezeframe: 'witch-curse' },
  { templateKey: 'nutrition-bribed', freezeframe: 'nutrition-bribed' },
  { templateKey: 'fans-rumor', freezeframe: 'rumor' },
  { templateKey: 'media-interview', freezeframe: 'interview' },
  { templateKey: 'media-scandal', freezeframe: 'scandal-flash' },
  { templateKey: 'cup-police', freezeframe: 'police' },
  { templateKey: 'sabotageCaught', freezeframe: 'caught', params: { fine: 60 } },
  { templateKey: 'sabotageBlocked', freezeframe: 'blocked' },
  { templateKey: 'yellow-vendetta-failed', freezeframe: 'evidence-failed' },
  { templateKey: 'yellow-debt-warning', freezeframe: 'yellow-debt-warning' },
  { templateKey: 'yellow-run-over', freezeframe: 'yellow-run-over' },
  { templateKey: 'scandal', freezeframe: 'crying' },
  { templateKey: 'cup-meltdown', freezeframe: 'meltdown' },
  { templateKey: 'cup-withdrawn', freezeframe: 'fired' },
  { templateKey: 'cup-removed', freezeframe: 'police' },
  { templateKey: 'removal-blue', freezeframe: 'removal-blue' },
  { templateKey: 'removal-green', freezeframe: 'removal-green' },
  { templateKey: 'removal-yellow', freezeframe: 'removal-yellow' },
  { templateKey: 'removal-red', freezeframe: 'removal-red' },
  {
    templateKey: 'election-year',
    freezeframe: 'ballot',
    params: {
      parties: 'green,red,yellow,blue',
    },
    refs: { parties: 'sponsorList' },
  },
  {
    templateKey: 'election-poll',
    freezeframe: 'poll',
    params: { red: 31, yellow: 27, blue: 24, green: 18 },
  },
  {
    templateKey: 'election-result',
    freezeframe: 'election-result',
    params: {
      red: 33,
      yellow: 27,
      blue: 25,
      green: 15,
      government: 'red,blue',
      parties: 'red,blue',
      seats: 58,
    },
    refs: GOVERNMENT,
  },
  {
    templateKey: 'election-coalition',
    freezeframe: 'election-result',
    params: {
      red: 33,
      yellow: 27,
      blue: 25,
      green: 15,
      government: 'red,green,blue',
      parties: 'red,green,blue',
      seats: 73,
      leader: 'red',
      votes: 7,
      total: 10,
    },
    refs: COALITION,
  },
  {
    templateKey: 'election-result-alone',
    freezeframe: 'election-result',
    premier: 2,
    params: {
      red: 12,
      yellow: 54,
      blue: 20,
      green: 14,
      government: 'yellow',
      parties: 'yellow',
      seats: 54,
      blame: 'previous',
      target: 'red',
      seed: 2,
    },
    refs: GOVERNMENT,
  },
  {
    templateKey: 'election-result',
    freezeframe: 'election-result',
    seat: 0,
    premier: 0,
    params: {
      red: 35,
      yellow: 26,
      blue: 25,
      green: 14,
      government: 'red,blue',
      parties: 'red,blue',
      seats: 60,
      blame: 'first',
      seed: 1,
    },
    refs: GOVERNMENT,
  },
  {
    templateKey: 'election-coalition',
    freezeframe: 'election-result',
    premier: 1,
    params: {
      red: 33,
      yellow: 27,
      blue: 25,
      green: 15,
      government: 'red,green,blue',
      parties: 'red,green,blue',
      seats: 73,
      leader: 'red',
      votes: 7,
      total: 10,
      blame: 'rival',
      target: 'yellow',
      seed: 4,
    },
    refs: COALITION,
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
    refs: TABLE_MOVE,
  },
  {
    templateKey: 'tableFall',
    freezeframe: 'table-down',
    params: { places: 5, place: 14 },
    refs: TABLE_MOVE,
  },
  { templateKey: 'betting-banned', freezeframe: 'stamp-banned' },
  { templateKey: 'betting-unlocked', freezeframe: 'stamp-allowed' },
  {
    templateKey: 'factRecord',
    freezeframe: 'fact-record',
    params: { wins: 9, losses: 2 },
  },
  {
    templateKey: 'factRecordWorst',
    freezeframe: 'fact-record-down',
    params: { wins: 1, losses: 8 },
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

export function sampleArticles(characters: DuelCharacter[]): NewsItem[] {
  return SAMPLE_ARTICLES.map((article, i) => {
    const params = article.params ?? {};
    return {
      kind: 'recap',
      templateKey: article.templateKey,
      params:
        article.premier === undefined
          ? params
          : { ...params, premier: characters[article.premier].slug },
      refs: article.refs,
      slugs: [characters[article.seat ?? i % characters.length].slug],
      freezeframe: article.freezeframe,
    };
  });
}

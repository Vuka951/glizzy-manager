import { useEffect, useMemo, useRef } from 'react';
import ElectionBallotGraphic from '@/components/games/career/ElectionBallotGraphic';
import ElectionPollGraphic, {
  seatsFromParams,
} from '@/components/games/career/ElectionPollGraphic';
import ElectionResultGraphic, {
  governmentFromParams,
} from '@/components/games/career/ElectionResultGraphic';
import FreezeframeGraphic from '@/components/games/career/FreezeframeGraphic';
import GliziPriceGraphic from '@/components/games/career/GliziPriceGraphic';
import PartyRemovalGraphic from '@/components/games/career/PartyRemovalGraphic';
import SeasonGlyph from '@/components/games/career/SeasonGlyph';
import CoachTag from '@/components/games/career-mp/CoachTag';
import type { CoachTagMap } from '@/lib/types/careerMp';
import { PARTY_SEAT_ORDER } from '@/data/games/careerElections';
import type { SponsorId } from '@/lib/utils/careerSave';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { NewsItem } from '@/lib/utils/careerSave';
import { seasonName } from '@/lib/utils/localeNames';
import { playPaperSound } from '@/lib/utils/gameSounds';
import { localeTemplate, renderMessage } from '@/lib/utils/messageText';
import { fmt } from '@/lib/utils/format';

const NP = GAMES_UI.career.newspaper;
const SELECT = GAMES_UI.career.select;

// A story's hero is its first slug; every other name in it is a ref
function articleText(item: NewsItem): string {
  return renderMessage({
    key: `career.news.${item.templateKey}`,
    params: { ...item.params, name: item.slugs[0] ?? '' },
    refs: { ...item.refs, name: 'character' },
  });
}

// The city desk has its own art: the chamber for a poll or a count, the
// ballot box for an election year, the price tag for the glizi market and
// the party's mark on a player it removed. Every other story prints a
// picture of somebody
function ArticleGraphic({
  item,
  character,
  small,
}: {
  item: NewsItem;
  character: DuelCharacter;
  small?: boolean;
}) {
  const scene = item.freezeframe ?? '';
  if (scene === 'poll' || scene === 'election-result') {
    const seats = seatsFromParams(item.params);
    if (!seats) return null;
    return scene === 'poll' ? (
      <ElectionPollGraphic seats={seats} small={small} />
    ) : (
      <ElectionResultGraphic
        seats={seats}
        government={governmentFromParams(item.params)}
        small={small}
      />
    );
  }
  if (scene === 'ballot') return <ElectionBallotGraphic small={small} />;
  if (scene === 'price-up' || scene === 'price-down') {
    return (
      <GliziPriceGraphic
        up={scene === 'price-up'}
        pct={Number(item.params.pct) || 0}
        small={small}
      />
    );
  }
  if (scene.startsWith('removal-')) {
    const party = scene.slice('removal-'.length) as SponsorId;
    if (PARTY_SEAT_ORDER.includes(party)) {
      return (
        <PartyRemovalGraphic character={character} party={party} small={small} />
      );
    }
  }
  return (
    <FreezeframeGraphic
      scene={item.freezeframe as string}
      character={character}
      small={small}
    />
  );
}

// The whole off-season lands on your desk as one newspaper spread
export default function NewspaperSpread({
  news,
  season,
  year,
  characterBySlug,
  cta,
  onDone,
  coaches,
}: {
  news: NewsItem[];
  season: number;
  year: number;
  characterBySlug: Map<string, DuelCharacter>;
  cta?: string;
  onDone: () => void;
  // A shared league: stories about a human's character carry the coach's tag
  coaches?: CoachTagMap;
}) {
  const paperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    playPaperSound();
    // The spin lands flat and the fill is dropped once it is over: a paper
    // left at a fraction of a degree keeps its text rasterized on a
    // transformed layer, which reads as a blur on Windows
    const animation = el.animate(
      [
        { transform: 'rotate(-380deg) scale(0.1)', opacity: 0 },
        { transform: 'rotate(0deg) scale(1)', opacity: 1 },
      ],
      {
        duration: 900,
        easing: 'cubic-bezier(0.2, 0.8, 0.3, 1)',
        fill: 'backwards',
      },
    );
    return () => animation.cancel();
  }, []);

  const headlines = NP.headlines as Record<string, string>;
  const { valid, lead, rest, hiddenImages, leftImages } = useMemo(() => {
    // League news (the bookie, the commentator, prices, elections, the
    // parties' removals) outranks every interview and podium story
    const validItems = news
      .filter(
        (item) =>
          localeTemplate(`career.news.${item.templateKey}`) &&
          characterBySlug.has(item.slugs[0]),
      )
      .sort((x, y) => Number(y.kind === 'league') - Number(x.kind === 'league'));
    const leadItem =
      validItems.find((item) => item.kind === 'league') ??
      validItems.find((item) => item.freezeframe) ??
      validItems.find(
        (item) => item.kind === 'signing' || item.kind === 'fired',
      ) ??
      validItems[0];
    const restItems = validItems.filter((item) => item !== leadItem);
    // Seeded from the issue's content so the layout is random per paper but
    // stable across re-renders
    let seed = year * 31 + season;
    for (const item of validItems) {
      for (const char of item.templateKey + item.slugs[0]) {
        seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
      }
    }
    const nextRandom = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    // Editorial budget: in a paper of 5+ stories, roughly one in five of the
    // smaller articles runs without art. The lead always keeps its image
    const hidden = new Set<number>();
    if (validItems.length >= 5) {
      const pool = restItems.map((_, index) => index);
      for (
        let n = Math.floor(validItems.length / 5);
        n > 0 && pool.length > 0;
        n--
      ) {
        hidden.add(pool.splice(Math.floor(nextRandom() * pool.length), 1)[0]);
      }
    }
    // A little layout irregularity: some small articles run the art on the
    // left instead of the right. The lead keeps its fixed layout
    const left = new Set<number>();
    restItems.forEach((_, index) => {
      if (nextRandom() < 0.4) left.add(index);
    });
    return {
      valid: validItems,
      lead: leadItem,
      rest: restItems,
      hiddenImages: hidden,
      leftImages: left,
    };
  }, [news, characterBySlug, year, season]);
  const leadCharacter = lead ? characterBySlug.get(lead.slugs[0]) : undefined;

  return (
    <div
      ref={paperRef}
      className="relative max-h-[75vh] w-full max-w-2xl overflow-y-auto rounded-sm bg-amber-50 p-5 text-left text-slate-900 shadow-2xl lg:max-w-4xl"
    >
      <div className="border-y-4 border-double border-slate-900 py-2 text-center">
        <p className="text-2xl font-black uppercase tracking-[0.15em] sm:text-3xl">
          {SELECT.masthead}
        </p>
        <p className="mt-1 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-500">
          <SeasonGlyph season={season} className="h-4 w-4" />
          {fmt(NP.issue, { theme: seasonName(season), year })}
          <SeasonGlyph season={season} className="h-4 w-4" />
        </p>
      </div>

      {valid.length === 0 && (
        <p className="mt-4 text-center text-sm italic text-slate-600">
          {NP.empty}
        </p>
      )}

      {lead && (
        <div className="mt-3 border-b-2 border-slate-900 pb-3">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-red-800">
            {NP.lead}
          </p>
          <div className="mt-1 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-lg font-black uppercase leading-tight">
                {headlines[lead.templateKey] ?? ''}
                {!lead.tagless && coaches?.[lead.slugs[0]] && (
                  <span className="ml-2 inline-flex align-middle">
                    <CoachTag
                      name={coaches[lead.slugs[0]].name}
                      color={coaches[lead.slugs[0]].color}
                      onPaper
                    />
                  </span>
                )}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-700">
                {articleText(lead)}
              </p>
            </div>
            {lead.freezeframe && leadCharacter && (
              <div className="shrink-0">
                <ArticleGraphic item={lead} character={leadCharacter} />
              </div>
            )}
          </div>
        </div>
      )}

      {rest.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:block lg:columns-3 lg:gap-5 lg:[column-rule:1px_solid_rgb(15_23_42/0.15)]">
          {rest.map((item, i) => {
            const character = characterBySlug.get(item.slugs[0]);
            const graphic = item.freezeframe &&
              !hiddenImages.has(i) &&
              character && (
                <span className="shrink-0">
                  <ArticleGraphic item={item} character={character} small />
                </span>
              );
            return (
              <div
                key={i}
                className="border-b border-slate-900/15 pb-2 sm:odd:border-r sm:odd:border-r-slate-900/15 sm:odd:pr-4 lg:mb-3 lg:break-inside-avoid lg:odd:border-r-0 lg:odd:pr-0"
              >
                <p
                  className={`text-xs font-black uppercase leading-tight ${
                    graphic && leftImages.has(i) ? 'text-right' : ''
                  }`}
                >
                  {headlines[item.templateKey] ?? ''}
                  {!item.tagless && coaches?.[item.slugs[0]] && (
                    <span className="ml-1.5 inline-flex align-middle">
                      <CoachTag
                        name={coaches[item.slugs[0]].name}
                        color={coaches[item.slugs[0]].color}
                        dense
                        onPaper
                      />
                    </span>
                  )}
                </p>
                <div className="mt-1 flex items-start gap-2">
                  {leftImages.has(i) && graphic}
                  <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-slate-600">
                    {articleText(item)}
                  </p>
                  {!leftImages.has(i) && graphic}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex justify-center">
        <button
          onClick={onDone}
          className="rounded-sm bg-slate-900 px-7 py-2.5 text-xs font-black uppercase tracking-widest text-amber-50 transition hover:bg-slate-700"
        >
          {cta ?? NP.cta}
        </button>
      </div>
    </div>
  );
}

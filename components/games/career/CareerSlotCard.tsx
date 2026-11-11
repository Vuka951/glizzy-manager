import CareerButton from '@/components/games/career/CareerButton';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import PortraitHead from '@/components/games/PortraitHead';
import Icon from '@/components/icons/Icon';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { campaignOverlord } from '@/lib/utils/careerPoints';
import type { CareerSlot, SavedCareer } from '@/lib/utils/careerSave';
import { seasonName } from '@/lib/utils/localeNames';
import { fmt, plural } from '@/lib/utils/format';

const CAREER = GAMES_UI.career;

const CARD_RULES =
  'bg-[repeating-linear-gradient(180deg,transparent_0_21px,rgb(30_64_175/0.16)_21px_22px)]';
const FACT =
  'font-sign text-[13px] font-semibold uppercase leading-tight tracking-[0.05em] text-slate-400';
const FEAT =
  'inline-flex min-w-0 items-center gap-1 font-sign text-[13px] font-bold uppercase leading-tight tracking-[0.05em] text-amber-300';

// One card from the league's card index. The tab holds the slot's number; a
// blank card waits for a new career, a filled one has the coach's photo clipped
// to it and his standing written in
export default function CareerSlotCard({
  slot,
  career,
  onNew,
  onContinue,
  onDelete,
}: {
  slot: CareerSlot;
  career: SavedCareer | null;
  onNew: () => void;
  onContinue: () => void;
  onDelete: () => void;
}) {
  const tab = (
    <span
      className="absolute -top-[1.15rem] left-3 rounded-t-[4px] bg-[#f1e8d3] px-2.5 pt-0.5 font-sign text-[14px] font-bold uppercase leading-tight tracking-[0.08em] text-[#1c1408] shadow-[inset_0_1px_0_rgb(255_255_255/0.5)]"
    >
      {fmt(CAREER.start.slot, { n: slot })}
    </span>
  );

  if (!career) {
    return (
      <div className="relative mt-4">
        {tab}
        <PaperSheet
          className={`flex h-full items-center justify-end border-t-2 border-t-[#b91c1c]/60 p-3 sm:min-h-44 sm:justify-center ${CARD_RULES}`}
        >
          <CareerButton tone="danger" className="min-h-11" onClick={onNew}>
            {CAREER.start.button}
          </CareerButton>
        </PaperSheet>
      </div>
    );
  }

  // Each slot reads names from its own league, which nothing else registers
  const characterBySlug = new Map<string, DuelCharacter>(
    career.league.map(({ slug, name }) => [slug, { slug, name }]),
  );
  const character = characterBySlug.get(career.playerSlug) ?? null;
  const overlordSlug = campaignOverlord(career);
  const constitution = career.parliament?.constitution ?? null;
  const overlord = overlordSlug
    ? (characterBySlug.get(overlordSlug) ?? null)
    : null;

  return (
    <div className="relative mt-4">
      {tab}
      <PaperSheet
        className={`flex h-full items-center gap-3 border-t-2 border-t-[#b91c1c]/60 p-3 text-left sm:flex-col sm:items-stretch ${CARD_RULES}`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {character ? (
            <span className="shrink-0 -rotate-2 bg-[#fdfaf0] p-0.5 shadow-[0_1px_2px_rgb(0_0_0/0.45)]">
              <PortraitHead
                character={character}
                className="h-11 w-11 rounded-[1px]! border-0! shadow-none! sm:h-14 sm:w-14"
              />
            </span>
          ) : (
            <span className="h-11 w-11 shrink-0 border border-dashed border-[#1c1408]/40 sm:h-14 sm:w-14" />
          )}
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate font-serif text-[15px] font-bold leading-tight text-slate-100">
              {character?.name ?? career.playerSlug}
            </span>
            <span className={FACT}>
              {seasonName(career.season)} ·{' '}
              {fmt(CAREER.hud.year, { year: career.year })}
            </span>
            <span className={`whitespace-nowrap tabular-nums ${FACT}`}>
              {plural(CAREER.hud.balance, career.balance, {
                amount: career.balance,
              })}
            </span>
            {constitution && (
              <span className={FEAT}>
                <Icon name="trophy" className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {fmt(CAREER.hud.oneParty, {
                    party: CAREER.sponsors.names[constitution.party],
                  })}
                </span>
              </span>
            )}
            {overlord && (
              <span className={FEAT}>
                <Icon name="trophy" className="h-3 w-3 shrink-0" />
                <span className="truncate">
                  {fmt(CAREER.hud.overlordBy, { name: overlord.name })}
                </span>
              </span>
            )}
          </span>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
          <CareerButton tone="good" className="min-h-11 sm:flex-1" onClick={onContinue}>
            {CAREER.start.resume}
          </CareerButton>
          <CareerButton tone="danger" className="min-h-11 sm:flex-1" onClick={onDelete}>
            {CAREER.start.delete}
          </CareerButton>
        </div>
      </PaperSheet>
    </div>
  );
}

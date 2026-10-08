import SponsorActorGear from '@/components/games/career/SponsorActorGear';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import CrowdToken from '@/components/games/career-mp/CrowdToken';
import type { CoachTokens } from '@/lib/types/careerMp';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { SPONSOR_THEMES } from '@/lib/constants/sponsorThemes';
import type { SponsorId } from '@/lib/utils/careerSave';
import { crowdHype, crowdSize, NEUTRAL_FAME } from '@/lib/utils/crowdMood';
import { crowdVariant } from '@/lib/utils/matchAudience';

type CrowdSlot = {
  // Where the fan stands for the top seat and, mirrored, for the bottom one
  place: [string, string];
  back: boolean;
  role: 'sponsor' | null;
};

// The stand fills in this order as fame grows: two cousins first, the
// sponsor's own man right after them, then the rest of the section
const CROWD_SLOTS: CrowdSlot[] = [
  { place: ['right-[1%]', 'left-[1%]'], back: false, role: null },
  { place: ['left-[13%]', 'right-[13%]'], back: false, role: 'sponsor' },
  { place: ['left-[1%]', 'right-[1%]'], back: false, role: null },
  { place: ['right-[25%]', 'left-[25%]'], back: false, role: null },
  { place: ['left-[31%]', 'right-[31%]'], back: true, role: null },
  { place: ['right-[7%]', 'left-[7%]'], back: true, role: null },
  { place: ['left-[37%]', 'right-[37%]'], back: false, role: null },
  { place: ['right-[13%]', 'left-[13%]'], back: false, role: null },
  { place: ['left-[7%]', 'right-[7%]'], back: true, role: null },
  { place: ['right-[19%]', 'left-[19%]'], back: true, role: null },
  { place: ['left-[25%]', 'right-[25%]'], back: false, role: null },
  { place: ['right-[37%]', 'left-[37%]'], back: false, role: null },
  { place: ['left-[19%]', 'right-[19%]'], back: true, role: null },
  { place: ['right-[31%]', 'left-[31%]'], back: true, role: null },
];

const SHIRTS = [
  'bg-slate-700',
  'bg-slate-600',
  'bg-slate-800',
  'bg-sky-950',
  'bg-red-950',
  'bg-cyan-950',
];
const HEADS = [
  'bg-amber-200',
  'bg-orange-200',
  'bg-amber-300',
  'bg-yellow-100',
  'bg-orange-300',
];
const DELAYS = [
  '',
  '[animation-delay:-0.2s]',
  '[animation-delay:-0.45s]',
  '[animation-delay:-0.7s]',
  '[animation-delay:-0.95s]',
  '[animation-delay:-1.2s]',
  '[animation-delay:-1.5s]',
];
const TILTS = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3'];

export default function MatchAudience({
  top,
  bottom,
  topSponsor,
  bottomSponsor,
  signSeed,
  topFame = NEUTRAL_FAME,
  bottomFame = NEUTRAL_FAME,
  coachTokens = null,
}: {
  top: DuelCharacter;
  bottom: DuelCharacter;
  topSponsor: SponsorId | null;
  bottomSponsor: SponsorId | null;
  signSeed: number;
  topFame?: number;
  bottomFame?: number;
  // Coaches who backed a side sit in that side's stand for the clip
  coachTokens?: CoachTokens | null;
}) {
  const stands = [
    {
      character: top,
      sponsor: topSponsor,
      layer: 'top-[6%] z-0',
      fame: topFame,
      seed: signSeed,
      tokens: coachTokens?.top ?? [],
    },
    {
      character: bottom,
      sponsor: bottomSponsor,
      layer: 'bottom-[5%] z-20',
      fame: bottomFame,
      seed: signSeed + 1,
      tokens: coachTokens?.bottom ?? [],
    },
  ];

  return (
    <>
      {stands.map((stand, standIndex) => {
        const hype = crowdHype(stand.fame);
        const size = crowdSize(stand.fame);
        return (
          <div
            key={stand.character.slug}
            data-match-audience={standIndex === 0 ? 'top' : 'bottom'}
            data-crowd-size={size}
            className={`pointer-events-none absolute -inset-x-16 h-20 overflow-visible ${stand.layer} ${hype.opacity}`}
            aria-hidden="true"
          >
            {stand.tokens.length > 0 && (
              <>
                <span
                  data-coach-tokens={standIndex === 0 ? 'top' : 'bottom'}
                  className="absolute bottom-0 left-[20%] z-20 flex items-end gap-1"
                >
                  {stand.tokens
                    .filter((_, i) => i % 2 === 0)
                    .map((token) => (
                      <CrowdToken key={token.coachId} token={token} />
                    ))}
                </span>
                <span className="absolute bottom-0 right-[20%] z-20 flex items-end gap-1">
                  {stand.tokens
                    .filter((_, i) => i % 2 === 1)
                    .map((token) => (
                      <CrowdToken key={token.coachId} token={token} />
                    ))}
                </span>
              </>
            )}
            {CROWD_SLOTS.slice(0, size).map((slot, slotIndex) => {
              const variant = crowdVariant(
                stand.character.name,
                stand.seed,
                slotIndex,
              );
              const shirt = SHIRTS[variant % SHIRTS.length];
              const head = HEADS[(variant >>> 4) % HEADS.length];
              const delay = DELAYS[(variant >>> 8) % DELAYS.length];
              const tilt = TILTS[(variant >>> 12) % TILTS.length];
              const sponsor = slot.role === 'sponsor' ? stand.sponsor : null;
              return (
                <span
                  key={slotIndex}
                  className={`absolute flex h-12 w-8 items-end justify-center ${slot.place[standIndex]} ${
                    slot.back
                      ? 'bottom-3 z-0 scale-90 opacity-75'
                      : 'bottom-0 z-10'
                  }`}
                >
                  <span
                    className={`relative flex h-full w-full animate-bounce items-end justify-center ${hype.bounce} ${delay}`}
                  >
                    <span
                      className={`absolute bottom-0 h-5 w-8 rounded-t-[50%] ${shirt}`}
                    />
                    <span
                      className={`absolute bottom-4 h-4 w-4 rounded-full border border-slate-950/40 ${head}`}
                    />
                    {sponsor && (
                      <>
                        <span
                          className={`absolute bottom-3 left-0.5 h-6 w-1 origin-bottom -rotate-[24deg] rounded-full ${shirt}`}
                        />
                        <span
                          className={`absolute bottom-3 right-0.5 h-6 w-1 origin-bottom rotate-[24deg] rounded-full ${shirt}`}
                        />
                      </>
                    )}
                    {sponsor && (
                      <span
                        data-audience-board="sponsor"
                        className={`absolute bottom-9 left-1/2 flex h-10 w-14 -translate-x-1/2 items-center justify-center rounded-md border-2 shadow-xl ${tilt} ${SPONSOR_THEMES[sponsor].board}`}
                      >
                        <SponsorEmblem
                          sponsorId={sponsor}
                          className="h-7 w-7"
                        />
                      </span>
                    )}
                    {sponsor && (
                      <SponsorActorGear sponsorId={sponsor} variant="fan" />
                    )}
                  </span>
                </span>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

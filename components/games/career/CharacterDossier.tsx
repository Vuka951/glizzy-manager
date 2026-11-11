import ActionIcon from '@/components/icons/ActionIcon';
import DossierField from '@/components/games/career/DossierField';
import DossierStamp from '@/components/games/career/DossierStamp';
import InfoButton from '@/components/games/career/InfoButton';
import MetersPanel from '@/components/games/career/MetersPanel';
import PortraitHead from '@/components/games/PortraitHead';
import SeatTag from '@/components/games/rooms/SeatTag';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import PaperSheet from '@/components/games/career/street/PaperSheet';
import type { CoachTagMap } from '@/lib/types/careerMp';
import {
  INVESTMENT_DEFS,
  INVESTMENT_ORDER,
} from '@/data/games/careerInvestments';
import { SPONSOR_DEFS, SPONSOR_FAME_GATE } from '@/data/games/careerSponsors';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import { investmentLevel } from '@/lib/utils/careerInvestments';
import { careerPoints } from '@/lib/utils/careerPoints';
import type { ScoutReveal } from '@/lib/utils/careerScouting';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { fameGateApplies } from '@/lib/utils/careerSponsors';
import { fmt, ordinal, plural } from '@/lib/utils/format';

const D = GAMES_UI.career.dossier;
const PARLIAMENT = GAMES_UI.career.parliament;
const SPONSORS = GAMES_UI.career.sponsors;
const INV = GAMES_UI.career.investments;
const TABLE = GAMES_UI.career.table;
const OS = GAMES_UI.career.offseason;

const PERSONALITIES = D.personalities as Record<
  string,
  { name: string; desc: string }
>;

const SECTION = 'flex flex-col gap-1.5 border-t-[3px] border-double border-[#1c1408]/45 pt-2.5';
const SECTION_LABEL =
  'font-sign text-[14px] font-bold uppercase leading-tight tracking-[0.07em] text-slate-300';

function ContractRow({
  name,
  level,
  max,
}: {
  name: string;
  level: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate font-serif text-[12.5px] text-slate-200">
        {name}
      </span>
      <span className="flex shrink-0 items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${
              i < level ? 'bg-amber-400' : 'border border-slate-500'
            }`}
          />
        ))}
      </span>
    </div>
  );
}

// A player's file: a manila folder with his place on the tab, a form inside
// with the photo clipped to it, stamped when he is somebody in particular.
// Somebody else's opens as far as the informant on the payroll reaches: the
// table half is public knowledge, everything under it is what the contract
// bought. The player's own file carries his contract terms and the info
// buttons for sponsors and meters
export default function CharacterDossier({
  character,
  state,
  place,
  reveal,
  scoutLevel,
  isPlayer,
  isRival,
  isPrimeMinister = false,
  year,
  onSponsorInfo,
  onMetersInfo,
  coach,
}: {
  character: DuelCharacter;
  state: CharacterCareerState;
  place: number;
  reveal: ScoutReveal;
  scoutLevel: number;
  isPlayer: boolean;
  isRival: boolean;
  isPrimeMinister?: boolean;
  year?: number;
  onSponsorInfo?: () => void;
  onMetersInfo?: () => void;
  // The coach behind this character in a shared league
  coach?: CoachTagMap[string];
}) {
  const contract = state.sponsor;
  const fameGated =
    isPlayer &&
    !contract &&
    year !== undefined &&
    fameGateApplies(year) &&
    state.fame < SPONSOR_FAME_GATE;
  const personality = state.personality;
  const contracts = INVESTMENT_ORDER.filter(
    (id) => investmentLevel(state, id) > 0,
  );

  return (
    <div className="relative mt-5 text-left">
      <span className="absolute -top-[1.15rem] left-2 rounded-t-[5px] bg-[#c9a35c] px-3 pb-1 pt-0.5 font-sign text-[14px] font-bold uppercase leading-tight tracking-[0.06em] text-[#2a1a0a] shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]">
        {fmt(D.place, { place: ordinal(place) })}
      </span>
      <div className="relative rounded-[4px] bg-[#c9a35c] bg-[repeating-linear-gradient(0deg,transparent_0_5px,rgb(90_60_20/0.05)_5px_6px)] p-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_3px_0_rgb(0_0_0/0.55)] sm:p-2">
        <PaperSheet className="flex flex-col gap-3 p-3">
          <div className="flex items-start gap-3">
            <span className="relative mt-1 shrink-0 -rotate-2 bg-[#fdfaf0] p-1 shadow-[0_2px_2px_rgb(0_0_0/0.45)]">
              <PortraitHead
                character={character}
                className="h-[4.5rem] w-[4.5rem] rounded-[1px]! border-0! shadow-none!"
              />
              <svg
                aria-hidden="true"
                viewBox="0 0 12 30"
                className="absolute -top-2.5 left-2 h-8 w-3 fill-none stroke-[#64748b]"
                strokeWidth="1.4"
              >
                <path d="M9.5 8v15a3.5 3.5 0 0 1-7 0V6a2.5 2.5 0 0 1 5 0v15" />
              </svg>
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="min-w-0 font-serif text-[20px] font-bold leading-tight text-slate-100 [overflow-wrap:anywhere]">
                  {character.name}
                </span>
                {coach && (
                  <SeatTag
                    name={coach.name}
                    color={coach.color}
                    connected={coach.connected}
                    onPaper
                  />
                )}
              </span>
              <span className="grid grid-cols-3 gap-2">
                <DossierField label={TABLE.headers.points}>
                  {careerPoints(state)}
                </DossierField>
                <DossierField label={TABLE.headers.record}>
                  {state.wins}-{state.losses}
                </DossierField>
                <DossierField label={TABLE.headers.titles}>
                  {state.titles}
                </DossierField>
              </span>
            </div>
          </div>
          {(isPlayer || isRival || isPrimeMinister) && (
            <span className="flex flex-wrap items-center gap-2">
              {isPlayer && <DossierStamp tone="self">{D.self}</DossierStamp>}
              {isRival && <DossierStamp tone="rival">{D.rival}</DossierStamp>}
              {isPrimeMinister && (
                <DossierStamp tone="office">{PARLIAMENT.primeMinister}</DossierStamp>
              )}
            </span>
          )}
          <div className="flex flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2">
              {contract ? (
                <span className="inline-flex min-w-0 items-center gap-1.5 font-serif text-[13px] font-bold text-slate-100">
                  <SponsorEmblem
                    sponsorId={contract.sponsorId}
                    className="h-5 w-5 shrink-0"
                  />
                  {(SPONSORS.names as Record<string, string>)[contract.sponsorId]}
                </span>
              ) : (
                <span className="font-serif text-[12.5px] italic text-slate-400">
                  {D.noSponsor}
                </span>
              )}
              {fameGated && (
                <span className="rounded-[2px] border border-amber-300 px-1 font-sign text-[12px] font-bold uppercase leading-tight tracking-[0.05em] text-amber-300">
                  {fmt(SPONSORS.fameGate, { gate: SPONSOR_FAME_GATE })}
                </span>
              )}
              {onSponsorInfo && (
                <InfoButton
                  label={SPONSORS.infoTitle}
                  onClick={onSponsorInfo}
                  className="ml-auto"
                />
              )}
            </span>
            {isPlayer && contract && (
              <span className="font-serif text-[12.5px] leading-snug text-slate-300">
                {plural(
                  SPONSORS.pay,
                  SPONSOR_DEFS[contract.sponsorId].seasonPay,
                  { amount: SPONSOR_DEFS[contract.sponsorId].seasonPay },
                )}{' '}
                {(SPONSORS.perks as Record<string, string>)[contract.sponsorId]}
              </span>
            )}
          </div>

          <div className={SECTION}>
            <MetersPanel
              ch={state}
              title={GAMES_UI.career.meters.infoTitle}
              reveal={reveal}
              onInfo={onMetersInfo}
            />
          </div>

          {reveal.detail && (
            <div className={`${SECTION} gap-2.5`}>
              {personality && PERSONALITIES[personality] && (
                <div className="flex flex-col gap-0.5">
                  <span className={SECTION_LABEL}>{D.temper}</span>
                  <span className="font-serif text-[13px] font-bold text-amber-300">
                    {PERSONALITIES[personality].name}
                  </span>
                  <span className="font-serif text-[12.5px] leading-snug text-slate-300">
                    {PERSONALITIES[personality].desc}
                  </span>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className={SECTION_LABEL}>{D.contracts}</span>
                {contracts.length === 0 ? (
                  <span className="font-serif text-[12.5px] italic text-slate-400">
                    {D.noContracts}
                  </span>
                ) : (
                  contracts.map((id) => (
                    <ContractRow
                      key={id}
                      name={(INV.names as Record<string, string>)[id]}
                      level={investmentLevel(state, id)}
                      max={INVESTMENT_DEFS[id].maxLevel}
                    />
                  ))
                )}
              </div>
              {state.money !== undefined && (
                <div className="flex items-center justify-between gap-2 border-t border-[#1c1408]/30 pt-2">
                  <span className={SECTION_LABEL}>{D.money}</span>
                  <span className="font-sign text-[16px] font-bold tabular-nums text-emerald-300">
                    {plural(OS.cost, state.money, { cost: state.money })}
                  </span>
                </div>
              )}
            </div>
          )}

          {!isPlayer && (
            <div className="flex items-center gap-2 border-t border-dashed border-[#1c1408]/40 pt-2">
              <ActionIcon
                kind="scout"
                className="h-3.5 w-3.5 shrink-0 text-slate-400"
              />
              {scoutLevel > 0 ? (
                <span className="font-sign text-[13px] font-bold uppercase tracking-[0.06em] text-slate-400">
                  {fmt(D.scoutLevel, { level: scoutLevel })}
                </span>
              ) : (
                <span className="font-serif text-[12.5px] italic leading-snug text-slate-400">
                  {D.noScout}
                </span>
              )}
            </div>
          )}
        </PaperSheet>
      </div>
    </div>
  );
}

import ActionIcon from '@/components/icons/ActionIcon';
import InfoButton from '@/components/games/career/InfoButton';
import MetersPanel from '@/components/games/career/MetersPanel';
import PortraitHead from '@/components/games/PortraitHead';
import CoachTag from '@/components/games/career-mp/CoachTag';
import SponsorBadge from '@/components/games/career/SponsorBadge';
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
const SPONSORS = GAMES_UI.career.sponsors;
const INV = GAMES_UI.career.investments;
const TABLE = GAMES_UI.career.table;
const OS = GAMES_UI.career.offseason;

const PERSONALITIES = D.personalities as Record<
  string,
  { name: string; desc: string }
>;

function Chip({
  children,
  tone = 'muted',
}: {
  children: React.ReactNode;
  tone?: 'muted' | 'rival' | 'self';
}) {
  const tones = {
    muted: 'border-sky-200/15 bg-slate-800/60 text-slate-400',
    rival: 'border-red-500/40 bg-red-500/10 text-red-300',
    self: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300',
  };
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

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
      <span className="truncate text-[10px] font-semibold text-slate-300">
        {name}
      </span>
      <span className="flex shrink-0 items-center gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${
              i < level ? 'bg-amber-400' : 'border border-slate-600'
            }`}
          />
        ))}
      </span>
    </div>
  );
}

// A player's file. Somebody else's opens as far as the informant on the
// payroll reaches: the table half is public knowledge, everything under it is
// what the contract bought. The player's own file carries his contract terms
// and the info buttons for sponsors and meters
export default function CharacterDossier({
  character,
  state,
  place,
  reveal,
  scoutLevel,
  isPlayer,
  isRival,
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
    <div className="flex flex-col gap-3 text-left">
      <div className="flex items-start gap-3">
        <PortraitHead character={character} className="h-14 w-14 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-bold text-white">
              {character.name}
            </span>
            {coach && <CoachTag name={coach.name} color={coach.color} connected={coach.connected} />}
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            <Chip>{fmt(D.place, { place: ordinal(place) })}</Chip>
            <Chip>
              {careerPoints(state)} {TABLE.headers.points}
            </Chip>
            <Chip>
              {state.wins}-{state.losses}
            </Chip>
            {state.titles > 0 && (
              <Chip>
                {TABLE.headers.titles} {state.titles}
              </Chip>
            )}
            {isPlayer && <Chip tone="self">{D.self}</Chip>}
            {isRival && <Chip tone="rival">{D.rival}</Chip>}
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            {contract ? (
              <SponsorBadge sponsorId={contract.sponsorId} />
            ) : (
              <span className="text-[10px] text-slate-500">{D.noSponsor}</span>
            )}
            {fameGated && (
              <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-amber-300">
                {SPONSORS.fameGate}
              </span>
            )}
            {onSponsorInfo && (
              <InfoButton label={SPONSORS.infoTitle} onClick={onSponsorInfo} />
            )}
          </span>
          {isPlayer && contract && (
            <span className="text-[10px] leading-snug text-slate-400">
              {plural(SPONSORS.pay, SPONSOR_DEFS[contract.sponsorId].seasonPay, {
                amount: SPONSOR_DEFS[contract.sponsorId].seasonPay,
              })}{' '}
              {(SPONSORS.perks as Record<string, string>)[contract.sponsorId]}
            </span>
          )}
        </div>
      </div>

      <MetersPanel
        ch={state}
        title={GAMES_UI.career.meters.infoTitle}
        reveal={reveal}
        onInfo={onMetersInfo}
      />

      {reveal.detail && (
        <div className="flex flex-col gap-2.5 rounded-2xl border border-sky-200/10 bg-slate-900/40 p-4">
          {personality && PERSONALITIES[personality] && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {D.temper}
              </span>
              <span className="text-xs font-bold text-amber-300">
                {PERSONALITIES[personality].name}
              </span>
              <span className="text-[10px] leading-snug text-slate-400">
                {PERSONALITIES[personality].desc}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              {D.contracts}
            </span>
            {contracts.length === 0 ? (
              <span className="text-[10px] text-slate-500">
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
            <div className="flex items-center justify-between gap-2 border-t border-sky-200/10 pt-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {D.money}
              </span>
              <span className="font-mono text-[11px] font-bold text-emerald-300">
                {plural(OS.cost, state.money, { cost: state.money })}
              </span>
            </div>
          )}
        </div>
      )}

      {!isPlayer && (
        <div className="flex items-center gap-2">
          <ActionIcon
            kind="scout"
            className="h-3.5 w-3.5 shrink-0 text-slate-500"
          />
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            {scoutLevel > 0 ? (
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                {fmt(D.scoutLevel, { level: scoutLevel })}
              </span>
            ) : (
              <span className="text-[10px] leading-snug text-slate-500">
                {D.noScout}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

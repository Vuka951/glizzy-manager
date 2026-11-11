'use client';

import { useState } from 'react';
import ActionReceipt, {
  type ActionReceiptToast,
} from '@/components/games/career/ActionReceipt';
import CareerFramesProvider from '@/components/games/career/CareerFramesProvider';
import CareerButton, {
  type CareerButtonTone,
} from '@/components/games/career/CareerButton';
import CareerToast from '@/components/games/career/CareerToast';
import EffectToast from '@/components/games/career/EffectToast';
import GuardDialog from '@/components/games/career/GuardDialog';
import InvestmentCard from '@/components/games/career/InvestmentCard';
import SabotageDialog from '@/components/games/career/SabotageDialog';
import SponsorModal from '@/components/games/career/SponsorModal';
import TrainingCard from '@/components/games/career/TrainingCard';
import TownCalendarRow from '@/components/games/career/town/TownCalendarRow';
import TownHomeFridge from '@/components/games/career/town/TownHomeFridge';
import TownTrainingBoard from '@/components/games/career/town/TownTrainingBoard';
import TownBankFolder from '@/components/games/career/town/TownBankFolder';
import TownBankOffice from '@/components/games/career/town/TownBankOffice';
import TownBankPanel from '@/components/games/career/town/TownBankPanel';
import GlizacijaPanel from '@/components/games/career/GlizacijaPanel';
import TownDockChooser from '@/components/games/career/town/TownDockChooser';
import TownMediaStudio from '@/components/games/career/town/TownMediaStudio';
import TownMediaTape from '@/components/games/career/town/TownMediaTape';
import TownMeterStrip from '@/components/games/career/town/TownMeterStrip';
import TownPlayerCard from '@/components/games/career/town/TownPlayerCard';
import TownSponsorChip from '@/components/games/career/town/TownSponsorChip';
import TownChooserCorridor from '@/components/games/career/town/TownChooserCorridor';
import TownChooserOption from '@/components/games/career/town/TownChooserOption';
import ActionIcon from '@/components/icons/ActionIcon';
import PreviewTriggerButton from '@/components/preview/PreviewTriggerButton';
import PreviewWoodFrame from '@/components/preview/PreviewWoodFrame';
import { sampleCareer } from '@/components/preview/sampleCareer';
import { TRAINING_DEFS } from '@/data/games/careerTraining';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { GAMES_UI } from '@/data/games/locale';
import type { TownBuildingId } from '@/lib/constants/townLayout';
import { newCharacterState } from '@/lib/utils/careerMeters';
import { plural } from '@/lib/utils/format';
import type { CharacterCareerState, SponsorId } from '@/lib/utils/careerSave';

const TOWN = GAMES_UI.career.town;
const ACT = GAMES_UI.career.actions;
const noop = () => undefined;

const MEDIA_DESK = (
  <TownMediaStudio>
    <TownMediaTape
      kind="interview"
      title={ACT.mediaInterview}
      desc={plural(ACT.mediaInterviewDesc, 131, { pay: 131, fameMin: 10, fameMax: 16, ego: 5, amb: 5, appetite: 4, stress: 4 })}
      pay={131}
      label={GAMES_UI.career.offseason.spendMonth}
      onPlay={noop}
    />
    <TownMediaTape
      kind="scandal"
      title={ACT.mediaScandal}
      desc={plural(ACT.mediaScandalDesc, 263, {
        pay: 263,
        fameMin: 14,
        fameMax: 26,
        ego: 9,
        amb: 5,
        appetite: 4,
        stress: 8,
        backfire: 35,
        backfireFameMin: -26,
        backfireFameMax: -14,
        backfireStress: 15,
      })}
      pay={263}
      label={GAMES_UI.career.offseason.spendMonth}
      onPlay={noop}
    />
  </TownMediaStudio>
);

const PLACE_LABEL: Record<TownBuildingId, keyof typeof TOWN.labels> = {
  cafe: 'cafe',
  security: 'guard',
  bank: 'bank',
  media: 'media',
  training: 'training',
  home: 'rest',
  dock: 'dock',
  parliament: 'parliament',
  post: 'post',
  kiosk: 'paper',
  billboard: 'table',
  poll: 'poll',
};
const PLACES = Object.keys(PLACE_LABEL) as TownBuildingId[];

const SAMPLE_RECEIPTS: ActionReceiptToast[] = [
  {
    title: 'Security hired, stops 60% of attacks',
    lines: [
      { text: 'Appetite +4', good: true },
      { text: 'Ego +7', good: true },
      { text: '-211 glizars', good: false },
    ],
    icon: 'guard',
    ok: true,
  },
  {
    title: 'Training failed, the stomach rebelled',
    lines: [
      { text: 'Cholesterol +12', good: false },
      { text: '-90 glizars', good: false },
    ],
    icon: 'training',
    ok: false,
  },
  { title: 'Rest at home', lines: [], icon: 'rest', ok: true },
];

const BUTTON_TONES: CareerButtonTone[] = ['neutral', 'buy', 'danger', 'quiet'];

function cardState(
  slug: string,
  kind: 'fresh' | 'peak' | 'danger',
): CharacterCareerState {
  const base = newCharacterState(slug);
  if (kind === 'fresh') return base;
  if (kind === 'peak') {
    return {
      ...base,
      stress: 12,
      appetite: 50,
      ambition: 88,
      ego: 55,
      fame: 92,
      livesCap: { level: 3, progress: 0 },
      njuh: { level: 4, progress: 0 },
      nutrition: { level: 2, progress: 2 },
      fanSkill: { level: 1, progress: 1 },
    };
  }
  return {
    ...base,
    stress: 91,
    appetite: 12,
    ambition: 9,
    ego: 82,
    fame: 31,
    livesCap: { level: 1, progress: 2 },
    njuh: { level: 0, progress: 1 },
  };
}

export default function TownPanelsPreview({ characters }: { characters: DuelCharacter[] }) {
  const [place, setPlace] = useState<TownBuildingId | null>(null);
  const [sponsor, setSponsor] = useState<SponsorId | null>(null);
  const career = sampleCareer({ slugs: characters.map((c) => c.slug) });
  const lead = career.characters[career.playerSlug];
  const midWindow = {
    ...career,
    slotsUsed: 1,
    slotLog: [{ kind: 'rest' as const }],
  };

  return (
    <CareerFramesProvider>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          {(['md', 'sm'] as const).map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-2">
              {BUTTON_TONES.map((tone) => (
                <CareerButton key={tone} tone={tone} size={size} onClick={noop}>
                  {tone === 'buy' ? 'Pay 60 glizars' : tone === 'danger' ? 'Spend the month' : tone === 'quiet' ? 'Cancel' : 'Continue'}
                </CareerButton>
              ))}
              <CareerButton size={size} disabled onClick={noop}>
                Not enough glizars
              </CareerButton>
            </div>
          ))}
          <div className="w-full max-w-sm">
            <CareerButton full onClick={noop}>
              Continue
            </CareerButton>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3">
          <TownCalendarRow career={midWindow} receipts={SAMPLE_RECEIPTS} />
          <div className="w-[358px]">
            <TownCalendarRow career={career} compact receipts={[]} />
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-4">
          {(['fresh', 'peak', 'danger'] as const).map((kind) => (
            <div key={kind} className="w-40 xl:w-48">
              <TownPlayerCard ch={cardState(career.playerSlug, kind)} onOpen={noop} />
            </div>
          ))}
          <div className="flex w-full max-w-[24rem] flex-col gap-2">
            {(['fresh', 'peak', 'danger'] as const).map((kind, i) => (
              <div key={kind} className="flex items-center gap-2">
                <TownSponsorChip
                  sponsorId={([null, 'blue', 'red'] as const)[i]}
                  onOpen={noop}
                />
                <div className="min-w-0 flex-1">
                  <TownMeterStrip ch={cardState(career.playerSlug, kind)} onOpen={noop} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <div className="flex w-72 flex-col gap-2 xl:w-80">
            {SAMPLE_RECEIPTS.map((receipt) => (
              <ActionReceipt key={receipt.title} toast={receipt} onDismiss={noop} />
            ))}
          </div>
          <div className="flex flex-col items-end gap-2">
            <CareerToast tone="success">You made the main draw.</CareerToast>
            <CareerToast tone="danger">You cannot bet against yourself.</CareerToast>
            <EffectToast
              title="The scandal leaked"
              lines={[
                { text: 'Fame -8', good: false },
                { text: 'Ego +3', good: true },
              ]}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <PreviewWoodFrame>
            <TownChooserCorridor>
              <TownChooserOption
                icon={<ActionIcon kind="sabotage" className="h-8 w-8" />}
                title={GAMES_UI.career.sabotage.action}
                sub="2 jobs"
                tone="red"
                onClick={noop}
              />
            </TownChooserCorridor>
          </PreviewWoodFrame>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <PreviewWoodFrame>
            <TownDockChooser
              islandDesc={GAMES_UI.career.actions.islandDesc}
              disabled={false}
              onIsland={noop}
            />
          </PreviewWoodFrame>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <PreviewWoodFrame size="wide">
            <TownTrainingBoard>
              <TrainingCard
                def={TRAINING_DEFS.stomach}
                stat={lead.livesCap}
                maxLevel={TRAINING_DEFS.stomach.maxLevel}
                overtrainPct={25}
                seasonPct={-6}
                affordable
                disabled={false}
                onTrain={noop}
              />
              <TrainingCard
                def={TRAINING_DEFS.sniffer}
                stat={{ level: 4, progress: 0 }}
                maxLevel={TRAINING_DEFS.sniffer.maxLevel}
                overtrainPct={0}
                affordable
                disabled={false}
                onTrain={noop}
              />
              <TrainingCard
                def={TRAINING_DEFS.nutrition}
                stat={{ level: 1, progress: 2 }}
                maxLevel={TRAINING_DEFS.nutrition.maxLevel}
                overtrainPct={50}
                gliziPct={150}
                partyPct={-20}
                affordable={false}
                disabled={false}
                onTrain={noop}
              />
              <TrainingCard
                def={TRAINING_DEFS.sparring}
                stat={null}
                maxLevel={null}
                overtrainPct={0}
                affordable
                disabled
                onTrain={noop}
              />
            </TownTrainingBoard>
          </PreviewWoodFrame>
          {[true, false].map((open) => (
            <PreviewWoodFrame key={String(open)}>
              <TownHomeFridge
                ch={lead}
                islandAvailable={open}
                slotsFull={!open}
                onRest={noop}
                onIsland={noop}
              />
            </PreviewWoodFrame>
          ))}
          <PreviewWoodFrame size="wide" pad>
            <TownBankFolder>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <InvestmentCard id="security" level={1} balance={400} onBuy={noop} />
                <InvestmentCard id="spa" level={0} balance={10} gliziPct={150} onBuy={noop} />
                <InvestmentCard id="assistant" level={3} balance={400} onBuy={noop} />
              </div>
            </TownBankFolder>
          </PreviewWoodFrame>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <PreviewWoodFrame size="wide" pad>
            <SabotageDialog
              career={career}
              characters={characters}
              plotsBooked={1}
              seasonPct={-6}
              onConfirm={noop}
              onCancel={noop}
            />
          </PreviewWoodFrame>
          <PreviewWoodFrame pad>
            <GuardDialog
              balance={320}
              standingPct={10}
              place={1}
              positionPct={50}
              gliziPct={150}
              seasonPct={-6}
              onConfirm={noop}
              onCancel={noop}
            />
          </PreviewWoodFrame>
          <PreviewWoodFrame>{MEDIA_DESK}</PreviewWoodFrame>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {PLACES.map((id) => (
              <PreviewTriggerButton
                key={id}
                label={TOWN.labels[PLACE_LABEL[id]]}
                active={place === id}
                onClick={() => setPlace(id)}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {([null, 'blue', 'green', 'yellow', 'red'] as const).map((id) => (
              <PreviewTriggerButton
                key={id ?? 'none'}
                label={id ? GAMES_UI.career.sponsors.names[id] : GAMES_UI.career.sponsors.none}
                active={sponsor === id}
                onClick={() => setSponsor(id)}
              />
            ))}
          </div>
        </div>
        {place && (
          <SponsorModal
            sponsorId={sponsor}
            title={TOWN.labels[PLACE_LABEL[place]]}
            wide={place === 'cafe' || place === 'bank'}
            flush={place !== 'security' && place !== 'cafe'}
            onClose={() => setPlace(null)}
          >
            {place === 'security' ? (
              <GuardDialog balance={320} standingPct={0} onConfirm={noop} onCancel={() => setPlace(null)} />
            ) : place === 'media' ? (
              MEDIA_DESK
            ) : place === 'cafe' ? (
              <SabotageDialog
                career={career}
                characters={characters}
                onConfirm={noop}
                onCancel={() => setPlace(null)}
              />
            ) : place === 'bank' ? (
              <TownBankPanel
                trend="up"
                glizzflationSub="▲+12%"
                officeSub={null}
                glizzflation={<GlizacijaPanel career={career} onBet={noop} onCancelBet={noop} />}
                invest={
                  sponsor ? (
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <InvestmentCard id="security" level={1} balance={400} onBuy={noop} />
                      <InvestmentCard id="spa" level={0} balance={10} gliziPct={150} onBuy={noop} />
                    </div>
                  ) : null
                }
                office={
                  <TownBankOffice
                    career={{
                      ...career,
                      characters: {
                        ...career.characters,
                        [career.playerSlug]: {
                          ...career.characters[career.playerSlug],
                          sponsor: sponsor ? { sponsorId: sponsor } : null,
                        },
                      },
                    }}
                    onBorrow={noop}
                    onRepay={noop}
                  />
                }
              />
            ) : (
              <TownChooserCorridor>
                <TownChooserOption
                  icon={<ActionIcon kind="sabotage" className="h-8 w-8" />}
                  title={GAMES_UI.career.sabotage.action}
                  sub={null}
                  disabled
                  tone="red"
                  onClick={noop}
                />
              </TownChooserCorridor>
            )}
          </SponsorModal>
        )}
      </div>
    </CareerFramesProvider>
  );
}

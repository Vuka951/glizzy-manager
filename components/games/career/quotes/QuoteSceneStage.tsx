import type { ComponentType } from 'react';
import BigBrainScene from '@/components/games/career/quotes/BigBrainScene';
import ChickenDinnerScene from '@/components/games/career/quotes/ChickenDinnerScene';
import CloseCallScene from '@/components/games/career/quotes/CloseCallScene';
import CoalitionReconciliationScene from '@/components/games/career/quotes/CoalitionReconciliationScene';
import CoalitionSmallChairScene from '@/components/games/career/quotes/CoalitionSmallChairScene';
import CoalitionThreeWayScene from '@/components/games/career/quotes/CoalitionThreeWayScene';
import CrowdSurfScene from '@/components/games/career/quotes/CrowdSurfScene';
import DressedUpScene from '@/components/games/career/quotes/DressedUpScene';
import EggOnTrophyScene from '@/components/games/career/quotes/EggOnTrophyScene';
import ElectionAllChannelsScene from '@/components/games/career/quotes/ElectionAllChannelsScene';
import ElectionFlagSobScene from '@/components/games/career/quotes/ElectionFlagSobScene';
import ElectionFridgeScene from '@/components/games/career/quotes/ElectionFridgeScene';
import ElectionGlizzyRallyScene from '@/components/games/career/quotes/ElectionGlizzyRallyScene';
import FlashbackScene from '@/components/games/career/quotes/FlashbackScene';
import ForfeitWinScene from '@/components/games/career/quotes/ForfeitWinScene';
import HitAndRunScene from '@/components/games/career/quotes/HitAndRunScene';
import YellowRunOverScene from '@/components/games/career/quotes/YellowRunOverScene';
import LossStreakScene from '@/components/games/career/quotes/LossStreakScene';
import PhotoFinishScene from '@/components/games/career/quotes/PhotoFinishScene';
import PilloryScene from '@/components/games/career/quotes/PilloryScene';
import RunnerUpScene from '@/components/games/career/quotes/RunnerUpScene';
import SponsorDealScene from '@/components/games/career/quotes/SponsorDealScene';
import SpoonBonkScene from '@/components/games/career/quotes/SpoonBonkScene';
import StreakBrokenScene from '@/components/games/career/quotes/StreakBrokenScene';
import TallyWallScene from '@/components/games/career/quotes/TallyWallScene';
import TaxOfficeScene from '@/components/games/career/quotes/TaxOfficeScene';
import TrophyFoundScene from '@/components/games/career/quotes/TrophyFoundScene';
import TruckCrashScene from '@/components/games/career/quotes/TruckCrashScene';
import TvRageScene from '@/components/games/career/quotes/TvRageScene';
import VillainLaughScene from '@/components/games/career/quotes/VillainLaughScene';
import WindowEscapeScene from '@/components/games/career/quotes/WindowEscapeScene';
import WoodenSpoonScene from '@/components/games/career/quotes/WoodenSpoonScene';
import WreckedRoomScene from '@/components/games/career/quotes/WreckedRoomScene';
import type { QuoteSceneId } from '@/lib/constants/quoteCutscenes';
import type { QuoteSceneProps } from '@/lib/types/quoteScenes';

export type QuoteStageProps = {
  scene: QuoteSceneId;
  speaker: string;
  other?: string;
  third?: string;
  variant?: string;
};

// One component per scene id; two ids may share a component and tell it
// apart by the variant prop
const SCENES: Record<QuoteSceneId, ComponentType<QuoteSceneProps>> = {
  'streak-broken': StreakBrokenScene,
  'opponent-burst': VillainLaughScene,
  'opponent-removed': HitAndRunScene,
  'favorite-wins': DressedUpScene,
  'underdog-wins': SpoonBonkScene,
  'photo-finish': PhotoFinishScene,
  'loss-collapse': WreckedRoomScene,
  'first-match-exit': FlashbackScene,
  'upset-loss': TvRageScene,
  'heavy-loss-escape': WindowEscapeScene,
  'heavy-loss-pillory': PilloryScene,
  'losing-streak': TallyWallScene,
  'tax-office': TaxOfficeScene,
  'champion-trophy': TrophyFoundScene,
  'champion-chicken': ChickenDinnerScene,
  'champion-egg': EggOnTrophyScene,
  'champion-brain': BigBrainScene,
  'champion-crowd': CrowdSurfScene,
  'runner-up': RunnerUpScene,
  'wooden-spoon': WoodenSpoonScene,
  'sponsor-signed': SponsorDealScene,
  'price-crash': TruckCrashScene,
  'loss-streak': LossStreakScene,
  'close-call': CloseCallScene,
  'forfeit-win': ForfeitWinScene,
  'yellow-run-over': YellowRunOverScene,
  'election-flag-sob': ElectionFlagSobScene,
  'election-fridge': ElectionFridgeScene,
  'election-glizzy-rally': ElectionGlizzyRallyScene,
  'election-all-channels': ElectionAllChannelsScene,
  'coalition-small-chair': CoalitionSmallChairScene,
  'coalition-reconciliation': CoalitionReconciliationScene,
  'coalition-three-way': CoalitionThreeWayScene,
};

// A playback names the other side whenever its scene stages one. A scene
// that stages only the speaker never reads it, so the speaker fills the slot
export default function QuoteSceneStage({
  scene,
  speaker,
  other,
  third,
  variant,
}: QuoteStageProps) {
  const Scene = SCENES[scene];
  return (
    <Scene
      speaker={speaker}
      other={other ?? speaker}
      third={third}
      variant={variant}
    />
  );
}

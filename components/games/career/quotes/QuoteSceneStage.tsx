import type { ComponentType } from 'react';
import BigBrainScene from '@/components/games/career/quotes/BigBrainScene';
import ChickenDinnerScene from '@/components/games/career/quotes/ChickenDinnerScene';
import CrowdSurfScene from '@/components/games/career/quotes/CrowdSurfScene';
import DressedUpScene from '@/components/games/career/quotes/DressedUpScene';
import EggOnTrophyScene from '@/components/games/career/quotes/EggOnTrophyScene';
import FlashbackScene from '@/components/games/career/quotes/FlashbackScene';
import HitAndRunScene from '@/components/games/career/quotes/HitAndRunScene';
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
};

// A playback names the other side whenever its scene stages one. A scene
// that stages only the speaker never reads it, so the speaker fills the slot
export default function QuoteSceneStage({
  scene,
  speaker,
  other,
  variant,
}: QuoteStageProps) {
  const Scene = SCENES[scene];
  return <Scene speaker={speaker} other={other ?? speaker} variant={variant} />;
}

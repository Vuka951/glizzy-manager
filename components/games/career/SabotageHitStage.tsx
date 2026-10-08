import HitBlockedScene from '@/components/games/career/scenes/HitBlockedScene';
import HitBribeScene from '@/components/games/career/scenes/HitBribeScene';
import HitCatfishScene, {
  type CatfishVariant,
} from '@/components/games/career/scenes/HitCatfishScene';
import HitCurseScene from '@/components/games/career/scenes/HitCurseScene';
import HitPoisonScene, {
  type PoisonVariant,
} from '@/components/games/career/scenes/HitPoisonScene';
import HitRaidScene, {
  type RaidVariant,
} from '@/components/games/career/scenes/HitRaidScene';
import HitRumorScene from '@/components/games/career/scenes/HitRumorScene';
import type {
  SabotageHitSceneId,
  SabotageHitSceneProps,
} from '@/lib/constants/careerScenes';

// Picks the scene for a story the paper printed about your own man. The
// families share a stage and swap the prop that names the lore variant
export default function SabotageHitStage({
  scene,
  ...props
}: SabotageHitSceneProps & { scene: SabotageHitSceneId }) {
  if (scene === 'hit-curse') return <HitCurseScene {...props} />;
  if (scene === 'hit-bribe') return <HitBribeScene {...props} />;
  if (scene === 'hit-rumor') return <HitRumorScene {...props} />;
  if (scene === 'hit-blocked') return <HitBlockedScene {...props} />;
  if (scene.startsWith('hit-poison-')) {
    return (
      <HitPoisonScene
        {...props}
        variant={scene.slice('hit-poison-'.length) as PoisonVariant}
      />
    );
  }
  if (scene.startsWith('hit-catfish-')) {
    return (
      <HitCatfishScene
        {...props}
        variant={scene.slice('hit-catfish-'.length) as CatfishVariant}
      />
    );
  }
  return (
    <HitRaidScene
      {...props}
      variant={scene.slice('hit-raid-'.length) as RaidVariant}
    />
  );
}

import FastScene from '@/components/games/career/scenes/FastScene';
import GuardScene from '@/components/games/career/scenes/GuardScene';
import InvestScene from '@/components/games/career/scenes/InvestScene';
import IslandScene from '@/components/games/career/scenes/IslandScene';
import MediaInterviewScene from '@/components/games/career/scenes/MediaInterviewScene';
import MediaScandalScene from '@/components/games/career/scenes/MediaScandalScene';
import RestScene from '@/components/games/career/scenes/RestScene';
import SabotageScene from '@/components/games/career/scenes/SabotageScene';
import TrainingFansScene from '@/components/games/career/scenes/TrainingFansScene';
import TrainingNutritionScene from '@/components/games/career/scenes/TrainingNutritionScene';
import TrainingSnifferScene from '@/components/games/career/scenes/TrainingSnifferScene';
import TrainingSparringScene from '@/components/games/career/scenes/TrainingSparringScene';
import TrainingStomachScene from '@/components/games/career/scenes/TrainingStomachScene';
import type { InvestmentId } from '@/data/games/careerInvestments';
import type {
  ActionSceneId,
  ActionSceneProps,
} from '@/lib/constants/careerScenes';
import type { SabotageTier } from '@/lib/utils/careerSave';

// Picks the cutscene for an action id. Investments and sabotage share one
// scene each and only swap the prop in the middle of the table
export default function ActionSceneStage({
  scene,
  ...props
}: ActionSceneProps & { scene: ActionSceneId }) {
  if (scene === 'training-stomach') return <TrainingStomachScene {...props} />;
  if (scene === 'training-sniffer') return <TrainingSnifferScene {...props} />;
  if (scene === 'training-nutrition')
    return <TrainingNutritionScene {...props} />;
  if (scene === 'training-fans') return <TrainingFansScene {...props} />;
  if (scene === 'training-sparring')
    return <TrainingSparringScene {...props} />;
  if (scene === 'rest') return <RestScene {...props} />;
  if (scene === 'fast') return <FastScene {...props} />;
  if (scene === 'island') return <IslandScene {...props} />;
  if (scene === 'media-interview') return <MediaInterviewScene {...props} />;
  if (scene === 'media-scandal') return <MediaScandalScene {...props} />;
  if (scene === 'guard') return <GuardScene {...props} />;
  if (scene.startsWith('invest-')) {
    return (
      <InvestScene
        {...props}
        investmentId={scene.slice('invest-'.length) as InvestmentId}
      />
    );
  }
  return (
    <SabotageScene
      {...props}
      tier={Number(scene.slice('sabotage-'.length)) as SabotageTier}
    />
  );
}

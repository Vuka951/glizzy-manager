import { INVESTMENT_ICON_BY_ID } from '@/components/games/career/InvestmentCard';
import ActionIcon from '@/components/icons/ActionIcon';
import BoltIcon from '@/components/icons/BoltIcon';
import BowlIcon from '@/components/icons/BowlIcon';
import HandcuffsIcon from '@/components/icons/HandcuffsIcon';
import HeartbreakIcon from '@/components/icons/HeartbreakIcon';
import Icon from '@/components/icons/Icon';
import TrainingIcon from '@/components/icons/TrainingIcon';
import type { InvestmentId } from '@/data/games/careerInvestments';
import type { TrainingId } from '@/data/games/careerTraining';
import type { ActionSceneId } from '@/lib/constants/careerScenes';

// The icon of the exact thing the month went on, the same one the player
// clicked in the shop, rather than the rail category it came from
export default function ActionSceneIcon({
  scene,
  className = 'h-6 w-6',
}: {
  scene: ActionSceneId;
  className?: string;
}) {
  if (scene.startsWith('training-')) {
    return (
      <TrainingIcon
        id={scene.slice('training-'.length) as TrainingId}
        className={className}
      />
    );
  }
  if (scene === 'rest') return <ActionIcon kind="rest" className={className} />;
  if (scene === 'fast') return <BowlIcon className={className} />;
  if (scene === 'island')
    return <ActionIcon kind="island" className={className} />;
  if (scene === 'media-interview')
    return <Icon name="microphone" className={className} />;
  if (scene === 'media-scandal') return <BoltIcon className={className} />;
  if (scene === 'guard')
    return <ActionIcon kind="guard" className={className} />;
  if (scene.startsWith('invest-')) {
    return (
      <ActionIcon
        kind={
          INVESTMENT_ICON_BY_ID[scene.slice('invest-'.length) as InvestmentId]
        }
        className={className}
      />
    );
  }
  if (scene === 'sabotage-2') return <HeartbreakIcon className={className} />;
  if (scene === 'sabotage-3') return <HandcuffsIcon className={className} />;
  return <ActionIcon kind="sabotage" className={className} />;
}

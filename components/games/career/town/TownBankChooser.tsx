import TownChooserCorridor from '@/components/games/career/town/TownChooserCorridor';
import TownChooserOption from '@/components/games/career/town/TownChooserOption';
import ActionIcon from '@/components/icons/ActionIcon';
import GlizzyIcon from '@/components/icons/GlizzyIcon';
import TrendIcon from '@/components/icons/TrendIcon';
import { GAMES_UI } from '@/data/games/locale';

const TOWN = GAMES_UI.career.town;

// The bank's offices: the Glizzflation chart with the exchange, the sponsor's
// standing contracts while there is a contract, and the counter
export default function TownBankChooser({
  trend,
  glizzflationSub,
  officeSub,
  invest,
  onGlizzflation,
  onInvest,
  onOffice,
}: {
  trend: 'up' | 'flat' | 'down';
  glizzflationSub: string;
  officeSub: string | null;
  invest: boolean;
  onGlizzflation: () => void;
  onInvest: () => void;
  onOffice: () => void;
}) {
  return (
    <TownChooserCorridor fill>
      <TownChooserOption
        icon={<TrendIcon direction={trend} className="h-8 w-8" />}
        title={TOWN.bankGlizzflation}
        sub={glizzflationSub}
        tone="sky"
        onClick={onGlizzflation}
      />
      {invest && (
        <TownChooserOption
          icon={<ActionIcon kind="invest" className="h-8 w-8" />}
          title={TOWN.bankInvest}
          sub={null}
          tone="gold"
          onClick={onInvest}
        />
      )}
      <TownChooserOption
        icon={<GlizzyIcon variant={3} className="h-8 w-8" />}
        title={TOWN.bankOffice}
        sub={officeSub}
        tone={officeSub ? 'red' : 'green'}
        onClick={onOffice}
      />
    </TownChooserCorridor>
  );
}

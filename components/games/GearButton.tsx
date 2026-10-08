import GearIcon from '@/components/icons/GearIcon';
import { GAMES_UI } from '@/data/games/locale';

export default function GearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={GAMES_UI.shared.settings}
      className="flex items-center justify-center rounded-full border border-sky-200/15 bg-slate-900/70 p-1.5 text-slate-300 backdrop-blur-sm transition hover:border-sky-200/40 hover:text-white"
    >
      <GearIcon />
    </button>
  );
}

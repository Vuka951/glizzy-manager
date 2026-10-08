import Icon from '@/components/icons/Icon';
import { GAMES_UI } from '@/data/games/locale';

// A sponsor or a mood can recolor the panel: the frame, the title, a wash
// behind the content and a ribbon along the top edge
export type GameModalAccent = {
  frame: string;
  title: string;
  wash: string;
  stripe: string;
};

// Overlay panel every game opens its secondary screens in: settings, info
// and purchase dialogs sit on top of the scene instead of stacking below it
export default function GameModal({
  title,
  wide = false,
  titleExtra,
  headerExtra,
  accent,
  badge,
  onClose,
  children,
}: {
  title: string;
  wide?: boolean;
  // Sits beside the title; headerExtra sits at the far right by the close
  titleExtra?: React.ReactNode;
  headerExtra?: React.ReactNode;
  accent?: GameModalAccent;
  badge?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <button
        aria-label={GAMES_UI.shared.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-950/75 backdrop-blur-sm"
      />
      <div
        className={`relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-2xl border bg-slate-900 shadow-2xl animate-[bubblein_0.25s_ease-out] ${
          accent ? accent.frame : 'border-frost-border/40'
        } ${wide ? 'max-w-2xl' : 'max-w-sm'}`}
      >
        <div className="relative p-4">
          {accent && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <span className={`absolute inset-0 ${accent.wash}`} />
              <span
                className={`absolute inset-x-0 top-0 h-1 opacity-80 ${accent.stripe}`}
              />
            </span>
          )}
          <div className="relative mb-3 flex items-center gap-2">
            {badge && (
              <span className="flex shrink-0 items-center">{badge}</span>
            )}
            <span
              className={`shrink-0 text-[10px] font-bold uppercase tracking-[0.3em] ${
                accent ? accent.title : 'text-sky-400'
              }`}
            >
              {title}
            </span>
            {titleExtra && (
              <span className="flex shrink-0 items-center">{titleExtra}</span>
            )}
            {headerExtra && (
              <span className="ml-auto min-w-0">{headerExtra}</span>
            )}
            <button
              onClick={onClose}
              aria-label={GAMES_UI.shared.close}
              className={`shrink-0 rounded-full border border-sky-200/15 bg-slate-800/60 p-1.5 text-slate-400 transition hover:border-sky-200/40 hover:text-white ${
                headerExtra ? '' : 'ml-auto'
              }`}
            >
              <Icon name="close" className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}

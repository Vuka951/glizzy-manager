import { useEffect, useState, type RefObject } from 'react';
import FullscreenEnterIcon from '@/components/icons/FullscreenEnterIcon';
import FullscreenExitIcon from '@/components/icons/FullscreenExitIcon';
import { GAMES_UI } from '@/data/games/locale';

export default function FullscreenButton({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onChange = () => setActive(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      targetRef.current?.requestFullscreen().catch(() => {});
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={active ? GAMES_UI.shared.fullscreen.exit : GAMES_UI.shared.fullscreen.enter}
      title={active ? GAMES_UI.shared.fullscreen.exit : GAMES_UI.shared.fullscreen.enter}
      className="flex items-center rounded-full border border-sky-200/15 bg-slate-900/70 p-1.5 text-slate-300 backdrop-blur-sm transition hover:border-sky-200/40 hover:text-white"
    >
      {active ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
    </button>
  );
}

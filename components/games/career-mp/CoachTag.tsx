import { GAMES_UI } from '@/data/games/locale';
import {
  COACH_COLOR_CLASSES,
  type CoachColor,
} from '@/lib/constants/careerMp';

// The pill that names the coach behind a character, in the coach's room
// color; a coach who dropped off the room shows grey
export default function CoachTag({
  name,
  color,
  dense = false,
  connected = true,
  onPaper = false,
}: {
  name: string;
  color: CoachColor;
  dense?: boolean;
  connected?: boolean;
  // On the newspaper's bright paper the pill is solid ink, not a tint
  onPaper?: boolean;
}) {
  return (
    <span
      title={connected ? name : `${name} (${GAMES_UI.careerMp.coachBar.offline})`}
      className={`inline-flex max-w-24 shrink-0 items-center truncate rounded-full border font-bold uppercase tracking-wider ${
        dense ? 'px-1 text-[7px] leading-3' : 'px-1.5 py-px text-[8px]'
      } ${
        !connected
          ? onPaper
            ? 'border-slate-400 bg-slate-200 text-slate-500 line-through'
            : 'border-slate-600 bg-slate-800/60 text-slate-500 line-through'
          : onPaper
            ? `border-transparent text-slate-950 ${COACH_COLOR_CLASSES[color].dot}`
            : COACH_COLOR_CLASSES[color].pill
      }`}
    >
      {name}
    </span>
  );
}

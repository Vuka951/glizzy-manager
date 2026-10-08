import Icon from '@/components/icons/Icon';
import { GAMES_UI } from '@/data/games/locale';
import type { IconName } from '@/lib/constants/icons';
import { fmt, ordinal } from '@/lib/utils/format';

type ResultIcon = IconName | 'medal';

export default function CalendarResultBadge({ place }: { place: number }) {
  let label: string;
  let icon: ResultIcon;
  let color: string;

  if (place === 1) {
    label = fmt(GAMES_UI.career.offseason.yearCalendar.yourPlace, {
      place: ordinal(place),
    });
    icon = 'trophy';
    color = 'text-yellow-300';
  } else if (place === 2) {
    label = fmt(GAMES_UI.career.offseason.yearCalendar.yourPlace, {
      place: ordinal(place),
    });
    icon = 'medal';
    color = 'text-slate-200';
  } else if (place === 3) {
    label = fmt(GAMES_UI.career.offseason.yearCalendar.yourPlace, {
      place: ordinal(place),
    });
    icon = 'medal';
    color = 'text-orange-300';
  } else if (place === 4) {
    label = GAMES_UI.career.offseason.yearCalendar.semifinal;
    icon = 'star';
    color = 'text-violet-300';
  } else if (place >= 5 && place <= 8) {
    label = GAMES_UI.career.offseason.yearCalendar.quarterfinal;
    icon = 'swords';
    color = 'text-sky-300';
  } else {
    label = GAMES_UI.career.offseason.yearCalendar.roundOf16;
    icon = 'arrowDown';
    color = 'text-slate-300';
  }

  return (
    <span
      data-calendar-result={place}
      className={`flex max-w-full items-center justify-center gap-1.5 text-[10px] font-semibold leading-tight ${color}`}
    >
      {icon === 'medal' ? (
        <span className="relative h-4 w-4 shrink-0" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M5 2h6l1 6-5 3L5 2Zm8 0h6l-2 9-5-3 1-6Z" />
            <circle cx="12" cy="15.5" r="6.5" />
          </svg>
          <span className="absolute inset-x-0 bottom-0.5 text-center text-[7px] font-black leading-none text-slate-950">
            {place}
          </span>
        </span>
      ) : (
        <Icon name={icon} className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="text-center">{label}</span>
    </span>
  );
}

import TownChooserNotice from '@/components/games/career/town/TownChooserNotice';
import {
  TOWN_CHOOSER_TONES,
  type TownChooserFace,
} from '@/lib/constants/townChooser';

const PANEL_ON = 'border-[#5a3719] shadow-[inset_0_2px_0_rgba(0,0,0,0.25)]';
const PANEL_OFF = 'border-[#2a1c11]';

// One of the doors a building's chooser offers: an old wooden door in a
// painted architrave, a lit fanlight over it and an enamel shade hanging from
// the ceiling. An enamel name plate high on the leaf, the room's sign on a
// round enamel disc, two sunken panels, a brass knob at hand height and warm
// light under the door. The notice lies on the runner in front, never over
// the knob. A door that cannot be used is dark wood with a grey plate, no
// light and a padlock on the knob. Its size comes from the corridor
export default function TownChooserOption({
  icon,
  title,
  desc,
  sub,
  disabled = false,
  tone,
  onClick,
}: TownChooserFace) {
  const T = TOWN_CHOOSER_TONES[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-(--door-w) flex-col items-center gap-1.5 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fcd34d] disabled:cursor-not-allowed"
    >
      <span className="relative block w-full">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-[100vw] bottom-0 top-[58%] -z-10 border-t-[3px] border-[#26362c] bg-[#3d5244]"
        />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-full left-1/2 flex -translate-x-1/2 flex-col items-center pb-[calc(var(--door-h)*0.035)]">
          <span className="h-[100vh] w-0.5 bg-[#2a2012]" />
          <span
            className={`h-3.5 w-14 rounded-t-[14px] shadow-[0_1px_0_#2a2012] ${disabled ? 'bg-[#44403c]' : 'bg-[#14532d]'}`}
          />
          <span
            className={`h-1 w-9 rounded-b-full ${disabled ? 'bg-[#57534e]' : 'bg-[#fef3c7] shadow-[0_0_12px_3px_rgb(254_243_199/0.7)]'}`}
          />
        </span>
        {!disabled && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-[45%] -top-[22%] h-[75%] -z-10 bg-[radial-gradient(closest-side,rgb(255_236_179/0.32),transparent)]"
          />
        )}
        <span
          className={`relative flex h-(--door-h) w-full flex-col rounded-t-[8px] border-[6px] border-b-0 p-[3px] shadow-[0_3px_0_rgba(0,0,0,0.35)] transition duration-200 group-enabled:group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:group-enabled:group-hover:translate-y-0 ${
            disabled ? 'border-[#57534e] bg-[#292524]' : 'border-[#e7e0d4] bg-[#cfc6b6]'
          }`}
        >
          <span
            aria-hidden="true"
            className={`mb-[3px] grid h-[11%] shrink-0 grid-cols-3 gap-[3px] rounded-t-[5px] p-[3px] ${
              disabled ? 'bg-[#3f2a1a]' : 'bg-[#6b4220]'
            }`}
          >
            {[0, 1, 2].map((pane) => (
              <span
                key={pane}
                className={disabled ? 'bg-[#1c1917]' : 'bg-gradient-to-b from-[#fde68a] to-[#f59e0b]'}
              />
            ))}
          </span>
          <span
            className={`relative flex min-h-0 w-full flex-1 flex-col items-center px-1.5 pt-[calc(var(--door-h)*0.03)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)] ${
              disabled ? 'bg-[#3f2a1a]' : 'bg-gradient-to-b from-[#8a5a2b] to-[#6b4220]'
            }`}
          >
            <span
              className={`relative z-10 max-w-full rounded-[3px] border-2 px-1.5 py-0.5 font-sign text-[clamp(12px,calc(var(--door-w)*0.09),16px)] font-bold uppercase leading-none tracking-[0.04em] [overflow-wrap:anywhere] shadow-[0_2px_0_rgba(0,0,0,0.4)] ${
                disabled
                  ? 'border-[#94a3b8] bg-[#475569] text-[#e2e8f0]'
                  : `border-[#ffffff] ${T.plate} text-[#ffffff]`
              }`}
            >
              {title}
            </span>
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-[9%] top-[24%] h-[28%] rounded-[3px] border-2 ${
                disabled ? PANEL_OFF : PANEL_ON
              }`}
            />
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-[9%] bottom-[4%] top-[58%] rounded-[3px] border-2 ${
                disabled ? PANEL_OFF : PANEL_ON
              }`}
            />
            <span
              className={`absolute left-1/2 top-[38%] flex aspect-square w-[max(2.75rem,34%)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 [&>svg]:h-[58%] [&>svg]:w-[58%] ${
                disabled
                  ? 'border-[#64748b] bg-[#94a3b8] text-[#475569] [&_svg]:grayscale'
                  : `border-[#e2e8f0] bg-[#f8fafc] shadow-[0_2px_0_rgba(0,0,0,0.45)] ${T.ink}`
              }`}
            >
              {icon}
            </span>
            <span
              aria-hidden="true"
              className={`absolute right-[6%] top-[54%] aspect-square w-[max(0.75rem,8%)] rounded-full ${
                disabled
                  ? 'bg-[#57534e]'
                  : 'bg-gradient-to-br from-[#fde68a] to-[#a16207] shadow-[0_1px_0_rgba(0,0,0,0.6)]'
              }`}
            />
            {disabled && (
              <svg
                viewBox="0 0 12 14"
                aria-hidden="true"
                className="absolute right-[6%] top-[calc(54%+1.1rem)] h-3.5 w-3"
              >
                <path d="M3 6V4a3 3 0 0 1 6 0v2" className="fill-none stroke-[#a8a29e]" strokeWidth="1.6" />
                <rect x="1.5" y="6" width="9" height="7" rx="1.5" className="fill-[#a8a29e]" />
              </svg>
            )}
          </span>
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`relative -mt-1.5 h-1 w-[110%] rounded-[1px] ${
          disabled ? 'bg-[#1c1917]' : 'bg-[#fcd34d] shadow-[0_0_10px_2px_rgb(252_211_77/0.45)]'
        }`}
      >
        <span className="pointer-events-none absolute -inset-x-[100vw] -bottom-[100vh] top-0 -z-10 border-t-4 border-[#2b1d14] bg-[#3a2a1f] bg-[repeating-linear-gradient(90deg,transparent_0_46px,rgb(0_0_0/0.18)_46px_48px)]">
          <span className="absolute inset-x-0 top-[calc(var(--door-h)*0.06)] h-[calc(var(--door-h)*0.2)] border-y-2 border-[#7c5a1d] bg-[#42211b] bg-[repeating-linear-gradient(90deg,transparent_0_8px,rgb(0_0_0/0.12)_8px_10px)]" />
        </span>
      </span>
      <TownChooserNotice desc={desc} sub={sub} dim={disabled} />
    </button>
  );
}

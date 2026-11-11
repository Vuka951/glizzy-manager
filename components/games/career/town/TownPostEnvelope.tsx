import TownPostmark from '@/components/games/career/town/TownPostmark';
import TownPostSeal from '@/components/games/career/town/TownPostSeal';
import TownPostStamp from '@/components/games/career/town/TownPostStamp';
import { MAIL_SENDER_THEMES, type MailSender } from '@/lib/constants/mailSenders';

// A sealed letter on the counter, in its sender's colours: the flap shut under
// the sender's wax seal, the stamp cancelled with the edition it was posted in, and the
// subject written across the front. Opening it lifts the flap, breaks the
// seal and slides the sheet out before the letter is laid open
export default function TownPostEnvelope({
  subject,
  sender,
  seal,
  season,
  year,
  label,
  opening,
  onOpen,
}: {
  subject: string;
  sender: MailSender;
  seal: React.ReactNode;
  season: number;
  year: number;
  label: string;
  opening: boolean;
  onOpen: () => void;
}) {
  const theme = MAIL_SENDER_THEMES[sender];
  return (
    <button
      type="button"
      onClick={onOpen}
      title={label}
      className="group/env relative block h-[7.5rem] w-full shrink-0 text-left transition duration-200 [perspective:600px] odd:-rotate-[0.6deg] even:rotate-[0.5deg] hover:-translate-y-0.5 hover:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fcd34d] motion-reduce:transition-none"
    >
      <span className={`absolute inset-0 rounded-[4px] shadow-[0_8px_16px_-8px_rgb(0_0_0/0.85)] ring-1 ring-[#7c5a2a]/35 transition-shadow group-hover/env:shadow-[0_14px_22px_-10px_rgb(0_0_0/0.9)] ${theme.body}`} />
      <span className={`absolute inset-x-0 top-0 h-[45%] rounded-t-[4px] opacity-90 ${theme.band}`} />
      <span
        className={`absolute inset-x-5 top-3 z-10 h-16 rounded-[2px] bg-[#fffdf5] bg-[repeating-linear-gradient(to_bottom,transparent_0_7px,rgb(28_25_23/0.12)_7px_8px)] ring-1 ring-[#1c1917]/10 transition-transform delay-300 duration-500 ease-out motion-reduce:transition-none ${
          opening ? '-translate-y-9 rotate-1' : ''
        }`}
      />
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        className="absolute inset-0 z-20 h-full w-full"
        aria-hidden="true"
      >
        <path d="M0 2 50 30 100 2V60H0z" className={theme.front} />
        <path
          d="M0 60 45 33M100 60 55 33"
          stroke="#7c5a2a"
          strokeOpacity="0.25"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          fill="none"
        />
      </svg>
      <span
        className={`absolute inset-x-0 top-0 h-[45%] origin-top transition-transform duration-[400ms] ease-out motion-reduce:transition-none ${
          opening ? 'z-0 [transform:rotateX(-172deg)]' : 'z-30'
        }`}
      >
        <svg
          viewBox="0 0 100 30"
          preserveAspectRatio="none"
          className="block h-full w-full drop-shadow-[0_2px_1px_rgb(0_0_0/0.18)]"
          aria-hidden="true"
        >
          <path
            d="M0 0H100L50 30z"
            className={theme.flap}
            stroke="#7c5a2a"
            strokeOpacity="0.35"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </span>
      <span
        className={`absolute left-1/2 top-[45%] z-40 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-in motion-reduce:transition-none ${
          opening ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <TownPostSeal sender={sender} className="h-9 w-9">
          {seal}
        </TownPostSeal>
      </span>
      <TownPostStamp className="absolute right-3 top-2.5 z-40 rotate-3" />
      <TownPostmark
        season={season}
        year={year}
        className="absolute right-1 top-3.5 z-40 h-10 -rotate-6 text-[#1e3a8a]/55"
      />
      <span className="absolute inset-x-3.5 bottom-2.5 z-40 line-clamp-2 font-serif text-[13px] font-bold leading-tight text-[#1c1917]">
        {subject}
      </span>
    </button>
  );
}

import TownPostmark from '@/components/games/career/town/TownPostmark';
import TownPostSeal from '@/components/games/career/town/TownPostSeal';
import { MAIL_SENDER_THEMES, type MailSender } from '@/lib/constants/mailSenders';

// An opened letter: the sheet drawn out of its sender's envelope, the
// broken seal and the subject at the head over a double rule, the date
// stamp in the corner, the text and whatever rides with it, and the answers
// along the torn foot
export default function TownPostLetter({
  subject,
  sender,
  seal,
  season,
  year,
  actions,
  children,
}: {
  subject: string;
  sender: MailSender;
  seal: React.ReactNode;
  season: number;
  year: number;
  actions: React.ReactNode;
  children: React.ReactNode;
}) {
  const theme = MAIL_SENDER_THEMES[sender];
  return (
    <div
      className="relative shrink-0 pt-4 animate-[bubblein_0.35s_ease-out]"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-3 top-0 h-12 rounded-t-[4px] p-[3px] shadow-[0_6px_12px_-6px_rgb(0_0_0/0.8)] ring-1 ring-[#7c5a2a]/35 ${theme.body}`}
      >
        <span className={`block h-full rounded-t-[2px] opacity-90 ${theme.band}`} />
      </span>
      <div className="relative -rotate-[0.4deg] rounded-[3px] bg-[#fbf6e6] px-3.5 pb-3 pt-3 text-left text-[#1c1917] shadow-[0_12px_24px_-12px_rgb(0_0_0/0.85)] ring-1 ring-[#1c1917]/10">
        <TownPostmark
          season={season}
          year={year}
          className="pointer-events-none absolute right-1.5 top-2 h-8 -rotate-6 text-[#1e3a8a]/40"
        />
        <div className="flex items-center gap-2.5 border-b-[3px] border-double border-[#1c1917] pb-2 pr-12">
          <TownPostSeal sender={sender} broken className="h-9 w-9 shrink-0">
            {seal}
          </TownPostSeal>
          <p className="min-w-0 font-serif text-sm font-black uppercase leading-snug tracking-wide">
            {subject}
          </p>
        </div>
        {children}
        <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-dashed border-[#1c1917]/35 pt-3">
          {actions}
        </div>
      </div>
    </div>
  );
}

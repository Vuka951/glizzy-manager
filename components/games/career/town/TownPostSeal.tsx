import TownPostHorn from '@/components/games/career/town/TownPostHorn';
import { MAIL_SENDER_THEMES, type MailSender } from '@/lib/constants/mailSenders';

// The wax seal a letter is closed with, in its sender's wax: the sender's
// emblem on a paper medallion pressed into it or, with no emblem to press, the
// horn. Once the letter is open it carries the crack it broke along
export default function TownPostSeal({
  sender,
  broken = false,
  className = 'h-9 w-9',
  children,
}: {
  sender: MailSender;
  broken?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const theme = MAIL_SENDER_THEMES[sender];
  return (
    <span
      aria-hidden="true"
      className={`relative flex items-center justify-center rounded-full shadow-[0_2px_3px_rgb(0_0_0/0.45),inset_0_-2px_3px_rgb(0_0_0/0.35)] ring-2 ${theme.wax} ${theme.waxRing} ${className}`}
    >
      <span
        className={`flex h-[72%] w-[72%] items-center justify-center rounded-full shadow-[inset_0_1px_2px_rgb(0_0_0/0.55)] ${
          children ? 'bg-[#f4ead3]' : theme.hornPlate
        }`}
      >
        {children ?? <TownPostHorn className={`h-[78%] w-[78%] ${theme.horn}`} />}
      </span>
      {broken && (
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-0 h-full w-full"
          fill="none"
        >
          <path
            d="M13 0 10.5 8l3.5 5-3 11"
            stroke="#fbf6e6"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

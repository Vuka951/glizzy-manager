import type { SponsorId } from '@/lib/utils/careerSave';

// Who a letter is from, read at a glance off the envelope before it is opened.
// `post` is everyone else: a person, the exchange, the underworld
export type MailSender = SponsorId | 'government' | 'league' | 'post';

type MailSenderTheme = {
  band: string;
  body: string;
  front: string;
  flap: string;
  wax: string;
  waxRing: string;
  hornPlate: string;
  horn: string;
};

export const MAIL_SENDER_THEMES: Record<MailSender, MailSenderTheme> = {
  post: {
    band: 'bg-[repeating-linear-gradient(135deg,#b91c1c_0_7px,#fbf6e6_7px_12px,#1e3a8a_12px_19px,#fbf6e6_19px_24px)]',
    body: 'bg-[#e9dcbc]',
    front: 'fill-[#f4ead3]',
    flap: 'fill-[#ede1c3]',
    wax: 'bg-[radial-gradient(circle_at_35%_30%,#dc2626,#7f1d1d_72%)]',
    waxRing: 'ring-[#991b1b]/60',
    hornPlate: 'bg-[#b91c1c]',
    horn: 'text-[#fca5a5]',
  },
  league: {
    band: 'bg-[repeating-linear-gradient(135deg,#ea580c_0_9px,#fbf6e6_9px_15px)]',
    body: 'bg-[#f0d3b4]',
    front: 'fill-[#f8e6d3]',
    flap: 'fill-[#f3d6b8]',
    wax: 'bg-[radial-gradient(circle_at_35%_30%,#f97316,#9a3412_72%)]',
    waxRing: 'ring-[#9a3412]/60',
    hornPlate: 'bg-[#c2410c]',
    horn: 'text-[#fed7aa]',
  },
  government: {
    band: 'bg-[repeating-linear-gradient(135deg,#6d28d9_0_9px,#d4a017_9px_15px)]',
    body: 'bg-[#d6c7ea]',
    front: 'fill-[#ece4f5]',
    flap: 'fill-[#dfd3ee]',
    wax: 'bg-[radial-gradient(circle_at_35%_30%,#8b5cf6,#4c1d95_72%)]',
    waxRing: 'ring-[#4c1d95]/60',
    hornPlate: 'bg-[#5b21b6]',
    horn: 'text-[#ddd6fe]',
  },
  blue: {
    band: 'bg-[repeating-linear-gradient(135deg,#2563eb_0_9px,#fbf6e6_9px_15px)]',
    body: 'bg-[#c9d6ef]',
    front: 'fill-[#e6ecf7]',
    flap: 'fill-[#d7e1f3]',
    wax: 'bg-[radial-gradient(circle_at_35%_30%,#3b82f6,#1e3a8a_72%)]',
    waxRing: 'ring-[#1e3a8a]/60',
    hornPlate: 'bg-[#1d4ed8]',
    horn: 'text-[#bfdbfe]',
  },
  green: {
    band: 'bg-[repeating-linear-gradient(135deg,#059669_0_9px,#fcd34d_9px_15px)]',
    body: 'bg-[#bfe0c6]',
    front: 'fill-[#e3f1e4]',
    flap: 'fill-[#d0e8d4]',
    wax: 'bg-[radial-gradient(circle_at_35%_30%,#10b981,#065f46_72%)]',
    waxRing: 'ring-[#065f46]/60',
    hornPlate: 'bg-[#047857]',
    horn: 'text-[#a7f3d0]',
  },
  yellow: {
    band: 'bg-[repeating-linear-gradient(135deg,#eab308_0_9px,#1c1917_9px_15px)]',
    body: 'bg-[#e6d68c]',
    front: 'fill-[#f7efc9]',
    flap: 'fill-[#f0e3a6]',
    wax: 'bg-[radial-gradient(circle_at_35%_30%,#facc15,#854d0e_72%)]',
    waxRing: 'ring-[#854d0e]/60',
    hornPlate: 'bg-[#1c1917]',
    horn: 'text-[#facc15]',
  },
  red: {
    band: 'bg-[repeating-linear-gradient(135deg,#b91c1c_0_9px,#450a0a_9px_15px)]',
    body: 'bg-[#e7bdb0]',
    front: 'fill-[#f6dfd6]',
    flap: 'fill-[#efcdc2]',
    wax: 'bg-[radial-gradient(circle_at_35%_30%,#b91c1c,#450a0a_72%)]',
    waxRing: 'ring-[#450a0a]/60',
    hornPlate: 'bg-[#7f1d1d]',
    horn: 'text-[#fecaca]',
  },
};

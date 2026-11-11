import LawStamp from '@/components/games/career/LawStamp';
import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { GAMES_UI } from '@/data/games/locale';
import {
  isLawId,
  lawEffectText,
  lawName,
  type LawVerdict,
} from '@/lib/utils/careerLaws';
import type { MailItem, SponsorId } from '@/lib/utils/careerSave';
import { fmt } from '@/lib/utils/format';
import { isSponsorId } from '@/lib/utils/careerSponsors';

const LAWS = GAMES_UI.career.laws;
const SPONSOR_NAMES = GAMES_UI.career.sponsors.names as Record<
  SponsorId,
  string
>;

function verdictOf(item: MailItem): LawVerdict {
  if (item.params.outcome !== 'passed') return 'failed';
  return item.params.action === 'repeal' ? 'repealed' : 'passed';
}

// What rides in the chamber's envelope: the bill itself with the verdict
// stamped across it and the tally in the margin, or the city's statement of
// what every law on the books took or paid this window
export default function LawLetterAttachment({ item }: { item: MailItem }) {
  if (item.templateKey === 'law-bill') {
    const lines = String(item.params.lines ?? '')
      .split(';')
      .filter(Boolean)
      .map((line) => {
        const [law, amount] = line.split('=');
        return { law, amount: Number(amount) };
      });
    const total = Number(item.params.total ?? 0);
    return (
      <div className="mt-2.5 rounded-[2px] border border-[#1c1408]/20 bg-[#fffaf0]/60 px-2.5 py-2 font-sign text-[13px]">
        {lines.map(({ law, amount }) => (
          <div
            key={law}
            className="flex items-center gap-2 border-b border-dotted border-[#1c1408]/20 py-1"
          >
            <span className="min-w-0 flex-1 truncate font-serif font-semibold text-[#3a2f1e]">
              {isLawId(law) ? lawName(law) : law}
            </span>
            <span
              className={`font-black tabular-nums ${amount < 0 ? 'text-red-700' : 'text-emerald-700'}`}
            >
              {amount > 0 ? `+${amount}` : amount}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between pt-1.5 font-sign text-[13px] font-bold uppercase tracking-[0.08em] text-[#2a2012]">
          {LAWS.letter.total}
          <span
            className={`font-sign text-[15px] tabular-nums ${total < 0 ? 'text-red-700' : 'text-emerald-700'}`}
          >
            {total > 0 ? `+${total}` : total}
          </span>
        </div>
      </div>
    );
  }
  if (item.params.action === 'constitution' && item.sponsorId) {
    const party = item.sponsorId as SponsorId;
    const verdict = item.params.outcome === 'passed' ? 'passed' : 'failed';
    return (
      <div className="mt-2.5 rounded-[2px] border border-[#7f1d1d]/30 bg-[#ecdcb4] p-2.5 pr-3">
        <div className="flex items-center gap-2 border-b-[3px] border-double border-[#7f1d1d]/60 pb-1.5">
          <SponsorEmblem sponsorId={party} className="h-5 w-5" />
          <span className="font-sign text-[13px] font-bold uppercase tracking-[0.08em] text-red-800">
            {LAWS.ballot.constitution}
          </span>
          <span className="ml-auto font-sign text-[13px] font-bold tabular-nums text-[#55472f]">
            {fmt(LAWS.ballot.tally, {
              yes: item.params.yes ?? 0,
              no: item.params.no ?? 0,
            })}
          </span>
        </div>
        <p className="mt-1.5 font-serif text-sm font-black uppercase leading-tight text-[#1c1408]">
          {LAWS.ballot.constitutionName}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-[#3a2f1e]">
          {fmt(LAWS.ballot.constitutionEffect, { party: SPONSOR_NAMES[party] })}
        </p>
        <div className="mt-1.5 flex justify-end">
          <LawStamp
            verdict={verdict}
            text={LAWS.vote.stamps[verdict]}
            size="md"
            onPaper
          />
        </div>
      </div>
    );
  }
  if (!isLawId(item.params.law)) return null;
  const law = item.params.law;
  const verdict = verdictOf(item);
  const repealed = String(item.params.repealed ?? '')
    .split(',')
    .filter(isLawId);
  const party = String(item.params.party ?? '');
  return (
    <div className="mt-2.5 rounded-[2px] border border-[#1c1408]/25 bg-[#fffaf0]/70 p-2.5 pr-3">
      <div className="flex items-center gap-2 border-b-[3px] border-double border-[#1c1408]/60 pb-1.5">
        {isSponsorId(party) && (
          <SponsorEmblem sponsorId={party} className="h-5 w-5" />
        )}
        <span className="font-sign text-[13px] font-bold uppercase tracking-[0.08em] text-[#2a2012]">
          {item.params.action === 'repeal'
            ? LAWS.ballot.repeal
            : LAWS.ballot.pass}
        </span>
        <span className="ml-auto font-sign text-[13px] font-bold tabular-nums text-[#55472f]">
          {fmt(LAWS.ballot.tally, {
            yes: item.params.yes ?? 0,
            no: item.params.no ?? 0,
          })}
        </span>
      </div>
      <p className="mt-1.5 font-serif text-sm font-black leading-tight text-[#1c1408]">
        {lawName(law)}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-[#3a2f1e]">
        {lawEffectText(law)}
      </p>
      <div className="mt-1.5 flex flex-wrap items-end justify-between gap-2">
        {repealed.length > 0 ? (
          <p className="flex flex-wrap items-center gap-1.5 font-sign text-[13px] font-bold text-[#55472f]">
            <span className="font-bold uppercase tracking-[0.08em] text-red-700">
              {LAWS.ballot.conflict}
            </span>
            {repealed.map((id) => (
              <span
                key={id}
                className="line-through decoration-red-600 decoration-2"
              >
                {lawName(id)}
              </span>
            ))}
          </p>
        ) : (
          <span />
        )}
        <LawStamp
          verdict={verdict}
          text={LAWS.vote.stamps[verdict]}
          size="md"
          onPaper
          className="ml-auto"
        />
      </div>
    </div>
  );
}

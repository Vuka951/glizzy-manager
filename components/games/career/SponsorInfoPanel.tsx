import SponsorEmblem from '@/components/games/career/SponsorEmblem';
import { SPONSOR_IDS } from '@/data/games/careerSponsors';
import { GAMES_UI } from '@/data/games/locale';

const SPONSORS = GAMES_UI.career.sponsors;

export default function SponsorInfoPanel() {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] leading-relaxed text-slate-400">
        {SPONSORS.info.intro}
      </p>
      <div className="flex flex-col gap-2">
        {SPONSOR_IDS.map((id) => (
          <div
            key={id}
            className="flex flex-col gap-1 rounded-xl border border-sky-200/10 bg-slate-800/40 p-3"
          >
            <span className="flex items-center justify-center gap-2">
              <SponsorEmblem sponsorId={id} className="h-5 w-5 shrink-0" />
              <span className="text-[11px] font-bold text-slate-100">
                {(SPONSORS.names as Record<string, string>)[id]}
              </span>
            </span>
            <span className="text-[10px] leading-relaxed text-slate-400">
              {(SPONSORS.info.sponsors as Record<string, string>)[id]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

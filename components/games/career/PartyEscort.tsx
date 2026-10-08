import type { SponsorId } from '@/lib/utils/careerSave';

// The people the party sends to walk a man out, in the party's own kit: a
// builder in a hard hat, the island's boatman in a straw hat, a corporate
// collector in a suit and lanyard, a party steward with the flag. Same
// silhouette as the police officer so the escort animation fits either
export default function PartyEscort({
  party,
  flip = false,
}: {
  party: SponsorId;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 40"
      className={`h-9 w-auto ${flip ? '-scale-x-100' : ''}`}
      aria-hidden="true"
    >
      {party === 'zidari' && (
        <>
          <rect
            x="7"
            y="14"
            width="10"
            height="16"
            rx="3"
            className="fill-stone-500"
          />
          <rect
            x="9.5"
            y="14"
            width="5"
            height="16"
            className="fill-orange-700"
          />
          <circle cx="12" cy="9" r="5" className="fill-amber-200" />
          <path
            d="M6.2 8.2a5.8 5.8 0 0 1 11.6 0z"
            className="fill-yellow-400"
          />
          <rect
            x="5.2"
            y="7.6"
            width="13.6"
            height="1.6"
            rx="0.8"
            className="fill-yellow-500"
          />
          <rect
            x="9"
            y="30"
            width="2.6"
            height="8"
            className="fill-slate-700"
          />
          <rect
            x="12.4"
            y="30"
            width="2.6"
            height="8"
            className="fill-slate-700"
          />
          <rect
            x="4.5"
            y="16"
            width="3"
            height="9"
            rx="1.5"
            className="fill-stone-500"
          />
          <rect
            x="16.5"
            y="16"
            width="3"
            height="9"
            rx="1.5"
            className="fill-stone-500"
          />
          <rect x="7" y="23" width="10" height="1.6" className="fill-stone-200" />
        </>
      )}
      {party === 'ostrvo' && (
        <>
          <rect
            x="7"
            y="14"
            width="10"
            height="16"
            rx="3"
            className="fill-emerald-500"
          />
          <path d="M9.5 14h5l-2.5 5z" className="fill-amber-100" />
          <circle cx="12" cy="9" r="5" className="fill-amber-200" />
          <ellipse
            cx="12"
            cy="7.4"
            rx="8"
            ry="1.7"
            className="fill-amber-300"
          />
          <path
            d="M8 7.4a4 4 0 0 1 8 0v-2.6a4 4 0 0 0-8 0z"
            className="fill-amber-200"
          />
          <rect
            x="8"
            y="5.8"
            width="8"
            height="1.2"
            className="fill-emerald-600"
          />
          <rect
            x="9"
            y="30"
            width="2.6"
            height="8"
            className="fill-amber-100"
          />
          <rect
            x="12.4"
            y="30"
            width="2.6"
            height="8"
            className="fill-amber-100"
          />
          <rect
            x="4.5"
            y="16"
            width="3"
            height="9"
            rx="1.5"
            className="fill-emerald-500"
          />
          <rect
            x="16.5"
            y="16"
            width="3"
            height="9"
            rx="1.5"
            className="fill-emerald-500"
          />
        </>
      )}
      {party === 'korporacija' && (
        <>
          <rect
            x="7"
            y="14"
            width="10"
            height="16"
            rx="3"
            className="fill-slate-900"
          />
          <path d="M10 14h4l-2 6z" className="fill-slate-100" />
          <path
            d="M11.3 15.5h1.4l.5 6-1.2 1.4-1.2-1.4z"
            className="fill-yellow-300"
          />
          <circle cx="12" cy="9" r="5" className="fill-amber-200" />
          <path
            d="M7 8a5 5 0 0 1 10 0v-1.4a5 5 0 0 0-10 0z"
            className="fill-slate-800"
          />
          <rect
            x="15"
            y="19"
            width="4.4"
            height="5.6"
            rx="0.6"
            className="fill-slate-100"
          />
          <rect
            x="15"
            y="19"
            width="4.4"
            height="1.2"
            className="fill-yellow-300"
          />
          <rect
            x="9"
            y="30"
            width="2.6"
            height="8"
            className="fill-slate-900"
          />
          <rect
            x="12.4"
            y="30"
            width="2.6"
            height="8"
            className="fill-slate-900"
          />
          <rect
            x="4.5"
            y="16"
            width="3"
            height="9"
            rx="1.5"
            className="fill-slate-900"
          />
          <rect
            x="16.5"
            y="16"
            width="3"
            height="9"
            rx="1.5"
            className="fill-slate-900"
          />
        </>
      )}
      {party === 'stranka' && (
        <>
          <rect
            x="7"
            y="14"
            width="10"
            height="16"
            rx="3"
            className="fill-red-700"
          />
          <circle cx="12" cy="9" r="5" className="fill-amber-200" />
          <path
            d="M7 8.6a5 5 0 0 1 10 0v-1.8a5 5 0 0 0-10 0z"
            className="fill-red-900"
          />
          <circle cx="9.6" cy="17.6" r="1.5" className="fill-amber-300" />
          <circle cx="9.6" cy="17.6" r="0.6" className="fill-blue-700" />
          <rect
            x="9"
            y="30"
            width="2.6"
            height="8"
            className="fill-slate-800"
          />
          <rect
            x="12.4"
            y="30"
            width="2.6"
            height="8"
            className="fill-slate-800"
          />
          <rect
            x="4.5"
            y="16"
            width="3"
            height="9"
            rx="1.5"
            className="fill-red-700"
          />
          <rect
            x="16.5"
            y="16"
            width="3"
            height="9"
            rx="1.5"
            className="fill-red-700"
          />
          <rect
            x="20.2"
            y="2"
            width="1"
            height="22"
            className="fill-slate-300"
          />
          <rect
            x="21.2"
            y="2.5"
            width="2.8"
            height="2"
            className="fill-blue-700"
          />
          <rect
            x="21.2"
            y="4.5"
            width="2.8"
            height="2"
            className="fill-amber-300"
          />
          <rect
            x="21.2"
            y="6.5"
            width="2.8"
            height="2"
            className="fill-red-600"
          />
        </>
      )}
    </svg>
  );
}

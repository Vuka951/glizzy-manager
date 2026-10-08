import CardCoach from '@/components/hub/CardCoach';

// The Rivals card banner: two fighters at one table and a stand full of
// coaches behind them, every one of them in his own colours and on his feet
export default function RivalsCardArt() {
  return (
    <svg viewBox="0 0 320 140" className="h-auto w-full" aria-hidden="true" focusable="false">
      <rect width="320" height="140" className="fill-slate-800" />
      <rect y="30" width="320" height="38" className="fill-slate-700" />
      <path d="M0 30h320" className="stroke-slate-600" strokeWidth="2" />
      <CardCoach x={40} y={72} scale={0.62} jersey="fill-violet-500" armsUp cheering />
      <CardCoach x={100} y={72} scale={0.62} jersey="fill-emerald-500" cap="fill-stone-800" />
      <rect x="108" y="48" width="30" height="20" rx="2" className="fill-stone-100" />
      <path d="M114 55h18M114 61h12" className="stroke-red-500" strokeWidth="3" strokeLinecap="round" />
      <CardCoach x={160} y={72} scale={0.62} jersey="fill-orange-500" armsUp cheering />
      <CardCoach x={222} y={72} scale={0.62} jersey="fill-teal-500" cap="fill-stone-800" cheering />
      <CardCoach x={282} y={72} scale={0.62} jersey="fill-pink-500" armsUp />
      <rect y="68" width="320" height="34" className="fill-slate-800" />
      <path d="M0 68h320" className="stroke-slate-600" strokeWidth="2" />
      <CardCoach x={30} y={100} scale={0.66} jersey="fill-red-500" armsUp cheering />
      <CardCoach x={78} y={100} scale={0.66} jersey="fill-yellow-400" cap="fill-stone-800" />
      <CardCoach x={242} y={100} scale={0.66} jersey="fill-sky-500" cheering />
      <CardCoach x={290} y={100} scale={0.66} jersey="fill-lime-500" armsUp cheering />
      <rect y="102" width="320" height="38" className="fill-slate-900" />
      <CardCoach x={124} y={124} jersey="fill-red-500" cap="fill-red-700" />
      <CardCoach x={196} y={124} jersey="fill-sky-500" cap="fill-sky-700" />
      <rect x="72" y="108" width="176" height="11" rx="3" className="fill-amber-700" />
      <rect x="78" y="119" width="164" height="21" className="fill-amber-800" />
      <circle cx="146" cy="112" r="6.5" className="fill-amber-200" />
      <circle cx="174" cy="112" r="6.5" className="fill-amber-200" />
      <ellipse cx="160" cy="107" rx="22" ry="5" className="fill-stone-100" />
      <path d="M147 104h26" className="stroke-amber-500" strokeWidth="8" strokeLinecap="round" />
      <path d="M143 102.5h34" className="stroke-red-500" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M149 103l3.5-2 3.5 2 3.5-2 3.5 2 3.5-2 3.5 2" className="fill-none stroke-amber-100" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

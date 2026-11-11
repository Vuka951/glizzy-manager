// The retainer's shepherd at the character's heel, tan with a black saddle and
// a red collar. The art looks left; `flip` turns it to the right
export default function TownEscortDog({ flip }: { flip: boolean }) {
  return (
    <svg
      viewBox="158 186 26 23"
      className={`h-full w-full overflow-visible ${flip ? '-scale-x-100' : ''}`}
      aria-hidden="true"
    >
      <ellipse cx="171" cy="207.8" rx="9" ry="1.4" className="fill-black opacity-30" />
      <path d="M176.8 204.4q3.6-.4 4.8 2.6" className="fill-none stroke-[#b7793a]" strokeWidth="1.8" strokeLinecap="round" />
      <ellipse cx="173.4" cy="204" rx="4.4" ry="4" className="fill-[#b7793a]" />
      <path d="M167 205.6l.4-7.6q1.4-4 4.4-3.6l3 1.4-1 4.6z" className="fill-[#b7793a]" />
      <path d="M169.6 196q4-1 7.4 3.4l.6 3.6q-3.4-4.2-7-4.4z" className="fill-[#1c1917]" />
      <path d="M167.4 199v8.6M170 200v7.6" className="stroke-[#b7793a]" strokeWidth="1.6" />
      <path d="M166.4 207.8h2.2M169 207.8h2.2" className="stroke-[#92400e]" strokeWidth="1" strokeLinecap="round" />
      <circle cx="168" cy="193.6" r="3" className="fill-[#b7793a]" />
      <path d="M165.6 192.8l-3.8 1.4 3.8 1.6z" className="fill-[#b7793a]" />
      <path d="M161.8 194.2l1.6-.6.4 1.4z" className="fill-[#1c1917]" />
      <path d="M166.6 191.4l.6-3.6 1.8 3z" className="fill-[#1c1917]" />
      <path d="M168.8 191l1.4-3.4 1 3.4z" className="fill-[#1c1917]" />
      <circle cx="166.8" cy="193" r="0.5" className="fill-[#0b0f19]" />
      <path d="M166 196.2h3.4" className="stroke-red-700" strokeWidth="0.9" />
    </svg>
  );
}

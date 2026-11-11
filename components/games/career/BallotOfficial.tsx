// The count commission's clerk, seated at the far end of the table in his
// cardigan and reading glasses, keeping an eye on every slip
export default function BallotOfficial() {
  return (
    <span className="relative block h-full w-full">
      <span className="absolute inset-x-[6%] bottom-0 h-[52%] overflow-hidden rounded-t-[44%] bg-gradient-to-b from-stone-500 to-stone-700 shadow-lg">
        <span className="absolute left-1/2 top-0 h-[40%] w-[30%] -translate-x-1/2 bg-sky-100 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
        <span className="absolute left-[30%] top-0 h-full w-[6%] -rotate-12 bg-sky-600" />
        <span className="absolute right-[30%] top-0 h-full w-[6%] rotate-12 bg-sky-600" />
        <span className="absolute bottom-[14%] left-1/2 h-[24%] w-[22%] -translate-x-1/2 rounded-sm bg-slate-50 ring-1 ring-sky-600">
          <span className="absolute inset-x-0 top-0 h-1/4 bg-sky-600" />
        </span>
      </span>
      <span className="absolute left-1/2 top-[4%] aspect-square h-[50%] -translate-x-1/2 rounded-full bg-amber-200 shadow-md">
        <span className="absolute inset-x-[4%] -top-[4%] h-[38%] rounded-t-full bg-slate-500" />
        <span className="absolute left-[18%] top-[42%] h-[18%] w-[26%] rounded-full border-2 border-slate-800" />
        <span className="absolute right-[18%] top-[42%] h-[18%] w-[26%] rounded-full border-2 border-slate-800" />
        <span className="absolute left-1/2 top-[48%] h-[2px] w-[12%] -translate-x-1/2 bg-slate-800" />
        <span className="absolute bottom-[16%] left-1/2 h-[6%] w-[24%] -translate-x-1/2 rounded-full bg-amber-800/70" />
      </span>
    </span>
  );
}

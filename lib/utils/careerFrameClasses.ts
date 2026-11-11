// Takes a dark object laid on a sheet back out of the sheet's ink remap, for one
// element and everything inside it
export const DARK_PAINT =
  '[--color-white:#ffffff] [--color-black:#000000] [--color-slate-100:#f1f5f9] [--color-slate-200:#e2e8f0] [--color-slate-300:#cbd5e1] [--color-slate-400:#94a3b8] [--color-slate-500:#64748b] [--color-slate-600:#475569] [--color-slate-700:#334155] [--color-slate-800:#1e293b] [--color-slate-900:#0f172a] [--color-slate-950:#020617] [--color-red-100:#fee2e2] [--color-red-200:#fecaca] [--color-red-300:#fca5a5] [--color-red-400:#f87171] [--color-red-900:#7f1d1d] [--color-red-950:#450a0a] [--color-sky-100:#e0f2fe] [--color-sky-200:#bae6fd] [--color-sky-300:#7dd3fc] [--color-sky-400:#38bdf8] [--color-sky-950:#082f49] [--color-cyan-100:#cffafe] [--color-cyan-200:#a5f3fc] [--color-cyan-300:#67e8f9] [--color-green-200:#bbf7d0] [--color-green-300:#86efac] [--color-green-400:#4ade80] [--color-green-950:#052e16] [--color-amber-300:#fcd34d] [--color-amber-400:#fbbf24] [--color-amber-500:#f59e0b] [--color-amber-600:#d97706] [--color-amber-700:#b45309] [--color-amber-800:#92400e] [--color-amber-900:#78350f] [--color-yellow-400:#facc15] [--color-purple-400:#c084fc] [--color-purple-500:#a855f7] [--frost-border:#9bd7f9]';

// The same trick for paper: dark-first markup laid on a sheet takes ink colours
// from the remap, so a list or a table reads as printed without a rewrite
export const PAPER_PAINT =
  '[--color-white:#1c1408] [--color-black:#f1e8d3] [--color-slate-100:#1c1408] [--color-slate-200:#2a2012] [--color-slate-300:#3a2f1e] [--color-slate-400:#55472f] [--color-slate-500:#6b5b42] [--color-slate-600:#8a7a5f] [--color-slate-700:#b8a888] [--color-slate-800:#d6c9ac] [--color-slate-900:#e4d9bf] [--color-slate-950:#ece2ca] [--color-red-100:#7f1d1d] [--color-red-200:#7f1d1d] [--color-red-300:#a11919] [--color-red-400:#b91c1c] [--color-red-500:#b91c1c] [--color-red-900:#ecc4b4] [--color-red-950:#f0d6c8] [--color-sky-100:#17306f] [--color-sky-200:#17306f] [--color-sky-300:#1e3a8a] [--color-sky-400:#1e40af] [--color-sky-950:#d9e0e8] [--color-cyan-100:#134e5e] [--color-cyan-200:#134e5e] [--color-cyan-300:#155e75] [--color-green-200:#14532d] [--color-green-300:#166534] [--color-green-400:#15803d] [--color-green-950:#d3e2c0] [--color-emerald-100:#14532d] [--color-emerald-200:#14532d] [--color-emerald-300:#166534] [--color-emerald-400:#15803d] [--color-emerald-500:#15803d] [--color-amber-100:#713f12] [--color-amber-200:#713f12] [--color-amber-300:#854d0e] [--color-amber-400:#92400e] [--color-amber-500:#a16207] [--color-amber-600:#92400e] [--color-amber-700:#78350f] [--color-amber-800:#5f2b0d] [--color-amber-900:#4a220b] [--color-yellow-300:#854d0e] [--color-yellow-400:#854d0e] [--color-purple-400:#6b21a8] [--color-purple-500:#6b21a8] [--frost-border:#6b5b42]';

// A routed slot in the wood: the street stand-in for a bordered dark card
export const STREET_TRAY =
  'rounded-[5px] bg-[#1f140b] shadow-[inset_0_2px_6px_rgb(0_0_0/0.75),0_1px_0_rgb(255_255_255/0.07)]';

// Sawn planks, for any surface that should read as the same wood as the board
export const WOOD_PLANKS =
  'bg-[#3b2616] bg-[repeating-linear-gradient(90deg,transparent_0_46px,rgb(0_0_0/0.14)_46px_48px)]';

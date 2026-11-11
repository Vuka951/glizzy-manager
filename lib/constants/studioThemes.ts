// The four seasonal looks: the table accents that follow the cup's season

export type StudioAccents = {
  tableBorder: string;
  tableSurface: string;
  tableEdge: string;
  tableLeg: string;
  tileBorder: string;
  spotLabel: string;
  tableRim: string;
  tableShadow: string;
  tableFelt: string;
  tableWeave: string;
  tableLamp: string;
  tableApron: string;
  tableNeon: string;
  tableStud: string;
  tableWell: string;
  tableWellLit: string;
  tablePlaque: string;
  tableMat: string;
  tableFloor: string;
  tableBulb: string;
  panelBorder: string;
  chip: string;
  podiumGlow: string;
};

export const STUDIO_ACCENTS: StudioAccents[] = [
  {
    tableBorder: 'border-[#5b7896]',
    tableSurface: 'from-[#1a3a52] via-[#0e2436] to-[#0e2436]',
    tableEdge: 'bg-[#cfeaff]/60',
    tableLeg: 'from-[#2b4560] to-[#0f1a27]',
    tileBorder: 'border-[#4b6b8a]/60',
    spotLabel: 'text-[#bae6fd]',
    tableRim: 'from-[#7591ad] via-[#3d5a78] to-[#22384f]',
    tableShadow:
      'shadow-[0_22px_40px_-14px_rgba(0,0,0,0.85),0_0_34px_-8px_rgba(125,211,252,0.45)]',
    tableFelt: 'bg-[#0e2436]',
    tableWeave:
      'bg-[radial-gradient(rgba(186,230,253,0.09)_1px,transparent_1.3px)]',
    tableLamp:
      'bg-[radial-gradient(ellipse_at_50%_42%,rgba(224,242,254,0.2),transparent_62%)]',
    tableApron: 'from-[#2b4560] to-[#13202f]',
    tableNeon: 'bg-[#7dd3fc] shadow-[0_0_10px_2px_rgba(125,211,252,0.6)]',
    tableStud: 'bg-[#e0f2fe]',
    tableWell: 'border-[#5b7896]/45 bg-[#081826]',
    tableWellLit: 'bg-[#bae6fd]/[0.07]',
    tablePlaque: 'border-[#f1f5f9]/40 bg-[#a9bdd0] text-[#13243a]',
    tableMat: 'border-[#bae6fd]/25 bg-[#143149]',
    tableFloor: 'bg-[#38bdf8]/20',
    tableBulb:
      'bg-[#7dd3fc] shadow-[0_0_7px_1px_rgba(125,211,252,0.75)]',
    panelBorder: 'border-sky-200/10',
    chip: 'border-red-500/25 bg-red-500/10 text-red-300',
    podiumGlow: 'bg-sky-300/10',
  },
  {
    tableBorder: 'border-[#7a2430]',
    tableSurface: 'from-[#5a1222] via-[#3d0a14] to-[#3d0a14]',
    tableEdge: 'bg-[#fda4af]/50',
    tableLeg: 'from-[#4a111d] to-[#1c050c]',
    tileBorder: 'border-[#9f1239]/60',
    spotLabel: 'text-[#fecdd3]',
    tableRim: 'from-[#8c2c38] via-[#5a1823] to-[#360b15]',
    tableShadow:
      'shadow-[0_22px_40px_-14px_rgba(0,0,0,0.85),0_0_34px_-8px_rgba(251,113,133,0.4)]',
    tableFelt: 'bg-[#3d0a14]',
    tableWeave:
      'bg-[radial-gradient(rgba(254,205,211,0.07)_1px,transparent_1.3px)]',
    tableLamp:
      'bg-[radial-gradient(ellipse_at_50%_42%,rgba(251,191,36,0.17),transparent_62%)]',
    tableApron: 'from-[#4a111d] to-[#22060e]',
    tableNeon: 'bg-[#fb7185] shadow-[0_0_10px_2px_rgba(251,113,133,0.6)]',
    tableStud: 'bg-[#f5c451]',
    tableWell: 'border-[#9f1239]/45 bg-[#26050d]',
    tableWellLit: 'bg-[#fbbf24]/[0.07]',
    tablePlaque: 'border-[#fde68a]/40 bg-[#c99a3e] text-[#3b0a12]',
    tableMat: 'border-[#fda4af]/25 bg-[#55111f]',
    tableFloor: 'bg-[#e11d48]/20',
    tableBulb:
      'bg-[#fb7185] shadow-[0_0_7px_1px_rgba(251,113,133,0.75)]',
    panelBorder: 'border-rose-400/15',
    chip: 'border-rose-500/25 bg-rose-500/10 text-rose-300 ',
    podiumGlow: 'bg-rose-400/10',
  },
  {
    tableBorder: 'border-[#a87a40]',
    tableSurface: 'from-[#13603d] via-[#0d4a2f] to-[#0d4a2f]',
    tableEdge: 'bg-[#fde68a]/60',
    tableLeg: 'from-[#7a5026] to-[#3a2410]',
    tileBorder: 'border-[#86b98a]/45',
    spotLabel: 'text-[#fde68a]',
    tableRim: 'from-[#cf9a58] via-[#a06e36] to-[#6e4721]',
    tableShadow:
      'shadow-[0_22px_40px_-14px_rgba(0,0,0,0.85),0_0_34px_-8px_rgba(252,211,77,0.38)]',
    tableFelt: 'bg-[#0d4a2f]',
    tableWeave:
      'bg-[radial-gradient(rgba(187,247,208,0.08)_1px,transparent_1.3px)]',
    tableLamp:
      'bg-[radial-gradient(ellipse_at_50%_42%,rgba(254,240,138,0.2),transparent_62%)]',
    tableApron: 'from-[#7a5026] to-[#472c13]',
    tableNeon: 'bg-[#fcd34d] shadow-[0_0_10px_2px_rgba(252,211,77,0.55)]',
    tableStud: 'bg-[#fef3c7]',
    tableWell: 'border-[#86b98a]/40 bg-[#07351f]',
    tableWellLit: 'bg-[#fef08a]/[0.07]',
    tablePlaque: 'border-[#fef3c7]/45 bg-[#e3bd63] text-[#3f2a10]',
    tableMat: 'border-[#fde68a]/30 bg-[#105a39]',
    tableFloor: 'bg-[#facc15]/15',
    tableBulb:
      'bg-[#fcd34d] shadow-[0_0_7px_1px_rgba(252,211,77,0.75)]',
    panelBorder: 'border-emerald-400/15',
    chip: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300 ',
    podiumGlow: 'bg-emerald-400/10',
  },
  {
    tableBorder: 'border-[#6b2f8f]',
    tableSurface: 'from-[#401763] via-[#2d0f45] to-[#2d0f45]',
    tableEdge: 'bg-[#f5d0fe]/55',
    tableLeg: 'from-[#3f1660] to-[#1a0729]',
    tileBorder: 'border-[#c084fc]/45',
    spotLabel: 'text-[#f5d0fe]',
    tableRim: 'from-[#7d3aa6] via-[#521f78] to-[#33124d]',
    tableShadow:
      'shadow-[0_22px_40px_-14px_rgba(0,0,0,0.85),0_0_34px_-8px_rgba(244,114,182,0.42)]',
    tableFelt: 'bg-[#2d0f45]',
    tableWeave:
      'bg-[radial-gradient(rgba(245,208,254,0.08)_1px,transparent_1.3px)]',
    tableLamp:
      'bg-[radial-gradient(ellipse_at_50%_42%,rgba(249,168,212,0.18),transparent_62%)]',
    tableApron: 'from-[#3f1660] to-[#1f0933]',
    tableNeon: 'bg-[#f472b6] shadow-[0_0_10px_2px_rgba(244,114,182,0.6)]',
    tableStud: 'bg-[#fbcfe8]',
    tableWell: 'border-[#c084fc]/40 bg-[#1d0730]',
    tableWellLit: 'bg-[#f9a8d4]/[0.07]',
    tablePlaque: 'border-[#fce7f3]/45 bg-[#e6a8c6] text-[#3b0764]',
    tableMat: 'border-[#f9a8d4]/30 bg-[#3d1560]',
    tableFloor: 'bg-[#d946ef]/20',
    tableBulb:
      'bg-[#f472b6] shadow-[0_0_7px_1px_rgba(244,114,182,0.75)]',
    panelBorder: 'border-purple-400/15',
    chip: 'border-purple-500/25 bg-purple-500/10 text-purple-300 ',
    podiumGlow: 'bg-purple-400/10',
  },
];

export function studioAccents(theme: number): StudioAccents {
  return STUDIO_ACCENTS[theme % STUDIO_ACCENTS.length];
}

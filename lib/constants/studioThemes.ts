// The four seasonal looks: the table accents that follow the cup's season

export type StudioAccents = {
  tableBorder: string;
  tableSurface: string;
  tableEdge: string;
  tableLeg: string;
  tileBorder: string;
  spotLabel: string;
  panelBorder: string;
  chip: string;
  podiumGlow: string;
};

export const STUDIO_ACCENTS: StudioAccents[] = [
  {
    tableBorder: 'border-amber-700/50',
    tableSurface: 'from-amber-800/80 via-amber-900/90 to-amber-900/90',
    tableEdge: 'bg-amber-600/50',
    tableLeg: 'from-amber-900 to-amber-900/60',
    tileBorder: 'border-amber-500/30',
    spotLabel: 'text-amber-300',
    panelBorder: 'border-sky-200/10',
    chip: 'border-red-500/25 bg-red-500/10 text-red-300',
    podiumGlow: 'bg-sky-300/10',
  },
  {
    tableBorder: 'border-rose-800/60',
    tableSurface: 'from-rose-900/80 via-[#4c0f1e]/90 to-[#4c0f1e]/90',
    tableEdge: 'bg-rose-500/40',
    tableLeg: 'from-[#4c0f1e] to-[#4c0f1e]/60',
    tileBorder: 'border-rose-500/30',
    spotLabel: 'text-rose-300',
    panelBorder: 'border-rose-400/15',
    chip: 'border-rose-500/25 bg-rose-500/10 text-rose-300',
    podiumGlow: 'bg-rose-400/10',
  },
  {
    tableBorder: 'border-emerald-700/50',
    tableSurface: 'from-emerald-800/80 via-emerald-950/90 to-emerald-950/90',
    tableEdge: 'bg-emerald-500/40',
    tableLeg: 'from-emerald-950 to-emerald-950/60',
    tileBorder: 'border-emerald-500/30',
    spotLabel: 'text-emerald-300',
    panelBorder: 'border-emerald-400/15',
    chip: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
    podiumGlow: 'bg-emerald-400/10',
  },
  {
    tableBorder: 'border-purple-700/50',
    tableSurface: 'from-purple-900/80 via-[#2a1050]/90 to-[#2a1050]/90',
    tableEdge: 'bg-purple-400/40',
    tableLeg: 'from-[#2a1050] to-[#2a1050]/60',
    tileBorder: 'border-purple-500/30',
    spotLabel: 'text-purple-300',
    panelBorder: 'border-purple-400/15',
    chip: 'border-purple-500/25 bg-purple-500/10 text-purple-300',
    podiumGlow: 'bg-purple-400/10',
  },
];

export function studioAccents(theme: number): StudioAccents {
  return STUDIO_ACCENTS[theme % STUDIO_ACCENTS.length];
}

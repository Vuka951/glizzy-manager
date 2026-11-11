import type { TownBuildingMode } from '@/lib/types/town';

// Parts of a facade that only live while the building is open: glows, lit
// screens, the people under the lights. A shut building keeps them drawn but
// invisible so the closing animation can flicker them out; an abandoned one
// never had them
export default function TownFacadeLit({
  mode,
  at = 0,
  children,
}: {
  mode: TownBuildingMode;
  at?: number;
  children: React.ReactNode;
}) {
  if (mode === 'abandoned') return null;
  if (mode === 'shut') {
    return (
      <g data-facade-off="" data-at={at} className="opacity-0">
        {children}
      </g>
    );
  }
  return <g>{children}</g>;
}

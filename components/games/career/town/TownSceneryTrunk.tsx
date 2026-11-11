export default function TownSceneryTrunk({ tone, fork = true }: { tone: string; fork?: boolean }) {
  return (
    <path
      d={fork ? 'M0 0V-36M0 -28L-14 -46M0 -36L12 -52' : 'M0 0V-40'}
      className={`fill-none ${tone}`}
      strokeWidth="6"
      strokeLinecap="round"
    />
  );
}

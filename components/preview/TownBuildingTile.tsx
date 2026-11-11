// One town building's art standing on a strip of night pavement, the way the
// building state previews draw it. The box is a full static class string
export default function TownBuildingTile({
  box,
  children,
}: {
  box: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-48 overflow-hidden rounded-xl border border-white/5 bg-gradient-to-b from-[#0b1430] via-[#121d3d] to-[#1a2547]">
      <div className="absolute inset-x-0 bottom-0 h-[16%] border-t-2 border-[#3b4458] bg-[#262d3d]" />
      <div
        className={`group/building absolute bottom-[10%] left-1/2 -translate-x-1/2 ${box}`}
      >
        {children}
      </div>
    </div>
  );
}

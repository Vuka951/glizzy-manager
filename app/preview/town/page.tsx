import type { Metadata } from "next";
import CareerFramesProvider from "@/components/games/career/CareerFramesProvider";
import PreviewPageShell from "@/components/preview/PreviewPageShell";
import TownPreviewLab from "@/components/preview/TownPreviewLab";

export const metadata: Metadata = {
  title: "Town",
};

export default function TownPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Town"
      note="Temporary page: editions, buildings open, abandoned and closed, the cup bus, league walkers, panels and the match table."
    >
      <CareerFramesProvider>
        <TownPreviewLab />
      </CareerFramesProvider>
    </PreviewPageShell>
  );
}

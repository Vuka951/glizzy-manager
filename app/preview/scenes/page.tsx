import type { Metadata } from "next";
import CareerFramesProvider from "@/components/games/career/CareerFramesProvider";
import PreviewPageShell from "@/components/preview/PreviewPageShell";
import ScenesPreviewLab from "@/components/preview/ScenesPreviewLab";

export const metadata: Metadata = {
  title: "Scenes",
};

export default function ScenesPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Scenes"
      note="Temporary page: monthly activity scenes, sabotage against you and lines after the match."
    >
      <CareerFramesProvider>
        <ScenesPreviewLab />
      </CareerFramesProvider>
    </PreviewPageShell>
  );
}

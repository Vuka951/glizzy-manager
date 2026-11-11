import type { Metadata } from "next";
import CareerFramesProvider from "@/components/games/career/CareerFramesProvider";
import ElectionPreviewLab from "@/components/preview/ElectionPreviewLab";
import GovernmentPreviewLab from "@/components/preview/GovernmentPreviewLab";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Elections and government",
};

export default function ElectionPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Elections and government"
      note="Temporary page: election night, election scenes, the coalition, the assembly, the calendar and the party favor at the cup."
    >
      <CareerFramesProvider>
        <ElectionPreviewLab />
        <GovernmentPreviewLab />
      </CareerFramesProvider>
    </PreviewPageShell>
  );
}

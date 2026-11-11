import type { Metadata } from "next";
import CareerFramesProvider from "@/components/games/career/CareerFramesProvider";
import MatchPreviewLab from "@/components/preview/MatchPreviewLab";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Match",
};

export default function MatchPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Match"
      note="Temporary page: a full match, stats at the table, interruptions, the nose, exit scenes and the match end in the bracket."
      widthClassName="max-w-6xl"
    >
      <CareerFramesProvider>
        <MatchPreviewLab />
      </CareerFramesProvider>
    </PreviewPageShell>
  );
}

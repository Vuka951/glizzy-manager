import type { Metadata } from "next";
import CareerFramesProvider from "@/components/games/career/CareerFramesProvider";
import CareerPreviewLab from "@/components/preview/CareerPreviewLab";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Career",
};

export default function CareerPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Career"
      note="Temporary page: the intro scene, the rival choice, the table, the wallet and the counter, sponsor terms, every law, the calendar, the Glizzy Overlord, the campaign end and achievements."
    >
      <CareerFramesProvider>
        <CareerPreviewLab />
      </CareerFramesProvider>
    </PreviewPageShell>
  );
}

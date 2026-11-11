import type { Metadata } from "next";
import CareerFramesProvider from "@/components/games/career/CareerFramesProvider";
import BroadcastPreviewLoader from "@/components/preview/BroadcastPreviewLoader";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Broadcast",
};

export default function BroadcastPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Broadcast"
      note="Temporary page: the commentator, the tale of the tape and the studio intro, without playing cups."
    >
      <CareerFramesProvider>
        <BroadcastPreviewLoader />
      </CareerFramesProvider>
    </PreviewPageShell>
  );
}

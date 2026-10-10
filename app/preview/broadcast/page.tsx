import type { Metadata } from "next";
import BroadcastPreviewLoader from "@/components/preview/BroadcastPreviewLoader";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Broadcast preview",
};

export default function BroadcastPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Broadcast preview"
      note="Temporary page: the commentator, the tale of the tape and the studio intro by unlock stage, without playing cups."
    >
      <BroadcastPreviewLoader />
    </PreviewPageShell>
  );
}

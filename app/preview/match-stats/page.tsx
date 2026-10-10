import type { Metadata } from "next";
import MatchStatsPreview from "@/components/preview/MatchStatsPreview";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Stats at the table",
};

export default function MatchStatsPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Stats at the table"
      note="The strip under the name carries the four skills and up to two warnings from the chart. An untrained skill fades, an average chart says nothing, and whatever you have not paid for shows as a question mark that tells you what you need."
      widthClassName="max-w-6xl"
    >
      <MatchStatsPreview />
    </PreviewPageShell>
  );
}

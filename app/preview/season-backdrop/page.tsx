import type { Metadata } from "next";
import PreviewPageShell from "@/components/preview/PreviewPageShell";
import SeasonBackdropPreview from "@/components/preview/SeasonBackdropPreview";

export const metadata: Metadata = {
  title: "Seasons preview",
};

export default function SeasonBackdropPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Seasons preview"
      note="Living backdrops, atmospheric light and seasonal details."
      widthClassName="max-w-7xl"
    >
      <SeasonBackdropPreview />
    </PreviewPageShell>
  );
}

import type { Metadata } from "next";
import PreviewPageShell from "@/components/preview/PreviewPageShell";
import SeasonBackdropPreview from "@/components/preview/SeasonBackdropPreview";

export const metadata: Metadata = {
  title: "Pregled godišnjih doba",
};

export default function SeasonBackdropPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Pregled godišnjih doba"
      note="Žive pozadine, atmosfersko svetlo i sezonski detalji."
      widthClassName="max-w-7xl"
    >
      <SeasonBackdropPreview />
    </PreviewPageShell>
  );
}

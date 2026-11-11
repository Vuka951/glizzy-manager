import type { Metadata } from "next";
import CharactersPreviewLab from "@/components/preview/CharactersPreviewLab";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Characters and seasons",
};

export default function CharactersPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Characters and seasons"
      note="Temporary page: moods, mood and sponsor in town, and the seasons."
      widthClassName="max-w-6xl"
    >
      <CharactersPreviewLab />
    </PreviewPageShell>
  );
}

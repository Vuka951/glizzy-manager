import type { Metadata } from "next";
import CreaturesPreviewLab from "@/components/preview/CreaturesPreviewLab";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Creatures",
};

export default function CreaturesPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Creatures"
      note="Temporary page: the creature every character gets from their name. Same name, same creature, on every device."
      widthClassName="max-w-6xl"
    >
      <CreaturesPreviewLab />
    </PreviewPageShell>
  );
}

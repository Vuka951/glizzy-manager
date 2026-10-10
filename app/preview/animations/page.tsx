import type { Metadata } from "next";
import AnimationsPreviewLab from "@/components/preview/AnimationsPreviewLab";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Animations preview",
};

export default function AnimationsPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Animations preview"
      note="Temporary page: every animation and rare game state on a click, without playing."
    >
      <AnimationsPreviewLab />
    </PreviewPageShell>
  );
}

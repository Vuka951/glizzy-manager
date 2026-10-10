import type { Metadata } from "next";
import AchievementToastPreview from "@/components/preview/AchievementToastPreview";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Achievement toast",
};

export default function AchievementToastPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Achievement toast"
      note="Every achievement on a click, without unlocking it."
      widthClassName="max-w-2xl"
    >
      <AchievementToastPreview />
    </PreviewPageShell>
  );
}

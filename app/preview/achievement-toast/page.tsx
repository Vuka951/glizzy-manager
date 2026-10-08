import type { Metadata } from "next";
import AchievementToastPreview from "@/components/preview/AchievementToastPreview";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Trofej toast",
};

export default function AchievementToastPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Trofej toast"
      note="Svaki trofej na klik, bez otključavanja."
      widthClassName="max-w-2xl"
    >
      <AchievementToastPreview />
    </PreviewPageShell>
  );
}

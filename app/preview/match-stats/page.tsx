import type { Metadata } from "next";
import MatchStatsPreview from "@/components/preview/MatchStatsPreview";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Statistika na stolu",
};

export default function MatchStatsPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Statistika na stolu"
      note="Traka ispod imena nosi četiri veštine i do dva upozorenja sa kartona. Neistrenirana veština bledi, prosečan karton ne kaže ništa, a ono što nisi platio stoji kao znak pitanja koji ti kaže šta ti treba."
      widthClassName="max-w-6xl"
    >
      <MatchStatsPreview />
    </PreviewPageShell>
  );
}

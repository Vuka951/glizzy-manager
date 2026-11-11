import type { Metadata } from "next";
import CareerFramesProvider from "@/components/games/career/CareerFramesProvider";
import LawsPreviewLab from "@/components/preview/LawsPreviewLab";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Laws",
};

export default function LawsPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Laws"
      note="Temporary page: law votes, the law catalog, the mail and the Gazette."
    >
      <CareerFramesProvider>
        <LawsPreviewLab />
      </CareerFramesProvider>
    </PreviewPageShell>
  );
}

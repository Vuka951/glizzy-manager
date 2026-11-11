import type { Metadata } from "next";
import CareerFramesProvider from "@/components/games/career/CareerFramesProvider";
import NewspaperPreviewLab from "@/components/preview/NewspaperPreviewLab";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Newspaper and mail",
};

export default function NewspaperPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Newspaper and mail"
      note="Temporary page: the paper with every kind of article, every newspaper picture and one letter of each kind."
    >
      <CareerFramesProvider>
        <NewspaperPreviewLab />
      </CareerFramesProvider>
    </PreviewPageShell>
  );
}

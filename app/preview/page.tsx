import type { Metadata } from "next";
import PreviewIndex from "@/components/preview/PreviewIndex";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Pregledi",
};

export default function PreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Pregledi"
      note="Privremene stranice: animacije, ekrani i retka stanja igre na klik, bez igranja."
      widthClassName="max-w-3xl"
    >
      <PreviewIndex />
    </PreviewPageShell>
  );
}

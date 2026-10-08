import type { Metadata } from "next";
import AnimationsPreviewLab from "@/components/preview/AnimationsPreviewLab";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Pregled animacija",
};

export default function AnimationsPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Pregled animacija"
      note="Privremena stranica: sve animacije i retka stanja igre na klik, bez igranja."
    >
      <AnimationsPreviewLab />
    </PreviewPageShell>
  );
}

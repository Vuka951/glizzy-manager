import type { Metadata } from "next";
import ElectionPreviewLab from "@/components/preview/ElectionPreviewLab";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Pregled izbora",
};

export default function ElectionPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Pregled izbora"
      note="Privremena stranica: izborna noć, skupština i anketa na klik, bez igranja."
    >
      <ElectionPreviewLab />
    </PreviewPageShell>
  );
}

import type { Metadata } from "next";
import ElectionPreviewLab from "@/components/preview/ElectionPreviewLab";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Election preview",
};

export default function ElectionPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Election preview"
      note="Temporary page: election night, the assembly and the poll on a click, without playing."
    >
      <ElectionPreviewLab />
    </PreviewPageShell>
  );
}

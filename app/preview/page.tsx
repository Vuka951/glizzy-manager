import type { Metadata } from "next";
import PreviewIndex from "@/components/preview/PreviewIndex";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Previews",
};

export default function PreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Previews"
      note="Temporary pages: animations, screens and rare game states on a click, without playing."
      widthClassName="max-w-3xl"
    >
      <PreviewIndex />
    </PreviewPageShell>
  );
}

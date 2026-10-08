import type { Metadata } from "next";
import BroadcastPreviewLoader from "@/components/preview/BroadcastPreviewLoader";
import PreviewPageShell from "@/components/preview/PreviewPageShell";

export const metadata: Metadata = {
  title: "Pregled prenosa",
};

export default function BroadcastPreviewPage() {
  return (
    <PreviewPageShell
      eyebrow="Preview"
      title="Pregled prenosa"
      note="Privremena stranica: komentator, tale of the tape i studio uvod po fazama otključavanja, bez igranja kupova."
    >
      <BroadcastPreviewLoader />
    </PreviewPageShell>
  );
}

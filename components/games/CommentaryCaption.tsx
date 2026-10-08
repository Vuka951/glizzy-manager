// Film-subtitle band for the commentator: pinned to the bottom of its
// positioned parent (or of the viewport, for a stage that can outgrow the
// screen), so a line arriving, changing or wrapping never moves what sits
// around it. The box reserves two lines of height so a one-liner and a
// two-liner share the same footprint
export default function CommentaryCaption({
  line,
  viewport = false,
}: {
  line: string | null;
  viewport?: boolean;
}) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none z-40 flex justify-center ${
        viewport ? 'fixed inset-x-4 bottom-16' : 'absolute inset-x-0 bottom-0'
      }`}
    >
      {line && (
        <p className="flex min-h-[3.25rem] w-full max-w-lg items-center justify-center rounded-md bg-slate-950/80 px-4 py-1.5 text-center text-sm font-semibold italic leading-snug text-white shadow-lg [text-shadow:0_1px_2px_rgba(0,0,0,0.9)] light:[text-shadow:none] animate-[bubblein_0.25s_ease-out]">
          {line}
        </p>
      )}
    </div>
  );
}

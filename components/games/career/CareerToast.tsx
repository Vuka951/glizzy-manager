import PaperSheet from '@/components/games/career/street/PaperSheet';

// A telegram strip with a perforated stub down its left edge: stamp red when
// it hurts, ink green when it helps
export default function CareerToast({
  tone,
  children,
}: {
  tone: 'danger' | 'success';
  children: React.ReactNode;
}) {
  return (
    <PaperSheet
      className={`max-w-xs animate-[bubblein_0.3s_ease-out] py-2.5 pl-6 pr-3.5 text-left font-serif text-[13px] font-semibold leading-snug ${
        tone === 'danger' ? 'text-red-300' : 'text-emerald-300'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-3 rounded-l-[2px] border-r-2 border-dotted border-[#f1e8d3] ${
          tone === 'danger' ? 'bg-[#b91c1c]' : 'bg-[#166534]'
        }`}
      />
      {children}
    </PaperSheet>
  );
}

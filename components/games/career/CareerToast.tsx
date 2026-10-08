export default function CareerToast({
  tone,
  children,
}: {
  tone: 'danger' | 'success';
  children: React.ReactNode;
}) {
  return (
    <div
      className={`max-w-xs animate-[bubblein_0.3s_ease-out] rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold shadow-xl backdrop-blur-sm ${
        tone === 'danger'
          ? 'border-red-500/50 bg-red-950/90 text-red-200'
          : 'border-emerald-400/50 bg-emerald-950/90 text-emerald-200'
      }`}
    >
      {children}
    </div>
  );
}

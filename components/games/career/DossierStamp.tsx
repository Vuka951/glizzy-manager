const STAMP_TONES = {
  rival: 'border-red-300 text-red-300 -rotate-3',
  self: 'border-emerald-300 text-emerald-300 -rotate-2',
  office: 'border-sky-300 text-sky-300 rotate-2',
};

// A rubber stamp on the personnel file
export default function DossierStamp({
  tone,
  children,
}: {
  tone: keyof typeof STAMP_TONES;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`rounded-[3px] border-2 px-1.5 font-sign text-[15px] font-extrabold uppercase leading-tight tracking-[0.08em] ${STAMP_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

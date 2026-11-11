const TONES = {
  red: 'bg-[radial-gradient(circle_at_35%_30%,#fecaca,#b91c1c_55%,#7f1d1d)]',
  brass: 'bg-[radial-gradient(circle_at_35%_30%,#fde68a,#b8862f_55%,#78350f)]',
} as const;

// The pushpin holding a notice to the cork
export default function NoticePin({
  tone = 'red',
}: {
  tone?: keyof typeof TONES;
}) {
  return (
    <span
      aria-hidden="true"
      className={`absolute left-1/2 top-1 h-3.5 w-3.5 -translate-x-1/2 rounded-full shadow-[1px_3px_2px_rgb(0_0_0/0.55)] ${TONES[tone]}`}
    />
  );
}

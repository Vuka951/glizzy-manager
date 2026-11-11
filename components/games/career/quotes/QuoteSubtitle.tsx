// The line in the lower third, typed on word by word. Every word holds its
// place from the start, so the text does not reflow while it fills in
export default function QuoteSubtitle({
  speakerName,
  words,
  shown,
}: {
  speakerName: string;
  words: string[];
  shown: number;
}) {
  return (
    <span className="flex flex-col gap-0.5 text-left animate-[bubblein_0.2s_ease-out]">
      <span className="font-sign text-[13px] font-bold uppercase leading-tight tracking-[0.08em] text-amber-300">
        {speakerName}
      </span>
      <span className="text-sm font-bold leading-snug text-slate-100">
        {words.map((word, index) => (
          <span
            key={index}
            className={
              index < shown
                ? 'opacity-100 transition-opacity duration-100'
                : 'opacity-0'
            }
          >
            {word}
            {index < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </span>
  );
}

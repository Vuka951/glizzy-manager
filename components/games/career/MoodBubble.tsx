import GlizzyIcon from '@/components/icons/GlizzyIcon';
import MoodGlyph from '@/components/games/career/MoodGlyph';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import { careerMoodFor } from '@/lib/utils/careerMood';

// The character always reacts to the strongest current meter combination
export default function MoodBubble({
  ch,
  small = false,
  className = '',
}: {
  ch: CharacterCareerState;
  small?: boolean;
  className?: string;
}) {
  const mood = careerMoodFor(ch);
  return (
    <div className={`absolute bottom-[92%] left-[68%] z-20 animate-[bubblein_0.35s_ease-out] ${className}`}>
      <div
        className={`relative flex items-center gap-1 rounded-2xl border border-slate-300 bg-slate-50 shadow-lg ${
          small ? 'px-1.5 py-1' : 'px-2.5 py-1.5'
        }`}
      >
        {mood.kind === 'emoji' ? (
          <span className={`leading-none ${small ? 'text-sm' : 'text-xl'}`}>
            {mood.symbol}
          </span>
        ) : (
          <MoodGlyph
            name={mood.name}
            className={small ? 'h-4 w-4' : 'h-6 w-6'}
          />
        )}
        {mood.glizzy && (
          <GlizzyIcon variant={0} className={small ? 'h-3 w-5' : 'h-4 w-7'} />
        )}
        <span
          className={`absolute left-2 rotate-45 border-b border-r border-slate-300 bg-slate-50 ${
            small ? '-bottom-1 h-2 w-2' : '-bottom-1.5 h-3 w-3'
          }`}
        />
      </div>
    </div>
  );
}

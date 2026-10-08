import GlizzyIcon from '@/components/icons/GlizzyIcon';
import Icon from '@/components/icons/Icon';
import LeafIcon from '@/components/icons/LeafIcon';
import NoseIcon from '@/components/icons/NoseIcon';
import { GAMES_UI } from '@/data/games/locale';
import { MATCH_SKILL_MAX, type MatchSkillId } from '@/lib/utils/matchStats';
import { fmt } from '@/lib/utils/format';

const MS = GAMES_UI.career.matchStats;

function SkillGlyph({ skill, dim }: { skill: MatchSkillId; dim: boolean }) {
  const tone = dim ? 'opacity-30' : '';
  if (skill === 'stomach') {
    return <GlizzyIcon variant={0} className={`h-2 w-3.5 shrink-0 ${tone}`} />;
  }
  if (skill === 'sniffer') {
    return <NoseIcon className={`h-2.5 w-2.5 shrink-0 text-amber-200 ${tone}`} />;
  }
  if (skill === 'nutrition') {
    return <LeafIcon className={`h-2.5 w-2.5 shrink-0 text-emerald-300 ${tone}`} />;
  }
  return (
    <Icon name="megaphone" className={`h-2.5 w-2.5 shrink-0 text-sky-300 ${tone}`} />
  );
}

// One trained skill as a glyph and its pips. An untrained skill fades out
// instead of shouting an empty row, so a raw fighter's strip stays quiet and a
// maxed one is the thing the eye lands on
export default function MatchSkillItem({
  skill,
  level,
}: {
  skill: MatchSkillId;
  level: number;
}) {
  const name = (MS.skills as Record<string, string>)[skill];
  const atMax = level >= MATCH_SKILL_MAX;
  return (
    <span title={fmt(MS.level, { name, level })} className="flex items-center gap-1">
      <SkillGlyph skill={skill} dim={level === 0} />
      <span className="flex items-center gap-px">
        {Array.from({ length: MATCH_SKILL_MAX }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i < level
                ? atMax
                  ? 'bg-emerald-300'
                  : 'bg-amber-400'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </span>
    </span>
  );
}

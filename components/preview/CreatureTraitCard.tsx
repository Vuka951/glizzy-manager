import CreatureAvatar from '@/components/games/CreatureAvatar';
import { GAMES_UI } from '@/data/games/locale';
import {
  creatureSpec,
  type CreatureBlush,
  type CreatureBrows,
  type CreatureEyes,
  type CreatureEyewear,
  type CreatureGear,
  type CreatureMouth,
  type CreatureMouthItem,
  type CreatureMustache,
  type CreatureNeckwear,
  type CreaturePattern,
  type CreatureRareTrait,
  type CreatureScene,
  type CreatureSideProp,
} from '@/lib/utils/creatureAvatar';

const EYES: Record<CreatureEyes, string> = {
  round: 'wide eyes',
  dot: 'dot eyes',
  sleepy: 'sleepy eyes',
  angry: 'angry eyes',
  happy: 'smiling eyes',
};
const BROWS: Record<CreatureBrows, string> = { none: '', thick: 'brows', unibrow: 'unibrow' };
const MOUTH: Record<CreatureMouth, string> = {
  grin: 'grin',
  smirk: 'smirk',
  flat: 'flat mouth',
  o: 'o mouth',
  tusks: 'tusks',
  gap: 'one tooth',
};
const MUSTACHE: Record<CreatureMustache, string> = {
  none: '',
  brush: 'mustache',
  handlebar: 'handlebar mustache',
  walrus: 'walrus mustache',
};
const GEAR: Record<CreatureGear, string> = {
  none: '',
  hat: 'hat',
  sock: 'sock',
  box: 'box',
  egg: 'egg on the head',
  crown: 'crown',
  fieldCap: 'field cap',
  furHat: 'fur hat',
  scarf: 'headscarf',
  beanie: 'beanie',
};
const EYEWEAR: Record<CreatureEyewear, string> = { none: '', sunglasses: 'sunglasses', specs: 'glasses' };
const MOUTH_ITEM: Record<CreatureMouthItem, string> = {
  none: '',
  glizzy: 'glizzy in the mouth',
  toothpick: 'toothpick',
};
const NECKWEAR: Record<CreatureNeckwear, string> = {
  none: '',
  chain: 'gold chain',
  garland: 'pepper garland',
  medal: 'medal',
  wovenScarf: 'woven scarf',
};
const SIDE_PROP: Record<CreatureSideProp, string> = {
  none: '',
  eggplant: 'eggplant',
  fly: 'fly',
};
const BLUSH: Record<CreatureBlush, string> = { none: '', soft: 'blush', flush: 'red cheeks' };
const PATTERN: Record<CreaturePattern, string> = {
  none: '',
  drips: 'drips',
  zigzag: 'mustard zigzag',
  woven: 'woven pattern',
};
const SCENE: Record<CreatureScene, string> = {
  plain: 'wall',
  tower: 'tower',
  gorge: 'gorge',
  bridge: 'bridge',
  peaks: 'mountains',
  sun: 'sun',
  woven: 'woven rug',
  tablecloth: 'tablecloth',
  peppers: 'pepper garlands',
  grill: 'grill',
  night: 'night',
};
const RARE: Record<CreatureRareTrait, string> = {
  none: '',
  freckle: 'freckle',
  scar: 'scar',
  plaster: 'plaster',
  goldTooth: 'gold tooth',
  stubble: 'stubble',
};

export function creatureTraits(name: string): string[] {
  const spec = creatureSpec(name);
  return [
    PATTERN[spec.pattern],
    spec.species.fixedEyes ? '' : EYES[spec.eyes],
    spec.species.fixedEyes ? '' : BROWS[spec.brows],
    spec.mouth ? MOUTH[spec.mouth] : '',
    MUSTACHE[spec.mustache],
    GEAR[spec.gear],
    EYEWEAR[spec.eyewear],
    MOUTH_ITEM[spec.mouthItem],
    NECKWEAR[spec.neckwear],
    SIDE_PROP[spec.sideProp],
    BLUSH[spec.blush],
    spec.sheen ? 'oily sheen' : '',
    RARE[spec.rare],
  ].filter(Boolean);
}

// One creature with the traits the name rolled, so a glance tells which
// combination a name lands on
export default function CreatureTraitCard({
  name,
  compact = false,
}: {
  name: string;
  compact?: boolean;
}) {
  const spec = creatureSpec(name);
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-sky-200/10 bg-slate-950/60 p-3 text-center text-slate-300">
      <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-frost-border/50 shadow-lg">
        <CreatureAvatar name={name} />
      </div>
      <span className="text-sm font-bold text-white">{name}</span>
      <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
        {GAMES_UI.creatures.species[spec.species.id]} / {SCENE[spec.scene]}
      </span>
      {!compact && (
        <p className="text-[10px] leading-relaxed text-slate-400">
          {creatureTraits(name).join(' · ')}
        </p>
      )}
    </div>
  );
}

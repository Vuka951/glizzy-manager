import MoodBubble from '@/components/games/career/MoodBubble';
import PortraitHead from '@/components/games/PortraitHead';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { newCharacterState } from '@/lib/utils/careerMeters';
import type { CharacterCareerState } from '@/lib/utils/careerSave';

type MoodMeters = Pick<
  CharacterCareerState,
  'stress' | 'appetite' | 'ambition' | 'ego' | 'fame'
>;

type MoodScenario = {
  id: string;
  label: string;
  meaning: string;
  meters: MoodMeters;
};

const BALANCED: MoodMeters = {
  stress: 45,
  appetite: 50,
  ambition: 50,
  ego: 45,
  fame: 50,
};

const scenario = (
  id: string,
  label: string,
  meaning: string,
  meters: Partial<MoodMeters>,
): MoodScenario => ({
  id,
  label,
  meaning,
  meters: { ...BALANCED, ...meters },
});

const MOOD_SCENARIOS: MoodScenario[] = [
  scenario('sick-stressed', 'Puca i prejeo se', 'Holesterol je preko 80, a apetit ispod 20.', {
    stress: 95,
    appetite: 10,
  }),
  scenario('hungry-stressed', 'Puca i izgladneo je', 'Kritični holesterol i glad zajedno.', {
    stress: 95,
    appetite: 95,
  }),
  scenario('overwhelmed', 'Previše problema', 'Najmanje dva kritična negativna signala.', {
    ambition: 5,
    ego: 5,
  }),
  scenario('conflicted', 'Pomešano raspoloženje', 'Jak pozitivan i kritičan negativan signal u isto vreme.', {
    stress: 95,
    ambition: 95,
  }),
  scenario('critical-stress', 'Kritičan holesterol', 'Holesterol je preko 80.', {
    stress: 95,
  }),
  scenario('overfull', 'Prejeo se', 'Apetit je ispod 20.', { appetite: 10 }),
  scenario('starving', 'Izgladneo je', 'Apetit je preko 80.', { appetite: 95 }),
  scenario('no-ambition', 'Odustaje', 'Ambicija je ispod 15, postoji rizik predaje.', {
    ambition: 5,
  }),
  scenario('no-ego', 'Jaka trema', 'Ego je ispod 15.', { ego: 5 }),
  scenario('unknown', 'Potpuno nepoznat', 'Slava je ispod 25.', { fame: 10 }),
  scenario('famous-ego', 'Zvezda sa velikim egom', 'Ego je preko 75, a slava najmanje 70.', {
    ego: 95,
    fame: 95,
  }),
  scenario('multiple-positive', 'Više jakih signala', 'Najmanje dva jaka pozitivna signala.', {
    ambition: 95,
    fame: 95,
  }),
  scenario('high-ego', 'Veliki ego', 'Ego je preko 75.', { ego: 95 }),
  scenario('famous', 'Slavan', 'Slava je najmanje 70.', { fame: 95 }),
  scenario('driven', 'Ambiciozan', 'Ambicija je najmanje 70.', { ambition: 95 }),
  scenario('tense', 'Napet', 'Holesterol je između 61 i 80.', { stress: 70 }),
  scenario('too-full', 'Još je prepun', 'Apetit je između 20 i 34.', { appetite: 25 }),
  scenario('hungry', 'Gladan', 'Apetit je između 66 i 80.', { appetite: 75 }),
  scenario('tired', 'Bez volje', 'Ambicija je između 15 i 24.', { ambition: 20 }),
  scenario('nervous', 'Nesiguran', 'Ego je između 15 i 24.', { ego: 20 }),
  scenario('low-profile', 'Niska slava', 'Slava je između 25 i 49.', { fame: 40 }),
  scenario('calm', 'Miran', 'Holesterol je 20 ili manje.', { stress: 10 }),
  scenario('happy', 'Odlično raspoložen', 'Brojevi su zdravi i uravnoteženi.', {
    stress: 25,
  }),
  scenario('neutral', 'Neutralan', 'Nijedan signal nije dovoljno jak da preuzme raspoloženje.', {}),
];

export default function MoodPreviewGrid({
  character,
}: {
  character: DuelCharacter;
}) {
  const base = newCharacterState(character.slug);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {MOOD_SCENARIOS.map(({ id, label, meaning, meters }) => {
        const mood: CharacterCareerState = { ...base, ...meters };
        return (
          <article
            key={id}
            className="flex min-h-52 flex-col rounded-2xl border border-sky-200/10 bg-slate-950/65 p-3"
          >
            <div className="relative mx-auto mt-8">
              <PortraitHead
                character={character}
                className="h-14 w-14 ring-2 ring-slate-700/70"
              />
              <MoodBubble ch={mood} />
            </div>
            <div className="mt-7 flex flex-1 flex-col gap-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-sky-200">
                {label}
              </h3>
              <p className="text-[11px] leading-relaxed text-slate-300">{meaning}</p>
              <p className="mt-auto border-t border-sky-200/10 pt-2 font-mono text-[9px] leading-relaxed text-slate-500">
                Hol. {meters.stress} · Ap. {meters.appetite} · Amb. {meters.ambition}
                <br />
                Ego {meters.ego} · Slava {meters.fame}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

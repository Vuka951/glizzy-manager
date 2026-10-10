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
  scenario('sick-stressed', 'Bursting and stuffed', 'Cholesterol is over 80 and appetite under 20.', {
    stress: 95,
    appetite: 10,
  }),
  scenario('hungry-stressed', 'Bursting and starving', 'Critical cholesterol and hunger together.', {
    stress: 95,
    appetite: 95,
  }),
  scenario('overwhelmed', 'Too many problems', 'At least two critical negative signals.', {
    ambition: 5,
    ego: 5,
  }),
  scenario('conflicted', 'Mixed mood', 'A strong positive and a critical negative signal at the same time.', {
    stress: 95,
    ambition: 95,
  }),
  scenario('critical-stress', 'Critical cholesterol', 'Cholesterol is over 80.', {
    stress: 95,
  }),
  scenario('overfull', 'Stuffed', 'Appetite is under 20.', { appetite: 10 }),
  scenario('starving', 'Starving', 'Appetite is over 80.', { appetite: 95 }),
  scenario('no-ambition', 'Giving up', 'Ambition is under 15, with a risk of forfeiting.', {
    ambition: 5,
  }),
  scenario('no-ego', 'Bad stage fright', 'Ego is under 15.', { ego: 5 }),
  scenario('unknown', 'Completely unknown', 'Fame is under 25.', { fame: 10 }),
  scenario('famous-ego', 'Star with a big ego', 'Ego is over 75 and fame at least 70.', {
    ego: 95,
    fame: 95,
  }),
  scenario('multiple-positive', 'Several strong signals', 'At least two strong positive signals.', {
    ambition: 95,
    fame: 95,
  }),
  scenario('high-ego', 'Big ego', 'Ego is over 75.', { ego: 95 }),
  scenario('famous', 'Famous', 'Fame is at least 70.', { fame: 95 }),
  scenario('driven', 'Driven', 'Ambition is at least 70.', { ambition: 95 }),
  scenario('tense', 'Tense', 'Cholesterol is between 61 and 80.', { stress: 70 }),
  scenario('too-full', 'Still too full', 'Appetite is between 20 and 34.', { appetite: 25 }),
  scenario('hungry', 'Hungry', 'Appetite is between 66 and 80.', { appetite: 75 }),
  scenario('tired', 'No drive', 'Ambition is between 15 and 24.', { ambition: 20 }),
  scenario('nervous', 'Insecure', 'Ego is between 15 and 24.', { ego: 20 }),
  scenario('low-profile', 'Low profile', 'Fame is between 25 and 49.', { fame: 40 }),
  scenario('calm', 'Calm', 'Cholesterol is 20 or less.', { stress: 10 }),
  scenario('happy', 'In great spirits', 'The numbers are healthy and balanced.', {
    stress: 25,
  }),
  scenario('neutral', 'Neutral', 'No signal is strong enough to take over the mood.', {}),
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
                Chol. {meters.stress} · App. {meters.appetite} · Amb. {meters.ambition}
                <br />
                Ego {meters.ego} · Fame {meters.fame}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

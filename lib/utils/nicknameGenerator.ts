import {
  CHARACTER_NAME_MAX_LENGTH,
  NICKNAME_CODAS,
  NICKNAME_DOUBLE_VOWELS,
  NICKNAME_FINAL_VOWELS,
  NICKNAME_ONSETS,
  NICKNAME_PLAIN_ONSETS,
  NICKNAME_SECOND_WORDS,
  NICKNAME_SECOND_WORD_CHANCE,
  NICKNAME_SHAPES,
  NICKNAME_VOWELS,
} from '@/lib/constants/characterNames';
import { isBlockedName, nameSlug } from '@/lib/utils/characterNames';

type Random = () => number;

function pick<T>(random: Random, options: readonly T[]): T {
  return options[Math.floor(random() * options.length)];
}

function shapeOf(random: Random): (typeof NICKNAME_SHAPES)[number][0] {
  const total = NICKNAME_SHAPES.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = random() * total;
  for (const [shape, weight] of NICKNAME_SHAPES) {
    cursor -= weight;
    if (cursor < 0) return shape;
  }
  return NICKNAME_SHAPES[0][0];
}

function capitalized(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function word(random: Random): string {
  const onset = pick(random, NICKNAME_ONSETS);
  const vowel = pick(random, NICKNAME_VOWELS);
  switch (shapeOf(random)) {
    case 'closed':
      // A cluster on both ends of one syllable is a mouthful in either language
      return (
        onset +
        vowel +
        pick(random, onset.length > 1 ? NICKNAME_CODAS.filter((c) => c.length === 1) : NICKNAME_CODAS)
      );
    case 'open':
      return (
        onset + vowel + pick(random, NICKNAME_PLAIN_ONSETS) + pick(random, NICKNAME_FINAL_VOWELS)
      );
    case 'long':
      return (
        onset +
        vowel +
        pick(random, NICKNAME_PLAIN_ONSETS) +
        pick(random, NICKNAME_VOWELS) +
        pick(random, NICKNAME_CODAS.filter((coda) => coda.length === 1))
      );
    case 'double': {
      const plain = pick(random, NICKNAME_PLAIN_ONSETS);
      return (
        plain + pick(random, NICKNAME_DOUBLE_VOWELS) + plain + pick(random, NICKNAME_FINAL_VOWELS)
      );
    }
  }
}

// One invented nickname: a short word or two, never a blocked name and
// never one of `takenSlugs`
export function generateNickname(random: Random, takenSlugs: ReadonlySet<string>): string {
  for (;;) {
    const first = capitalized(word(random));
    const name =
      random() < NICKNAME_SECOND_WORD_CHANCE
        ? `${first} ${pick(random, NICKNAME_SECOND_WORDS)}`
        : first;
    if (name.length > CHARACTER_NAME_MAX_LENGTH) continue;
    if (isBlockedName(name) || takenSlugs.has(nameSlug(name))) continue;
    return name;
  }
}

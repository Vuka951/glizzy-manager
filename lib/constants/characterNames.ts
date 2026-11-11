// A name the player writes: letters of the Latin alphabet (Serbian ones
// included), single spaces, hyphens and apostrophes between them
export const CHARACTER_NAME_MIN_LENGTH = 2;
export const CHARACTER_NAME_MAX_LENGTH = 16;
export const CHARACTER_NAME_PATTERN = /^\p{Script=Latin}+(?:[ '-]\p{Script=Latin}+)*$/u;

// Invented nicknames are built only from letters that read the same in
// English and Serbian, and end on a consonant or on o or e, so the
// masculine grammar of the Serbian text fits every one of them
export const NICKNAME_ONSETS = [
  'b', 'br', 'bl', 'd', 'dr', 'g', 'gr', 'gl', 'k', 'kr', 'kl', 'l', 'm',
  'n', 'p', 'pr', 'pl', 'r', 's', 'st', 'sl', 'sm', 'sp', 't', 'tr', 'v',
  'z', 'f', 'h',
] as const;

export const NICKNAME_PLAIN_ONSETS = [
  'b', 'd', 'g', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'z',
] as const;

export const NICKNAME_VOWELS = ['a', 'e', 'i', 'o', 'u'] as const;

export const NICKNAME_FINAL_VOWELS = ['o', 'e'] as const;

export const NICKNAME_CODAS = [
  'k', 'n', 'r', 's', 't', 'm', 'l', 'z', 'ks', 'nk', 'rk', 'st', 'mp', 'nt',
] as const;

// The shapes a nickname comes in, with how often each turns up: one closed
// syllable (Brok), two open ones (Tiko), two with a closing consonant
// (Tobar), and a doubled syllable (Bubo)
export const NICKNAME_SHAPES = [
  ['closed', 30],
  ['open', 45],
  ['long', 15],
  ['double', 10],
] as const;

// The playful second word some nicknames carry: words that need no
// translation and keep the masculine grammar
export const NICKNAME_SECOND_WORDS = [
  'Turbo', 'Robot', 'Meteor', 'Torpedo', 'Tornado', 'Gong', 'Motor', 'Radar',
  'Laser', 'Magnet', 'Sprint', 'Atom', 'Sonar', 'Rotor', 'Bizon', 'Balon',
  'Bumerang', 'Kompas', 'Rekord', 'Fenomen',
] as const;
export const NICKNAME_SECOND_WORD_CHANCE = 0.25;

// Names the generator must never produce, as textHash values of their
// slugs. A generated word matches when it equals one, or when it starts with
// one of four letters or more
export const BLOCKED_NAME_HASHES: ReadonlySet<number> = new Set([
  0xb6ef9244, 0x9b579f4d, 0xe34f206a, 0x1b0f622a, 0xf86dcc63, 0xdd404b6a,
  0xf8c99348, 0xb2740711, 0x300368de, 0xf14585cd, 0xf29d485c, 0x122f7818,
  0x48173634, 0x93dba575, 0xd331f13d, 0x31951ed9, 0x879db147, 0xaf9ab5f8,
  0x298ca192, 0x7e7d21c3, 0x6d857e78, 0xa5d9d195, 0x9f90a579, 0x17c0c37f,
  0x9841cafd,
]);

// Never generated anywhere inside a word: rude, drink and drug words in
// either language
export const NAME_FORBIDDEN_PARTS = [
  'kur', 'pic', 'pick', 'jeb', 'sis', 'sra', 'drol', 'kurv', 'peder', 'fuk',
  'fuc', 'dik', 'dick', 'cum', 'ass', 'tit', 'sex', 'seks', 'fag', 'nig',
  'shit', 'cunt', 'kunt', 'wank', 'slut', 'rape', 'nazi', 'piv', 'vino',
  'rakij', 'gin', 'rum', 'kok', 'trav', 'her', 'pot', 'weed', 'dop',
  'smrd', 'gov', 'pis', 'piz', 'debil', 'cmar', 'gay', 'gej', 'homo', 'pop',
  'bog', 'hrist', 'srb', 'hrv', 'rus', 'turk', 'arap', 'grk', 'cig', 'zid',
  'jew', 'stasi', 'mam', 'tat', 'kak', 'dump',
] as const;

// The doubled shape keeps to these, so it never lands on a pet name like Lili
export const NICKNAME_DOUBLE_VOWELS = ['a', 'o', 'u'] as const;

// Length of roster.epithets in both locale files: a league hands its
// characters different ones while the pool lasts
export const EPITHET_POOL_SIZE = 40;

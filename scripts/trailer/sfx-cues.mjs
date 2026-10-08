// The trailer's sound effects cue sheet, keyed to the narration. compose.mjs
// hands in two clocks: word(p, phrase), the moment a phrase starts being
// spoken in paragraph p, and cut(p, phrase), the moment the picture cuts for
// it (a hair before the word). A cue is [clip, seconds, volume, fade-out
// start]: a clip name from scripts/trailer/sfx, or game:<name> for one of the
// game's own effects in public/games/audio/sfx. mix.mjs levels every clip
// before the cue's volume applies, so volumes compare across clips.
//
// beats() holds the moments the picture and the sound share (the character
// spin's ticks, the three grabs, the end card's steps), so a pip fills on
// its chomp and the ring lands on its ding.

const SPIN_STEPS = 14;

export function beats({ word, paragraphEnd }) {
  const spinStart = word(1, 'Pick') - 0.1;
  const landing = word(1, 'and');
  // Ticks ease out: the gaps grow toward the landing, the last step's slot
  const ease = (i) => (1 - Math.sqrt(1 - i / SPIN_STEPS)) / (1 - Math.sqrt(1 / SPIN_STEPS));
  const spin = Array.from({ length: SPIN_STEPS - 1 }, (_, i) => spinStart + (landing - spinStart) * ease(i));
  const grabs = [word(2, 'Three'), word(2, 'grabs,') + 0.4, word(2, 'eat')];
  const endCard = word(7, 'Out-eat') - 0.45;
  return {
    spin,
    landing,
    grabs,
    chomps: grabs.map((t) => t + 0.45),
    titleStamp: word(0, 'wanted.') + 0.04,
    endCard,
    endSlam: word(7, 'Out-eat') + 0.04,
    endModes: paragraphEnd(7) + 0.1,
    endUrl: paragraphEnd(7) + 0.7,
  };
}

export function cueSheet({ word, cut }, b) {
  const cues = [];
  const add = (clip, at, volume, fadeAt) => cues.push([clip, at, volume, fadeAt]);
  const whoosh = (at) => add('soft_whoosh', at, 0.28, 0.65);
  const plink = (at) => add('sfx_plink', at, 0.3, 0.5);
  const boom = (at, volume = 0.4) => add('soft_boom', at, volume, 1.1);

  // Title: the card lands, the stamp hits on "wanted", a chip on "No"
  add('sfx_whoosh', 0.05, 0.3, 0.6);
  boom(0.3, 0.35);
  add('sfx_stamp', b.titleStamp, 0.6, 0.8);
  plink(word(0, 'No'));
  whoosh(cut(0, 'Strong'));
  add('game:paper-1', cut(0, 'Strong') + 0.05, 0.4, 0.4);
  plink(word(0, 'stomach'));
  add('game:chomp-1', word(0, 'required.') + 0.15, 0.6, 0.9);

  // Character select: the spin ticks and lands on a ding
  whoosh(cut(1, 'Glizzy'));
  b.spin.forEach((at) => add('sfx_tick', at, 0.35, 0.3));
  add('sfx_ding', b.landing + 0.05, 0.45, 0.8);
  plink(word(1, 'sixteen'));
  whoosh(cut(1, 'through'));

  // The match: a whoosh and a boom as it starts, a chime under the table,
  // a boom per prop, the guesses, grab and chomp three times, the buzzer
  add('sfx_whoosh', cut(2, 'The match'), 0.4, 0.65);
  boom(cut(2, 'The match') + 0.05);
  add('soft_chime', cut(2, 'Hide') - 0.1, 0.28, 1.3);
  boom(word(2, 'hat,') + 0.03);
  boom(word(2, 'sock') + 0.03, 0.3);
  boom(word(2, 'box.') + 0.03, 0.3);
  for (let i = 0; i < 3; i++) add('soft_whoosh', word(2, 'other') + i * 0.4, 0.35, 0.6);
  plink(word(2, 'Three'));
  b.grabs.forEach((at, i) => {
    add('sfx_grab', at + 0.1, 0.4, 0.6);
    add('game:chomp-1', b.chomps[i], 0.8, 0.9);
  });
  add('sfx_buzzer', word(2, 'lose.') - 0.05, 0.5, 0.7);
  boom(word(2, 'lose.'), 0.55);

  // The off-season: a whoosh on every screen, a plink on every chip, coins
  // on the cash, a scratch when the ego takes over
  whoosh(cut(3, "You don't"));
  plink(word(3, 'prepare.'));
  whoosh(cut(3, 'Three months'));
  plink(word(3, 'Three months'));
  whoosh(cut(3, 'one move'));
  plink(word(3, 'one move'));
  for (const phrase of ['train,', 'rest,', 'media']) {
    whoosh(cut(3, phrase));
    plink(word(3, phrase));
  }
  add('game:coins-medium', word(3, 'cash.') + 0.05, 0.35, 1.2);
  whoosh(cut(3, 'Money'));
  plink(word(3, 'security,'));
  for (const phrase of ['investments', 'sabotage.']) {
    whoosh(cut(3, phrase));
    plink(word(3, phrase));
  }
  whoosh(cut(3, 'And watch'));
  whoosh(cut(3, 'ego over'));
  plink(word(3, 'seventy-five,') + 0.3);
  add('sfx_scratch', word(3, 'they'), 0.4, 0.8);

  // The league: four cups pop and ding, the points, the crown
  whoosh(cut(4, 'Four cups'));
  for (let i = 0; i < 4; i++) plink(word(4, 'Four') + 0.15 + i * 0.2);
  add('sfx_ding', word(4, 'Four') + 0.95, 0.4, 0.8);
  plink(word(4, 'bracket'));
  whoosh(cut(4, 'A title'));
  add('game:trophy-1', word(4, 'title,'), 0.4, 0.5);
  plink(word(4, 'title,') + 0.3);
  whoosh(cut(4, 'A win'));
  plink(word(4, 'win,') + 0.2);
  plink(word(4, 'loss,') + 0.2);
  whoosh(cut(4, 'First to'));
  add('sfx_sting', word(4, 'First') + 0.25, 0.5, 1.6);
  add('sfx_chime', word(4, 'Overlord.') - 0.1, 0.4, 1.6);

  // Politics: a chip per word, a boom under the shrug
  whoosh(cut(5, 'There are'));
  plink(word(5, 'sponsors,'));
  for (const phrase of ['The Assembly', 'Elections.', 'Favors.']) {
    whoosh(cut(5, phrase));
    plink(word(5, phrase));
  }
  add('game:paper-1', word(5, 'Elections.') + 0.05, 0.35, 0.4);
  boom(word(5, "You'll") + 0.05, 0.45);

  // Rivals
  whoosh(cut(6, 'Glizzy Rivals'));
  plink(word(6, 'eight'));
  whoosh(cut(6, 'one room'));
  plink(word(6, 'code.') - 0.2);
  whoosh(cut(6, "Everyone's"));
  plink(word(6, 'runs'));
  whoosh(cut(6, 'you watch'));
  plink(word(6, 'cup') + 0.2);
  whoosh(cut(6, 'bet,'));
  plink(word(6, 'bet,'));
  add('game:coins-small', word(6, 'bet,') + 0.1, 0.3, 1.0);
  whoosh(cut(6, 'and sabotage'));
  plink(word(6, 'sabotage') + 0.2);

  // Sign-off: the end card sweeps in, the line is stamped, a chime as the
  // modes and the link land
  add('sfx_whoosh', b.endCard, 0.35, 0.65);
  add('sfx_stamp', b.endSlam, 0.5, 0.8);
  add('sfx_chime', b.endModes + 0.1, 0.4, 1.6);
  return cues;
}

import { RETIRED_LAWS, type LawId } from '@/data/games/careerLaws';
import type { LawBallot, LawCard } from '@/lib/utils/careerLaws';
import type { MailItem, Parliament } from '@/lib/utils/careerSave';

// What a stored law id reads as today: itself, its replacement, or null
// when the law left the game without one
function currentLawId(id: string): string | null {
  return id in RETIRED_LAWS ? RETIRED_LAWS[id] : id;
}

function hasRetired(ids: string[]): boolean {
  return ids.some((id) => id in RETIRED_LAWS);
}

function currentIds(ids: LawId[]): LawId[] {
  return ids
    .map((id) => currentLawId(id))
    .filter((id): id is LawId => id !== null);
}

// A ballot with every retired card mapped or taken off the table. A closed
// vote on a dropped card leaves the record; an open one goes back to the
// pick with whatever cards are left, and goes away if none are
function currentBallot(ballot: LawBallot): LawBallot | null {
  const ids = [
    ...ballot.cards.flatMap((c) => (c.action === 'constitution' ? [] : [c.law])),
    ...(ballot.repealed ?? []),
  ];
  if (!hasRetired(ids)) return ballot;
  const kept: { card: LawCard; from: number }[] = [];
  ballot.cards.forEach((card, from) => {
    if (card.action === 'constitution') {
      kept.push({ card, from });
      return;
    }
    const law = currentLawId(card.law);
    if (law !== null) kept.push({ card: { ...card, law: law as LawId }, from });
  });
  const pick =
    ballot.pick === null ? null : kept.findIndex((k) => k.from === ballot.pick);
  const repealed = ballot.repealed ? currentIds(ballot.repealed) : undefined;
  const cards = kept.map((k) => k.card);
  if (pick !== -1) {
    return { ...ballot, cards, pick, ...(repealed ? { repealed } : {}) };
  }
  if (ballot.outcome !== null || cards.length === 0) return null;
  return {
    ...ballot,
    cards,
    pick: null,
    autoPick: undefined,
    ballots: [],
    ...(repealed ? { repealed } : {}),
  };
}

// The chamber's books under today's laws: a retired law in force, on the
// table or in the record reads as its replacement or drops out
export function currentParliament(parliament: Parliament): Parliament {
  const laws = parliament.laws ?? [];
  const votes = parliament.lawVotes ?? [];
  const open = parliament.lawBallot;
  const touched =
    hasRetired(laws.map((l) => l.id)) ||
    votes.some((v) => currentBallot(v) !== v) ||
    (open ? currentBallot(open) !== open : false);
  if (!touched) return parliament;
  return {
    ...parliament,
    ...(parliament.laws
      ? {
          laws: laws.flatMap((l) => {
            const id = currentLawId(l.id);
            return id === null ? [] : [{ ...l, id: id as LawId }];
          }),
        }
      : {}),
    ...(parliament.lawVotes
      ? {
          lawVotes: votes
            .map(currentBallot)
            .filter((v): v is LawBallot => v !== null),
        }
      : {}),
    ...(open ? { lawBallot: currentBallot(open) } : {}),
  };
}

// The chamber's letters under today's laws: a vote letter on a dropped law
// is thrown out, and the repeal list and the bill's lines follow the books
export function currentLawMail(mail: MailItem[]): MailItem[] {
  return mail.flatMap((item) => {
    if (item.templateKey === 'law-vote') {
      const law = String(item.params.law ?? '');
      const repealed = String(item.params.repealed ?? '').split(',');
      if (!hasRetired([law, ...repealed])) return [item];
      const id = currentLawId(law);
      if (id === null) return [];
      return [
        {
          ...item,
          params: {
            ...item.params,
            law: id,
            repealed: repealed
              .map(currentLawId)
              .filter((r): r is string => Boolean(r))
              .join(','),
          },
        },
      ];
    }
    if (item.templateKey === 'law-bill') {
      const lines = String(item.params.lines ?? '').split(';');
      if (!hasRetired(lines.map((line) => line.split('=')[0]))) return [item];
      return [
        {
          ...item,
          params: {
            ...item.params,
            lines: lines
              .flatMap((line) => {
                const [law, amount] = line.split('=');
                const id = currentLawId(law);
                return id === null ? [] : [`${id}=${amount}`];
              })
              .join(';'),
          },
        },
      ];
    }
    return [item];
  });
}

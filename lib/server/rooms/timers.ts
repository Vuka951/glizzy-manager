const MAX_STEPS = 64;

// Nothing fires a deadline on its own: every request first applies whatever
// has passed. A room nobody polls simply waits. `step` returns the room after
// one phase transition whose gate is open, or null when nothing is due
export function advanceExpired<R>(
  room: R,
  now: number,
  step: (room: R, now: number) => R | null,
): R {
  let current = room;
  for (let i = 0; i < MAX_STEPS; i++) {
    const next = step(current, now);
    if (!next) return current;
    current = next;
  }
  return current;
}

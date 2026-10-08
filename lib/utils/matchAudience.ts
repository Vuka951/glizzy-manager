export function audienceSeed(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

// A stable number per fan so the same face keeps its shirt and rhythm across
// renders of the same match
export function crowdVariant(
  name: string,
  seed: number,
  index: number,
): number {
  return audienceSeed(`${name}:${seed}:${index}`);
}

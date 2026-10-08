// The arm swings out the near side instead of sweeping across the body
export function nearestTurn(from: number, to: number): number {
  const delta = ((((to - from + 180) % 360) + 360) % 360) - 180;
  return from + delta;
}

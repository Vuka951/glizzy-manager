import type { TownWalkGraph } from '@/lib/constants/townLayout';

// The shortest run of graph nodes from one to another, both ends included,
// or null when no path joins them
export function townWalkPath(graph: TownWalkGraph, from: string, to: string): string[] | null {
  if (!graph.nodes[from] || !graph.nodes[to]) return null;
  const dist = new Map<string, number>([[from, 0]]);
  const prev = new Map<string, string>();
  const open = new Set([from]);
  const done = new Set<string>();
  while (open.size > 0) {
    let current = '';
    let best = Infinity;
    open.forEach((id) => {
      const d = dist.get(id) ?? Infinity;
      if (d < best) {
        best = d;
        current = id;
      }
    });
    if (current === to) break;
    open.delete(current);
    done.add(current);
    const here = graph.nodes[current];
    for (const [a, b] of graph.paths) {
      const next = a === current ? b : b === current ? a : null;
      if (!next || done.has(next)) continue;
      const there = graph.nodes[next];
      const d = best + Math.hypot(there.x - here.x, there.y - here.y);
      if (d < (dist.get(next) ?? Infinity)) {
        dist.set(next, d);
        prev.set(next, current);
        open.add(next);
      }
    }
  }
  if (!dist.has(to)) return null;
  const path = [to];
  while (path[0] !== from) path.unshift(prev.get(path[0]) as string);
  return path;
}

// Every node of a kind: the doors, the open spots or the edges
export function townWalkNodes(graph: TownWalkGraph, kind: 'door' | 'rest' | 'edge'): string[] {
  return Object.keys(graph.nodes).filter((id) => Boolean(graph.nodes[id][kind]));
}

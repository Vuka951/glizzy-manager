import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TownLeagueWalker, {
  type TownLeagueArrival,
} from '@/components/games/career/town/TownLeagueWalker';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import {
  TOWN_LAYOUTS,
  type TownBuildingId,
  type TownLayoutKey,
} from '@/lib/constants/townLayout';
import { careerMoodActivityFor } from '@/lib/utils/careerMood';
import type { CharacterCareerState, SavedCareer } from '@/lib/utils/careerSave';
import { prefersReducedMotion } from '@/lib/utils/motion';
import { townDoor, type TownPoint } from '@/lib/utils/townFlow';
import {
  townLeagueCast,
  townLeagueCastPick,
  townLeagueFirstCast,
} from '@/lib/utils/townLeagueCast';
import { townWalkNodes } from '@/lib/utils/townWalk';

const COUNT: Record<TownLayoutKey, number> = { desk: 5, phone: 3 };
// Chance a newcomer is one of the other coaches' men, when one is free
const HUMAN_ODDS = 0.45;
const EDGE_ODDS = 0.6;
// An edge someone just walked in from rests this long, so two newcomers
// never come down the same path on top of each other
const EDGE_GAP_MS = 6000;

type Slot = { key: number; slug: string; from: string; arrival: TownLeagueArrival };

// The league's other characters out in town, a few at a time, the other
// coaches' men first and more often in a shared room, then the league's
// core cast, the earlier in its list the more often, ahead of the rest. Each
// strolls the whole walk graph, drops in at doors and leaves, and someone
// else from the league turns up in his place, walking in from an edge or out
// of a door
export default function TownLeagueWalkers({
  career,
  characterBySlug,
  layout,
  humanSlugs,
  closing,
  playerMood,
  tripTo,
}: {
  career: SavedCareer;
  characterBySlug: Map<string, DuelCharacter>;
  layout: TownLayoutKey;
  humanSlugs: string[];
  closing: boolean;
  playerMood: CharacterCareerState;
  tripTo: TownBuildingId | null;
}) {
  const L = TOWN_LAYOUTS[layout];
  const claims = useRef(new Map<string, string>());
  const activity = careerMoodActivityFor(playerMood);
  const avoid = useMemo<TownPoint[]>(() => {
    const spot = TOWN_LAYOUTS[layout].spots[activity];
    return [{ x: spot.x, y: spot.y }, ...(tripTo ? [townDoor(layout, tripTo)] : [])];
  }, [layout, activity, tripTo]);

  const cast = useMemo(
    () => townLeagueCast(career, humanSlugs, (slug) => characterBySlug.has(slug)),
    [career, characterBySlug, humanSlugs],
  );

  const [slots, setSlots] = useState<(Slot | null)[]>(() => {
    const spots = townWalkNodes(L.walk, 'rest').filter((id) => {
      const n = L.walk.nodes[id];
      return !avoid.some((p) => Math.hypot(p.x - n.x, p.y - n.y) < 40);
    });
    const first = townLeagueFirstCast(
      cast,
      humanSlugs,
      COUNT[layout],
      career.year * 4 + career.season,
    );
    return first.map((slug, i) => ({
      key: i,
      slug,
      from: spots[Math.floor((i * spots.length) / first.length) % spots.length],
      arrival: 'stand',
    }));
  });
  const shown = useRef(
    new Map<string, number>(slots.flatMap((s): [string, number][] => (s ? [[s.slug, 1]] : []))),
  );
  const edgeUsed = useRef(new Map<string, number>());
  const nextKey = useRef(COUNT[layout]);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const live = useRef({ slots, cast, avoid, closing });

  useEffect(() => {
    live.current = { slots, cast, avoid, closing };
  });

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => clearTimeout(t));
  }, []);

  // A free character weighted by his place among the ranked names and how
  // little he has been out, often one of the other coaches' men
  const newcomer = useCallback((leaving: string) => {
    const onScreen = live.current.slots.flatMap((s) => (s ? [s.slug] : []));
    const free = live.current.cast.everyone.filter((s) => !onScreen.includes(s));
    const fresh = free.filter((s) => s !== leaving);
    const pool = fresh.length > 0 ? fresh : free;
    const humans = pool.filter((s) => humanSlugs.includes(s));
    const from = humans.length > 0 && Math.random() < HUMAN_ODDS ? humans : pool;
    const count = (s: string) => shown.current.get(s) ?? 0;
    const slug = townLeagueCastPick(live.current.cast.ranked, from, count);
    if (slug) shown.current.set(slug, count(slug) + 1);
    return slug;
  }, [humanSlugs]);

  // Off the canvas at an edge, or out of a free door away from the player
  const entrance = useCallback((): Pick<Slot, 'from' | 'arrival'> => {
    const graph = TOWN_LAYOUTS[layout].walk;
    const doors = townWalkNodes(graph, 'door').filter((id) => {
      const n = graph.nodes[id];
      return (
        !claims.current.has(id) &&
        !live.current.avoid.some((p) => Math.hypot(p.x - n.x, p.y - n.y) < 40)
      );
    });
    const now = Date.now();
    const edges = townWalkNodes(graph, 'edge');
    const rested = edges.filter((id) => now - (edgeUsed.current.get(id) ?? 0) > EDGE_GAP_MS);
    const pickOne = (list: string[]) => list[Math.floor(Math.random() * list.length)];
    if (doors.length === 0 || Math.random() < EDGE_ODDS) {
      const from = pickOne(rested.length > 0 ? rested : edges);
      edgeUsed.current.set(from, now);
      return { from, arrival: 'edge' };
    }
    return { from: pickOne(doors), arrival: 'door' };
  }, [layout]);

  const gone = useCallback(
    (index: number, leaving: string) => {
      setSlots((list) => list.map((s, i) => (i === index ? null : s)));
      if (live.current.closing || prefersReducedMotion()) return;
      const timer = setTimeout(() => {
        timers.current.delete(timer);
        if (live.current.closing) return;
        const slug = newcomer(leaving);
        if (!slug) return;
        const slot: Slot = { key: nextKey.current, slug, ...entrance() };
        nextKey.current += 1;
        setSlots((list) => list.map((s, i) => (i === index ? slot : s)));
      }, 1500 + Math.random() * 3500);
      timers.current.add(timer);
    },
    [newcomer, entrance],
  );

  return (
    <>
      {slots.map((slot, i) => {
        if (!slot) return null;
        const character = characterBySlug.get(slot.slug);
        const state = career.characters[slot.slug];
        if (!character || !state) return null;
        return (
          <TownLeagueWalker
            key={slot.key}
            character={character}
            mood={state}
            layout={layout}
            from={slot.from}
            arrival={slot.arrival}
            slot={i}
            claims={claims}
            avoid={avoid}
            closing={closing}
            onGone={() => gone(i, slot.slug)}
          />
        );
      })}
    </>
  );
}

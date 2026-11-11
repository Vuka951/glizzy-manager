import { useEffect, useRef } from 'react';
import PortraitHead from '@/components/games/PortraitHead';
import MoodBubble from '@/components/games/career/MoodBubble';
import SponsorActorGear from '@/components/games/career/SponsorActorGear';
import { useSeatColors } from '@/components/games/rooms/seatColors';
import type { DuelCharacter } from '@/data/games/glizzyDuel';
import { SEAT_COLOR_CLASSES } from '@/lib/constants/rooms';
import {
  TOWN_LAYOUTS,
  type TownLayoutKey,
  type TownWalkNode,
} from '@/lib/constants/townLayout';
import type { CharacterCareerState } from '@/lib/utils/careerSave';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import { prefersReducedMotion } from '@/lib/utils/motion';
import { pauseWhileHidden, type TownPoint } from '@/lib/utils/townFlow';
import { townWalkNodes, townWalkPath } from '@/lib/utils/townWalk';

// How he turns up: already standing at his spot, walking in from off the
// canvas, or stepping out of a building's door
export type TownLeagueArrival = 'stand' | 'edge' | 'door';

const SIZE: Record<TownLayoutKey, string> = {
  desk: 'h-[32px] w-[32px]',
  phone: 'h-[20px] w-[20px]',
};
// Sponsor gear is drawn for the player's 40 px seat portrait, so it is laid
// out on a box that size and shrunk to his
const GEAR: Record<TownLayoutKey, string> = {
  desk: 'scale-[0.8]',
  phone: 'scale-50',
};
// His bubble shrunk to his size, so the player's own stays the big one
const BUBBLE: Record<TownLayoutKey, string> = {
  desk: 'origin-bottom-left scale-[0.7]',
  phone: 'origin-bottom-left scale-[0.55]',
};
// Canvas pixels per millisecond: an unhurried stroll, slower than him
const SPEED: Record<TownLayoutKey, number> = { desk: 0.05, phone: 0.028 };
const STEP_MS = 180;
// Keyframe spacing along a path, so his depth follows his feet
const SAMPLE = 12;
// Fade over this much of a path that starts or ends off the canvas
const FADE: Record<TownLayoutKey, number> = { desk: 60, phone: 30 };
// This close to the player's spot or errand door counts as in his way
const NEAR: Record<TownLayoutKey, number> = { desk: 56, phone: 48 };
const DOOR_MS = 650;

const at = (p: TownPoint) => `translate(${p.x}px, ${p.y}px)`;

// One of the league's other characters out in town. He arrives, makes a few
// stops along the walk graph (open spots he lingers at, doors he goes in at
// and mostly comes back out of), never at a stop another walker holds or
// where the player stands, then leaves by an edge or stays inside and calls
// `onGone`. His mood bubble shows whenever he stands still. At closing time he
// heads off toward the cup; on the lite animation level he stays where he
// is, and under reduced motion he stands at his first spot
export default function TownLeagueWalker({
  character,
  mood,
  layout,
  from,
  arrival,
  slot,
  claims,
  avoid,
  closing,
  onGone,
}: {
  character: DuelCharacter;
  mood: CharacterCareerState;
  layout: TownLayoutKey;
  from: string;
  arrival: TownLeagueArrival;
  slot: number;
  // Stops held by the walkers, by node id, so two never share one
  claims: { current: Map<string, string> };
  // The player's spot and the door he is heading to
  avoid: TownPoint[];
  closing: boolean;
  onGone: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLSpanElement | null>(null);
  const startRef = useRef({ from, arrival, slot });
  const avoidRef = useRef(avoid);
  const closingRef = useRef(closing);
  const onGoneRef = useRef(onGone);
  const wakeRef = useRef<(() => void) | null>(null);
  const restingAtRef = useRef<TownWalkNode | null>(null);
  // Read at each walk and rest, so the animation level applies from the next
  // one without restarting him
  const ambient = useAmbientMotion();
  const ambientRef = useRef(ambient);
  // Another coach's man wears his seat's color; everyone else stays plain so
  // the viewer's own ring is the only colored one in single player
  const seat = useSeatColors()[character.slug];

  useEffect(() => {
    avoidRef.current = avoid;
    closingRef.current = closing;
    onGoneRef.current = onGone;
    ambientRef.current = ambient;
  });

  // Switching to lite stops a bob that is already running
  useEffect(() => {
    if (!ambient) bodyRef.current?.getAnimations().forEach((a) => a.cancel());
  }, [ambient]);

  // Closing, or the player turning up where he lingers, cuts his rest short
  useEffect(() => {
    const here = restingAtRef.current;
    const crowded =
      here !== null &&
      avoid.some((p) => Math.hypot(p.x - here.x, p.y - here.y) < NEAR[layout]);
    if (closing || crowded) wakeRef.current?.();
  }, [closing, avoid, layout]);

  // A walker dropped mid-window gives back the stop he held
  useEffect(() => {
    const slug = character.slug;
    const held = claims.current;
    return () => {
      held.forEach((who, id) => {
        if (who === slug) held.delete(id);
      });
    };
  }, [claims, character.slug]);

  useEffect(() => {
    const root = rootRef.current;
    const body = bodyRef.current;
    const bubble = bubbleRef.current;
    if (!root || !body || !bubble) return;
    const graph = TOWN_LAYOUTS[layout].walk;
    const node = (id: string) => graph.nodes[id];
    const mine = character.slug;
    const start = startRef.current;
    let here = start.from;

    const place = (p: TownPoint, opacity = 1) => {
      root.style.transform = at(p);
      root.style.zIndex = String(Math.round(p.y) + 1);
      root.style.opacity = String(opacity);
    };
    const showBubble = (on: boolean) => {
      bubble.style.opacity = on ? '1' : '0';
    };
    const release = () => {
      claims.current.forEach((who, id) => {
        if (who === mine) claims.current.delete(id);
      });
    };
    const claim = (id: string) => {
      release();
      claims.current.set(id, mine);
    };
    const near = (p: TownPoint) =>
      avoidRef.current.some((a) => Math.hypot(a.x - p.x, a.y - p.y) < NEAR[layout]);

    if (prefersReducedMotion()) {
      place(node(here), closingRef.current ? 0 : 1);
      if (!node(here).edge) claim(here);
      showBubble(true);
      return;
    }

    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const running = new Set<Animation>();
    const track = (a: Animation) => {
      running.add(a);
      const forget = () => running.delete(a);
      a.finished.then(forget, forget);
      return a;
    };
    const unpause = pauseWhileHidden(root);
    // A rest that a wake cuts short and that holds while the tab is hidden
    const rest = (ms: number, standing: TownWalkNode | null = null) =>
      new Promise<void>((resolve) => {
        restingAtRef.current = standing;
        const done = () => {
          clearTimeout(timer);
          wakeRef.current = null;
          restingAtRef.current = null;
          if (!document.hidden || stopped) {
            resolve();
            return;
          }
          const back = () => {
            document.removeEventListener('visibilitychange', back);
            resolve();
          };
          document.addEventListener('visibilitychange', back);
        };
        wakeRef.current = done;
        timer = setTimeout(done, standing && near(standing) ? 0 : ms);
      });

    const settle = async (a: Animation) => {
      try {
        await a.finished;
      } catch {
        return false;
      }
      return !stopped;
    };

    // Along the graph's paths through `ids`, fading in from an edge he
    // starts at and out toward one he ends at
    const walk = async (ids: string[]) => {
      const points = ids.map(node);
      const samples: { p: TownPoint; d: number }[] = [{ p: points[0], d: 0 }];
      let total = 0;
      for (let k = 1; k < points.length; k += 1) {
        const a = points[k - 1];
        const b = points[k];
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        const steps = Math.max(1, Math.ceil(length / SAMPLE));
        for (let j = 1; j <= steps; j += 1) {
          samples.push({
            p: { x: a.x + ((b.x - a.x) * j) / steps, y: a.y + ((b.y - a.y) * j) / steps },
            d: total + (length * j) / steps,
          });
        }
        total += length;
      }
      const last = points[points.length - 1];
      if (total < 1) return !stopped;
      showBubble(false);
      const fade = FADE[layout];
      const frames: Keyframe[] = samples.map(({ p, d }) => ({
        transform: at(p),
        zIndex: Math.round(p.y) + 1,
        opacity: Math.max(
          0,
          Math.min(1, points[0].edge ? d / fade : 1, last.edge ? (total - d) / fade : 1),
        ),
        offset: d / total,
      }));
      const bob = ambientRef.current
        ? track(
            body.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-2px)' }], {
              duration: STEP_MS,
              direction: 'alternate',
              iterations: Infinity,
              easing: 'ease-in-out',
            }),
          )
        : null;
      const move = track(
        root.animate(frames, { duration: total / SPEED[layout], easing: 'linear', fill: 'forwards' }),
      );
      const ok = await settle(move);
      bob?.cancel();
      if (!ok) return false;
      place(last, last.edge ? 0 : 1);
      move.cancel();
      here = ids[ids.length - 1];
      return true;
    };

    // Up the step and in, shrinking through the door, or the same backwards
    const door = async (inside: boolean) => {
      const p = node(here);
      const z = Math.round(p.y) + 1;
      const outside: Keyframe = { transform: `${at(p)} scale(1)`, opacity: 1, zIndex: z };
      const within: Keyframe = {
        transform: `${at({ x: p.x, y: p.y - (p.climb ?? 5) })} scale(0.5)`,
        opacity: 0,
        zIndex: z,
      };
      showBubble(false);
      const a = track(
        root.animate(inside ? [outside, within] : [within, outside], {
          duration: DOOR_MS * (1 + (p.climb ?? 0) / 16),
          easing: inside ? 'ease-in' : 'ease-out',
          fill: 'forwards',
        }),
      );
      const ok = await settle(a);
      if (!ok) return false;
      place(p, inside ? 0 : 1);
      a.cancel();
      if (!inside) showBubble(true);
      return true;
    };

    const gone = () => {
      release();
      if (!stopped) onGoneRef.current();
    };

    // A free stop he can reach, a fresh one where he can
    const seen = new Set([here]);
    const pick = (doorsOnly = false) => {
      const p = node(here);
      const options = Object.keys(graph.nodes).filter((id) => {
        const n = node(id);
        if (!(doorsOnly ? n.door : n.rest || n.door) || id === here) return false;
        if (claims.current.has(id) || near(n)) return false;
        if (Math.hypot(n.x - p.x, n.y - p.y) < 30) return false;
        return townWalkPath(graph, here, id) !== null;
      });
      const fresh = options.filter((id) => !seen.has(id));
      const choice = fresh.length > 0 ? fresh : options;
      return choice.length > 0 ? choice[Math.floor(Math.random() * choice.length)] : null;
    };

    const leave = async (to: string | null) => {
      const exits = townWalkNodes(graph, 'edge')
        .map((id) => townWalkPath(graph, here, id))
        .filter((path): path is string[] => path !== null);
      const route =
        (to ? townWalkPath(graph, here, to) : null) ??
        exits[Math.floor(Math.random() * exits.length)];
      if (!route) return;
      release();
      if (await walk(route)) gone();
    };

    const run = async () => {
      if (start.arrival === 'edge') {
        place(node(here), 0);
      } else {
        claim(here);
        if (start.arrival === 'door') {
          place(node(here), 0);
          if (!(await door(false))) return;
          await rest(1500 + Math.random() * 2000, node(here));
        } else {
          place(node(here));
          showBubble(true);
          await rest(1500 + start.slot * 2200, node(here));
        }
      }
      let trips = 2 + Math.floor(Math.random() * 3);
      while (!stopped) {
        if (closingRef.current) {
          await rest(start.slot * 1400);
          if (!stopped) await leave(graph.cup);
          return;
        }
        if (!ambientRef.current && !node(here).edge) {
          await rest(2000, node(here));
          continue;
        }
        if (trips <= 0) {
          await leave(null);
          return;
        }
        const next = pick(trips === 1 && Math.random() < 0.4);
        if (!next) {
          await leave(null);
          return;
        }
        trips -= 1;
        seen.add(next);
        claim(next);
        const route = townWalkPath(graph, here, next);
        if (!route || !(await walk(route))) return;
        const stop = node(next);
        if (stop.door) {
          await rest(600 + Math.random() * 900);
          if (stopped || !(await door(true))) return;
          await rest(3500 + Math.random() * 4500);
          if (stopped || closingRef.current) return;
          // The last stop of his round can be where he stays
          if (trips <= 0 && Math.random() < 0.6) {
            gone();
            return;
          }
          while (near(stop) && !stopped) await rest(1500);
          if (stopped || !(await door(false))) return;
          await rest(1500 + Math.random() * 2000, stop);
        } else {
          showBubble(true);
          await rest(5000 + Math.random() * 4000, stop);
        }
      }
    };
    void run();

    return () => {
      stopped = true;
      clearTimeout(timer);
      wakeRef.current = null;
      restingAtRef.current = null;
      running.forEach((a) => a.cancel());
      unpause();
    };
  }, [layout, claims, character.slug]);

  return (
    <div
      ref={rootRef}
      data-town-league={character.slug}
      className="pointer-events-none absolute left-0 top-0 opacity-0"
    >
      <div className="absolute bottom-0 left-0 -translate-x-1/2">
        <span
          aria-hidden="true"
          className="absolute -bottom-1 left-[14%] right-[14%] h-1.5 rounded-full bg-black/40 blur-[1px]"
        />
        <div ref={bodyRef} className="relative">
          <PortraitHead
            character={character}
            className={`${SIZE[layout]} ring-2 ${
              seat ? SEAT_COLOR_CLASSES[seat.color].ring : 'ring-slate-600/70'
            }`}
          />
          {mood.sponsor && (
            <span
              className={`pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 ${GEAR[layout]}`}
            >
              <SponsorActorGear sponsorId={mood.sponsor.sponsorId} variant="seat" />
            </span>
          )}
          <span ref={bubbleRef} className="opacity-0 transition-opacity duration-300">
            <MoodBubble ch={mood} small className={BUBBLE[layout]} />
          </span>
        </div>
      </div>
    </div>
  );
}

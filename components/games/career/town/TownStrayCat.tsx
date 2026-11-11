import { useContext, useEffect, useRef } from 'react';
import { TownTrophiesContext } from '@/components/games/career/town/townTrophies';
import useAmbientMotion from '@/components/games/useAmbientMotion';
import { CAREER_CAT_POKES } from '@/data/games/achievements';
import { GAMES_UI } from '@/data/games/locale';
import { TOWN_LAYOUTS, type TownLayoutKey } from '@/lib/constants/townLayout';
import { achievementStore } from '@/lib/utils/achievements';
import { playCutsceneClip } from '@/lib/utils/cutsceneSounds';
import { prefersReducedMotion } from '@/lib/utils/motion';
import { pauseWhileHidden, type TownPoint } from '@/lib/utils/townFlow';
import { recordTownPoke } from '@/lib/utils/townPokes';
import { townWalkNodes, townWalkPath } from '@/lib/utils/townWalk';

const SIZE: Record<TownLayoutKey, string> = {
  desk: 'h-[20px] w-[22px]',
  phone: 'h-[13px] w-[14px]',
};
// Canvas pixels per millisecond, a little slower than the walkers
const SPEED: Record<TownLayoutKey, number> = { desk: 0.04, phone: 0.024 };
const STEP_MS = 150;
// Keyframe spacing along a stretch, so its depth follows its paws
const SAMPLE = 12;
// Fade over this much of a stretch that starts or ends off the canvas
const FADE: Record<TownLayoutKey, number> = { desk: 40, phone: 24 };

type Stop = TownPoint & { edge?: boolean };

const at = (p: TownPoint) => `translate(${p.x}px, ${p.y}px)`;

// A black cat roams the town: it sits at one of the layout's perches
// for a while, then walks the walk graph to another, slipping off an edge
// and back in where the graph does not join two perches. It goes back to
// the café step at closing time, and stays sitting where it is on the lite
// level or under reduced motion. A click meows, and in a real career it
// counts toward the cat achievement, walking or not
export default function TownStrayCat({
  layout,
  closing,
}: {
  layout: TownLayoutKey;
  closing: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLSpanElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tailRef = useRef<SVGPathElement | null>(null);
  const wakeRef = useRef<(() => void) | null>(null);
  const trophies = useContext(TownTrophiesContext);
  const ambient = useAmbientMotion();
  const ambientRef = useRef(ambient);
  const closingRef = useRef(closing);

  useEffect(() => {
    ambientRef.current = ambient;
    closingRef.current = closing;
  });

  // Switching to lite stills a tail that is already swaying
  useEffect(() => {
    if (!ambient) tailRef.current?.getAnimations().forEach((a) => a.cancel());
  }, [ambient]);

  // Closing cuts a rest short so it heads home right away
  useEffect(() => {
    if (closing) wakeRef.current?.();
  }, [closing]);

  useEffect(() => {
    const root = rootRef.current;
    const body = bodyRef.current;
    const svg = svgRef.current;
    const tail = tailRef.current;
    if (!root || !body || !svg || !tail) return;
    const graph = TOWN_LAYOUTS[layout].walk;
    const perches = TOWN_LAYOUTS[layout].catPerches;
    // A random perch each time the town opens, the café step at closing
    let perch = closingRef.current
      ? 0
      : Math.floor(Math.random() * perches.length);

    const place = (p: TownPoint, opacity = 1) => {
      root.style.transform = at(p);
      root.style.zIndex = String(Math.round(p.y) + 1);
      root.style.opacity = String(opacity);
    };
    const pose = (walking: boolean) => {
      root.dataset.pose = walking ? 'walk' : 'sit';
    };
    place(perches[perch]);
    pose(false);
    if (prefersReducedMotion()) return;

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
    // A rest that closing cuts short and that holds while the tab is hidden
    const rest = (ms: number) =>
      new Promise<void>((resolve) => {
        const done = () => {
          clearTimeout(timer);
          wakeRef.current = null;
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
        timer = setTimeout(done, ms);
      });
    const settle = async (a: Animation) => {
      try {
        await a.finished;
      } catch {
        return false;
      }
      return !stopped;
    };

    const sway = () => {
      if (!ambientRef.current) return null;
      return track(
        tail.animate([{ transform: 'rotate(-10deg)' }, { transform: 'rotate(12deg)' }], {
          duration: 1800,
          direction: 'alternate',
          iterations: Infinity,
          easing: 'ease-in-out',
        }),
      );
    };
    let tailSway = sway();

    // Straight stretch by stretch, facing the way it goes, fading out toward
    // an edge it ends at and in from one it starts at
    const walk = async (stops: Stop[]) => {
      const first = stops[0];
      const last = stops[stops.length - 1];
      tailSway?.cancel();
      pose(true);
      const legs = Array.from(svg.querySelectorAll<SVGElement>('[data-leg]'));
      const stride = legs.map((leg, i) =>
        track(
          leg.animate(
            [
              { transform: `rotate(${i % 2 ? 18 : -18}deg)` },
              { transform: `rotate(${i % 2 ? -18 : 18}deg)` },
            ],
            { duration: STEP_MS, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
          ),
        ),
      );
      const fade = FADE[layout];
      const opacityAt = (p: TownPoint) =>
        Math.max(
          0,
          Math.min(
            1,
            first.edge ? Math.hypot(p.x - first.x, p.y - first.y) / fade : 1,
            last.edge ? Math.hypot(p.x - last.x, p.y - last.y) / fade : 1,
          ),
        );
      let ok = true;
      for (let k = 1; k < stops.length && ok; k += 1) {
        const a = stops[k - 1];
        const b = stops[k];
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        if (length < 1) continue;
        body.style.transform = b.x < a.x ? 'scaleX(-1)' : '';
        const steps = Math.max(1, Math.ceil(length / SAMPLE));
        const frames: Keyframe[] = [];
        for (let j = 0; j <= steps; j += 1) {
          const p = { x: a.x + ((b.x - a.x) * j) / steps, y: a.y + ((b.y - a.y) * j) / steps };
          frames.push({ transform: at(p), zIndex: Math.round(p.y) + 1, opacity: opacityAt(p) });
        }
        const move = track(
          root.animate(frames, { duration: length / SPEED[layout], easing: 'linear', fill: 'forwards' }),
        );
        ok = await settle(move);
        if (ok) place(b, opacityAt(b));
        move.cancel();
      }
      stride.forEach((a) => a.cancel());
      if (!ok) return false;
      pose(false);
      tailSway = sway();
      return true;
    };

    const nodeStop = (id: string): Stop => graph.nodes[id];
    const edges = townWalkNodes(graph, 'edge');
    const reachable = (routes: (string[] | null)[]) =>
      routes.filter((route): route is string[] => route !== null);
    const pickOne = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

    // Down off its perch, along the graph, and up onto the next one; where
    // no path joins them it leaves by an edge and comes back by another
    const goTo = async (next: number) => {
      const from = perches[perch];
      const to = perches[next];
      const direct = townWalkPath(graph, from.node, to.node);
      if (direct) {
        if (!(await walk([from, ...direct.map(nodeStop), to]))) return false;
      } else {
        const out = reachable(edges.map((edge) => townWalkPath(graph, from.node, edge)));
        const back = reachable(edges.map((edge) => townWalkPath(graph, edge, to.node)));
        if (out.length === 0 || back.length === 0) return true;
        if (!(await walk([from, ...pickOne(out).map(nodeStop)]))) return false;
        await rest(1500 + Math.random() * 2500);
        if (stopped) return false;
        if (!(await walk([...pickOne(back).map(nodeStop), to]))) return false;
      }
      perch = next;
      return true;
    };

    const run = async () => {
      await rest(3000 + Math.random() * 5000);
      while (!stopped) {
        if (closingRef.current) {
          if (perch !== 0 && !(await goTo(0))) return;
          await rest(4000);
          continue;
        }
        if (!ambientRef.current) {
          await rest(2000);
          continue;
        }
        const options = perches.map((_, i) => i).filter((i) => i !== perch);
        if (!(await goTo(pickOne(options)))) return;
        await rest(8000 + Math.random() * 10000);
      }
    };
    void run();

    return () => {
      stopped = true;
      clearTimeout(timer);
      wakeRef.current = null;
      running.forEach((a) => a.cancel());
      unpause();
    };
  }, [layout]);

  const onPoke = () => {
    playCutsceneClip('cat-meow');
    if (trophies && recordTownPoke('cat') >= CAREER_CAT_POKES)
      achievementStore.unlock('career-cat');
    if (prefersReducedMotion()) return;
    svgRef.current?.animate(
      [
        { transform: 'rotate(0deg) scale(1)' },
        { transform: 'rotate(-6deg) scale(1.08)' },
        { transform: 'rotate(5deg) scale(0.94)' },
        { transform: 'rotate(-2deg) scale(1.04)' },
        { transform: 'rotate(0deg) scale(1)' },
      ],
      { duration: 650, easing: 'ease-in-out' },
    );
  };

  return (
    <div
      ref={rootRef}
      data-town-cat
      className="group/cat absolute left-0 top-0"
    >
      <div className="absolute bottom-0 left-0 -translate-x-1/2">
        <button
          type="button"
          aria-label={GAMES_UI.career.town.cat}
          onClick={onPoke}
          className={`block cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 ${SIZE[layout]}`}
        >
          <span ref={bodyRef} className="block h-full w-full">
            <svg
              ref={svgRef}
              viewBox="0 0 22 20"
              className="h-full w-full origin-bottom overflow-visible"
              aria-hidden="true"
            >
              <ellipse cx="11" cy="19.6" rx="8" ry="1.2" className="fill-slate-950/40" />
              <g className="group-data-[pose=walk]/cat:hidden">
                <path
                  ref={tailRef}
                  d="M16 19q8-1 6-10"
                  className="origin-bottom-left fill-none stroke-slate-950 [transform-box:fill-box]"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <g className="fill-slate-950">
                  <path d="M5 20q-1-10 6-12q6 1 6 12z" />
                  <circle cx="8.5" cy="6.5" r="4.2" />
                  <path d="M4.8 4l.5-4.4 2.8 2.6zM9.2 2.6l2.6-3.4 1 3.8z" />
                </g>
                <circle cx="7" cy="6.2" r="0.75" className="fill-amber-300" />
                <circle cx="10" cy="6.2" r="0.75" className="fill-amber-300" />
              </g>
              <g className="hidden group-data-[pose=walk]/cat:inline">
                <path
                  d="M4 12q-3-2-2-7"
                  className="fill-none stroke-slate-950"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                {['M5.5 14.5v5', 'M12.5 14.5v5', 'M8 14.5v5', 'M15 14.5v5'].map((d) => (
                  <path
                    key={d}
                    data-leg
                    d={d}
                    className="origin-top stroke-slate-950 [transform-box:fill-box]"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                ))}
                <g className="fill-slate-950">
                  <ellipse cx="10.5" cy="13" rx="7" ry="3.4" />
                  <circle cx="17.6" cy="9.6" r="3.3" />
                  <path d="M15.4 7.4l.5-3.6 2.1 2.3zM18.4 6.6l1.7-3 .7 3.5z" />
                </g>
                <circle cx="19" cy="9.3" r="0.7" className="fill-amber-300" />
              </g>
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

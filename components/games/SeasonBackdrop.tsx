import { useEffect, useRef, useState } from 'react';
import { playChompSound } from '@/lib/utils/gameSounds';

const SEASON_COUNT = 4;
const PARTICLE_COUNT = 18;

// Snow, petals, none for summer (gulls instead), leaves
const PARTICLE_CLASS = [
  'h-1.5 w-1.5 rounded-full bg-slate-100/85 shadow-[0_0_6px_rgba(226,232,240,0.65)]',
  'h-2 w-1.5 rounded-[70%_30%_70%_30%] bg-pink-300/80 shadow-[0_0_5px_rgba(249,168,212,0.45)]',
  '',
  "h-1 w-2 rounded-[100%_0_100%_0] bg-amber-400/70 shadow-[0_0_4px_rgba(251,191,36,0.3)] before:absolute before:left-1/2 before:top-1/2 before:h-px before:w-2 before:-translate-x-1/2 before:-translate-y-1/2 before:-rotate-12 before:bg-amber-950/45 before:content-['']",
];

const PARTICLE_LEFT = [
  'left-[4%]', 'left-[11%]', 'left-[19%]', 'left-[27%]', 'left-[34%]',
  'left-[42%]', 'left-[50%]', 'left-[58%]', 'left-[65%]', 'left-[73%]',
  'left-[80%]', 'left-[87%]', 'left-[93%]', 'left-[97%]',
  'left-[7%]', 'left-[23%]', 'left-[61%]', 'left-[90%]',
];

function Stars({ points }: { points: [number, number][] }) {
  return (
    <>
      {points.map(([x, y], i) => (
        <circle
          key={i}
          data-star
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 1.25 : i % 3 === 1 ? 0.7 : 0.9}
          className={`origin-center fill-slate-100 [transform-box:fill-box] ${i % 4 === 0 ? 'opacity-90' : 'opacity-55'}`}
        />
      ))}
    </>
  );
}

function CloudGroup({ x, y, scale = 1, tone }: { x: number; y: number; scale?: number; tone: string }) {
  return (
    <g data-cloud transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="26" ry="9" className={tone} />
      <ellipse cx="18" cy="-5" rx="16" ry="8" className={tone} />
      <ellipse cx="-18" cy="-4" rx="14" ry="7" className={tone} />
      <ellipse cx="0" cy="-5" rx="22" ry="7" className="fill-slate-100/5" />
    </g>
  );
}

function BushCluster({
  x,
  y,
  scale = 1,
  tones,
  snow = false,
  berries,
}: {
  x: number;
  y: number;
  scale?: number;
  tones: [string, string];
  snow?: boolean;
  berries?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="-10" cy="2" rx="13" ry="8" className={tones[1]} />
      <ellipse cx="8" cy="0" rx="15" ry="10" className={tones[0]} />
      <ellipse cx="0" cy="5" rx="18" ry="6" className={tones[1]} />
      {snow && <ellipse cx="6" cy="-7" rx="11" ry="3" className="fill-slate-100/80" />}
      {berries && (
        <>
          <circle cx="2" cy="-4" r="1.8" className={berries} />
          <circle cx="12" cy="-2" r="1.8" className={berries} />
          <circle cx="-8" cy="-1" r="1.6" className={berries} />
        </>
      )}
    </g>
  );
}

function PineRow({
  y,
  xs,
  height,
  tone,
  trunkTone = 'fill-[#493329]',
  groundYs,
}: {
  y: number;
  xs: number[];
  height: number;
  tone: string;
  trunkTone?: string;
  groundYs?: number[];
}) {
  return (
    <>
      {xs.map((x, index) => {
        const trunkWidth = Math.max(2.5, height * 0.1);
        const treeTop = groundYs?.[index] !== undefined ? groundYs[index] - height * 1.08 : y;

        return (
          <g key={x}>
            <rect
              data-pine-trunk
              x={x - trunkWidth / 2}
              y={treeTop + height * 0.58}
              width={trunkWidth}
              height={height * 0.5}
              rx={trunkWidth * 0.3}
              className={trunkTone}
            />
            <path
              d={`M${x} ${treeTop} L${x - height * 0.27} ${treeTop + height * 0.52} L${x + height * 0.27} ${treeTop + height * 0.52} Z`}
              className={`${tone} opacity-75`}
            />
            <path
              d={`M${x} ${treeTop + height * 0.2} L${x - height * 0.42} ${treeTop + height * 0.84} L${x + height * 0.42} ${treeTop + height * 0.84} Z`}
              className={tone}
            />
          </g>
        );
      })}
    </>
  );
}

function WinterScene() {
  return (
    <>
      <defs>
        <linearGradient id="wSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1430" />
          <stop offset="0.7" stopColor="#17305c" />
          <stop offset="1" stopColor="#27446f" />
        </linearGradient>
        <linearGradient id="wAurora" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4ade80" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#38bdf8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#a78bfa" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="wLake" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5eead4" stopOpacity="0" />
          <stop offset="0.5" stopColor="#bae6fd" stopOpacity="0.28" />
          <stop offset="1" stopColor="#c4b5fd" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="480" height="270" fill="url(#wSky)" />
      <Stars points={[[30, 30], [70, 18], [130, 40], [180, 15], [235, 32], [300, 20], [340, 45], [455, 25], [430, 90], [210, 60], [95, 62]]} />
      <g data-aurora>
        <path d="M-20 70 C 80 20 160 95 260 55 S 420 80 500 35 L 500 15 C 400 55 300 25 220 60 S 60 45 -20 90 Z" fill="url(#wAurora)" />
      </g>
      <g data-aurora>
        <path d="M-20 105 C 90 60 180 120 290 85 S 430 105 500 70 L 500 58 C 410 90 310 60 230 92 S 70 80 -20 118 Z" fill="url(#wAurora)" opacity="0.5" />
      </g>
      <circle data-glow cx="402" cy="52" r="42" className="origin-center fill-sky-200/10 [transform-box:fill-box]" />
      <circle cx="402" cy="52" r="32" className="fill-slate-100/10" />
      <circle cx="402" cy="52" r="21" className="fill-[#e9eefb]" />
      <circle cx="394" cy="46" r="4" className="fill-slate-300/70" />
      <circle cx="409" cy="58" r="3" className="fill-slate-300/60" />
      <circle cx="406" cy="42" r="2" className="fill-slate-300/50" />
      <CloudGroup x={90} y={95} tone="fill-[#2c3f66]/80" />
      <CloudGroup x={330} y={120} scale={0.8} tone="fill-[#2c3f66]/70" />
      <CloudGroup x={445} y={85} scale={0.7} tone="fill-[#33486f]/70" />
      {/* mountains */}
      <path d="M-10 200 L60 130 L110 185 L160 120 L215 195 L270 135 L330 200 L390 140 L450 195 L500 160 L500 270 L-10 270 Z" className="fill-[#25355e]" />
      <path d="M42 148 L60 130 L78 148 L70 143 L60 154 L50 143 Z M141 139 L160 120 L179 139 L171 134 L160 146 L149 134 Z M252 153 L270 135 L288 153 L280 148 L270 159 L260 148 Z M373 157 L390 140 L407 157 L400 152 L390 163 L380 152 Z" className="fill-slate-100/80" />
      <path d="M-10 225 L50 175 L120 220 L200 170 L290 225 L360 180 L440 225 L500 195 L500 270 L-10 270 Z" className="fill-[#152142]" />
      {/* village + lake */}
      <ellipse cx="330" cy="232" rx="60" ry="10" className="fill-[#2a4a78]/70" />
      <g data-shimmer>
        <path d="M286 229 Q 330 224 374 229" className="fill-none stroke-sky-200/25" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M302 234 Q 330 231 358 234" className="fill-none stroke-cyan-200/20" strokeWidth="1" strokeLinecap="round" />
        <ellipse cx="330" cy="237" rx="34" ry="2" fill="url(#wLake)" />
      </g>
      <rect x="300" y="205" width="14" height="11" rx="1" className="fill-[#3a2e2a]" />
      <path d="M298 205 L307 197 L316 205 Z" className="fill-[#241c1a]" />
      <rect x="304" y="209" width="3" height="3" className="animate-pulse fill-amber-300" />
      <rect x="322" y="203" width="12" height="13" rx="1" className="fill-[#41332e]" />
      <path d="M320 203 L328 196 L336 203 Z" className="fill-[#241c1a]" />
      <rect x="326" y="207" width="3" height="3" className="fill-amber-200" />
      <rect x="344" y="200" width="7" height="18" className="fill-[#38302c]" />
      <path d="M342 200 L347.5 190 L353 200 Z" className="fill-[#241c1a]" />
      <rect x="346" y="204" width="2.5" height="2.5" className="animate-pulse fill-amber-300" />
      {/* forest + snow banks */}
      <PineRow y={196} xs={[20, 48, 425, 460]} height={44} tone="fill-[#0f3a30]" trunkTone="fill-[#493a36]" />
      <PineRow y={210} xs={[75, 105, 250, 395]} height={34} tone="fill-[#0c2f27]" trunkTone="fill-[#3f322f]" />
      <path d="M-10 250 Q 120 226 250 248 T 500 244 L 500 270 L -10 270 Z" className="fill-[#8fa7c9]/30" />
      <path d="M-10 262 Q 150 244 300 260 T 500 256 L 500 270 L -10 270 Z" className="fill-[#b9c9e2]/30" />
      {/* snowman */}
      <g data-poke>
        <circle cx="150" cy="246" r="12" className="fill-slate-100" />
        <circle cx="150" cy="229" r="8" className="fill-slate-100" />
        <circle cx="147" cy="227" r="1.1" className="fill-slate-800" />
        <circle cx="153" cy="227" r="1.1" className="fill-slate-800" />
        <path d="M150 230 l 6 1.5 -6 1.5 z" className="fill-orange-500" />
        <rect x="143" y="219" width="14" height="2.5" rx="1" className="fill-slate-800" />
        <rect x="146" y="212" width="8" height="7" rx="1" className="fill-slate-800" />
        <path d="M139 240 l -8 -6 M161 240 l 8 -6" className="stroke-[#6d4c36]" strokeWidth="1.6" strokeLinecap="round" />
      </g>
      <BushCluster x={214} y={252} tones={['fill-[#1c4a3c]', 'fill-[#143329]']} snow />
      <BushCluster x={330} y={258} scale={0.7} tones={['fill-[#1c4a3c]', 'fill-[#143329]']} snow />
      <ellipse cx="270" cy="262" rx="9" ry="4" className="fill-[#3b4a66]" />
      <ellipse cx="288" cy="265" rx="6" ry="3" className="fill-[#2c3a52]" />
      <ellipse cx="288" cy="263" rx="6" ry="1.6" className="fill-slate-100/70" />
    </>
  );
}

function SpringScene() {
  return (
    <>
      <defs>
        <linearGradient id="pSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#111a3f" />
          <stop offset="0.68" stopColor="#2d3d72" />
          <stop offset="1" stopColor="#416477" />
        </linearGradient>
        <radialGradient id="pMoonGlow">
          <stop offset="0" stopColor="#fde68a" stopOpacity="0.3" />
          <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pMeadow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d5b55" />
          <stop offset="1" stopColor="#173d45" />
        </linearGradient>
      </defs>
      <rect width="480" height="270" fill="url(#pSky)" />
      <Stars points={[[40, 22], [110, 35], [170, 18], [250, 30], [320, 16], [455, 40], [370, 55], [65, 55], [215, 55]]} />
      <circle data-glow cx="390" cy="48" r="42" fill="url(#pMoonGlow)" className="origin-center [transform-box:fill-box]" />
      <circle cx="390" cy="48" r="20" className="fill-amber-100/15" />
      <circle cx="390" cy="48" r="13" className="fill-[#f5e6a8]" />
      <circle cx="396" cy="43" r="11" fill="url(#pSky)" />
      <CloudGroup x={70} y={55} tone="fill-[#ad83ae]/55" />
      <CloudGroup x={250} y={85} scale={0.75} tone="fill-[#8b78a5]/45" />
      <CloudGroup x={440} y={110} scale={0.85} tone="fill-[#ad83ae]/45" />
      {/* rolling hills */}
      <path d="M-10 195 Q 100 160 220 190 T 500 180 L 500 270 L -10 270 Z" fill="url(#pMeadow)" />
      <path d="M-10 225 Q 130 195 260 222 T 500 214 L 500 270 L -10 270 Z" className="fill-[#12313d]" />
      <path data-shimmer d="M-10 204 Q 110 174 220 200 T 500 190" className="fill-none stroke-cyan-200/10" strokeWidth="2" strokeLinecap="round" />
      <PineRow y={185} xs={[190, 215, 305, 330, 470]} height={22} tone="fill-[#0d2a33]" trunkTone="fill-[#4a3026]" />
      {/* distant blossoms */}
      <g data-sway className="origin-bottom [transform-box:fill-box]">
        <path
          d="M244 222 V 202 L237 195 M244 208 L252 199"
          className="fill-none stroke-[#4a2c22]"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <circle cx="237" cy="194" r="6" className="fill-[#d88cac]" />
        <circle cx="247" cy="192" r="8" className="fill-[#e5a2bd]" />
        <circle cx="253" cy="200" r="5.5" className="fill-[#c77ba1]" />
      </g>
      <BushCluster
        x={244}
        y={222}
        scale={0.55}
        tones={['fill-[#2f7550]', 'fill-[#1f573e]']}
        berries="fill-pink-300"
      />
      <g data-sway className="origin-bottom [transform-box:fill-box]">
        <path
          d="M369 205 V 191 L364 186 M369 195 L375 188"
          className="fill-none stroke-[#4a2c22]"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="364" cy="185" r="5" className="fill-[#d78fb4]" />
        <circle cx="371" cy="184" r="6.5" className="fill-[#e5a2bd]" />
        <circle cx="376" cy="190" r="4.5" className="fill-[#c77ba1]" />
      </g>
      <BushCluster
        x={369}
        y={205}
        scale={0.45}
        tones={['fill-[#2f7550]', 'fill-[#1f573e]']}
        berries="fill-pink-300"
      />
      {/* big cherry trees */}
      <g data-sway className="origin-bottom-left [transform-box:fill-box]">
        <g data-poke>
          <path d="M52 258 V 214 L38 196 M52 224 L68 204" className="fill-none stroke-[#4a2c22]" strokeWidth="6" strokeLinecap="round" />
          <circle cx="34" cy="188" r="17" className="fill-[#e8a7c6]" />
          <circle cx="60" cy="178" r="20" className="fill-[#f0bcd4]" />
          <circle cx="80" cy="196" r="14" className="fill-[#e8a7c6]" />
          <circle cx="52" cy="200" r="15" className="fill-[#f0bcd4]/90" />
        </g>
      </g>
      <g data-sway className="origin-bottom-right [transform-box:fill-box]">
        <path d="M432 260 V 220 L420 204 M432 232 L446 212" className="fill-none stroke-[#4a2c22]" strokeWidth="5" strokeLinecap="round" />
        <circle cx="416" cy="197" r="14" className="fill-[#f0bcd4]" />
        <circle cx="440" cy="188" r="16" className="fill-[#e8a7c6]" />
        <circle cx="454" cy="204" r="11" className="fill-[#f0bcd4]" />
      </g>
      {/* fireflies */}
      {[[150, 200], [200, 230], [280, 210], [330, 240], [110, 235], [250, 250]].map(([x, y], i) => (
        <circle key={i} data-firefly cx={x} cy={y} r="1.6" className="fill-amber-300" />
      ))}
      {/* tulips scattered, not planted in a row */}
      <path d="M-10 252 Q 90 240 190 254 L 190 270 L -10 270 Z" className="fill-[#14382e]" />
      {(
        [
          [12, 262, 1, -4, 0], [30, 255, 0.75, 5, 1], [47, 264, 1.15, 0, 2],
          [63, 250, 0.7, -6, 0], [84, 261, 1, 4, 1], [101, 255, 0.85, -3, 2],
          [124, 263, 1.1, 6, 0], [149, 256, 0.8, -5, 1], [170, 262, 0.95, 3, 2],
          [210, 258, 0.7, 0, 1], [237, 264, 0.85, -4, 0],
        ] as const
      ).map(([x, y, s, r, c], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s}) rotate(${r})`}>
          <path d="M0 0 V -12" className="stroke-[#2f7a4f]" strokeWidth="1.6" />
          <path d="M0 -6 q 5 -2 6 -6" className="fill-none stroke-[#2f7a4f]" strokeWidth="1.2" />
          <path
            d="M-4 -18 q 4 -5 4 2 q 0 -7 4 -2 l -1 7 h -6 z"
            className={['fill-[#e0596a]', 'fill-[#eeb64f]', 'fill-[#d879b8]'][c]}
          />
        </g>
      ))}
      <BushCluster x={205} y={250} scale={0.8} tones={['fill-[#2d6a43]', 'fill-[#1d4a30]']} berries="fill-pink-300" />
      <BushCluster x={288} y={260} tones={['fill-[#2d6a43]', 'fill-[#1d4a30]']} berries="fill-amber-200" />
      {([[218, 232], [262, 240], [330, 236], [370, 244]] as const).map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x} ${y} v 5`} className="stroke-[#2f7a4f]" strokeWidth="1" />
          <circle cx={x} cy={y - 1.5} r="2" className={i % 2 ? 'fill-pink-300' : 'fill-amber-200'} />
        </g>
      ))}
      {/* eggplant garden */}
      <path d="M300 270 L316 250 H 470 L 486 270 Z" className="fill-[#3d2b22]" />
      {[336, 376, 416, 452].map((x) => (
        <g key={x}>
          <path d={`M${x} 252 V 234`} className="stroke-[#6d4c36]" strokeWidth="2" />
          <path d={`M${x} 240 q 8 -6 12 -1 M${x} 246 q -8 -6 -12 -1`} className="fill-none stroke-[#3f8f5a]" strokeWidth="2" />
          <ellipse cx={x - 6} cy={252} rx="5" ry="6.5" className="fill-[#5b2a86]" />
          <ellipse cx={x + 7} cy={249} rx="4.5" ry="6" className="fill-[#4a2370]" />
        </g>
      ))}
    </>
  );
}

function SummerScene() {
  return (
    <>
      <defs>
        <linearGradient id="lSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1738" />
          <stop offset="0.43" stopColor="#343863" />
          <stop offset="0.64" stopColor="#b86546" />
          <stop offset="0.76" stopColor="#f0b75f" />
        </linearGradient>
        <linearGradient id="lSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8d6848" />
          <stop offset="0.18" stopColor="#285b72" />
          <stop offset="1" stopColor="#0b2947" />
        </linearGradient>
        <radialGradient id="lGlow">
          <stop offset="0.3" stopColor="#f4b74a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#f4b74a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="480" height="270" fill="url(#lSky)" />
      <Stars points={[[40, 20], [120, 32], [200, 15], [300, 26], [420, 18]]} />
      <circle data-glow cx="330" cy="118" r="52" fill="url(#lGlow)" className="origin-center [transform-box:fill-box]" />
      <circle data-float cx="330" cy="118" r="20" className="origin-center fill-[#f8cd67] [transform-box:fill-box]" />
      <CloudGroup x={120} y={40} scale={0.8} tone="fill-[#d99a91]/35" />
      <CloudGroup x={255} y={62} scale={0.6} tone="fill-[#e1b58f]/30" />
      <CloudGroup x={420} y={78} scale={0.7} tone="fill-[#d99a91]/30" />
      <g data-gull><path d="M170 78 Q 175 72 180 77 Q 185 72 190 78" className="fill-none stroke-slate-200/80" strokeWidth="1.6" strokeLinecap="round" /></g>
      <g data-gull><path d="M250 60 Q 254 55 258 59 Q 262 55 266 60" className="fill-none stroke-slate-200/70" strokeWidth="1.4" strokeLinecap="round" /></g>
      {/* sea */}
      <rect x="-10" y="140" width="500" height="80" fill="url(#lSea)" />
      <g data-shimmer>
        {[146, 156, 168, 182, 198].map((y, i) => (
          <rect
            key={y}
            x={330 - 8 - i * 3}
            y={y}
            width={16 + i * 6}
            height="2.5"
            rx="1.25"
            className="fill-amber-300/40"
          />
        ))}
      </g>
      <g data-shimmer>
        {[[60, 152], [130, 165], [210, 158], [280, 176], [360, 168], [420, 155], [250, 190], [140, 195]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width={i % 2 ? 10 : 16} height="1.6" rx="0.8" className="fill-slate-100/35" />
        ))}
      </g>
      {/* the boat sails behind the headland, right across the sea, and wraps */}
      <g data-boat>
        <path d="M-60 158 h 20 l -5 6 h -11 z" className="fill-[#33241c]" />
        <path d="M-50 156 v -12 l 9 12 z" className="fill-slate-100/85" />
      </g>
      {/* headland */}
      <path d="M-10 128 L40 96 L90 122 L130 108 L170 145 L120 160 L-10 168 Z" className="fill-[#274436]" />
      <path d="M-10 150 L60 128 L140 152 L180 168 L-10 185 Z" className="fill-[#1b3328]" />
      {/* beach */}
      <path d="M-10 210 Q 140 188 300 214 T 500 208 L 500 270 L -10 270 Z" className="fill-[#d9a45f]/85" />
      <path d="M60 214 Q 200 200 340 218" className="fill-none stroke-slate-100/35" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M120 226 Q 260 214 400 228" className="fill-none stroke-slate-100/25" strokeWidth="2" strokeLinecap="round" />
      {/* umbrella + agave + rocks */}
      <g data-poke>
        <path d="M396 258 V 216" className="stroke-amber-100" strokeWidth="2.5" />
        <path d="M368 222 a 28 28 0 0 1 56 0 z" className="fill-[#e0596a]" />
        <path d="M382 222 a 28 28 0 0 1 9 -20 a 28 28 0 0 1 9 20 z" className="fill-amber-100" />
        <circle cx="396" cy="201" r="2.2" className="fill-amber-100" />
      </g>
      {[[56, 250], [88, 258], [300, 252]].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y} l -10 -16 M${x} ${y} l -3 -20 M${x} ${y} l 5 -18 M${x} ${y} l 11 -13`}
          className="fill-none stroke-[#274436]"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      <ellipse cx="180" cy="256" rx="14" ry="6" className="fill-[#6b4d33]" />
      <ellipse cx="238" cy="262" rx="10" ry="5" className="fill-[#59402b]" />
      <BushCluster x={130} y={246} scale={0.75} tones={['fill-[#4a5a2c]', 'fill-[#38451f]']} />
      <BushCluster x={330} y={252} scale={0.85} tones={['fill-[#4a5a2c]', 'fill-[#38451f]']} />
      {([[210, 246], [268, 252], [154, 262]] as const).map(([x, y], i) => (
        <path
          key={i}
          d={`M${x - 4} ${y} a 4 3 0 0 1 8 0 z`}
          className={i % 2 ? 'fill-[#e8d0b0]' : 'fill-[#d9b890]'}
        />
      ))}
      {/* palm fronds top-right */}
      <g data-frond className="origin-top-right [transform-box:fill-box]">
        <path d="M500 -10 C 430 10 390 40 370 85 C 400 60 450 30 500 20 Z" className="fill-[#132a22]" />
        <path d="M500 30 C 445 45 415 70 400 105 C 430 82 470 60 500 55 Z" className="fill-[#0e211b]" />
      </g>
    </>
  );
}

function AutumnScene() {
  return (
    <>
      <defs>
        <linearGradient id="kSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#11152d" />
          <stop offset="0.58" stopColor="#34243f" />
          <stop offset="0.78" stopColor="#9d4d32" />
          <stop offset="0.92" stopColor="#432633" />
        </linearGradient>
        <radialGradient id="kMoon">
          <stop offset="0" stopColor="#f7c66a" />
          <stop offset="0.72" stopColor="#dd7040" />
          <stop offset="1" stopColor="#b23c31" />
        </radialGradient>
        <radialGradient id="kMoonGlow">
          <stop offset="0" stopColor="#fb923c" stopOpacity="0.3" />
          <stop offset="1" stopColor="#fb923c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="kGround" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#421d22" />
          <stop offset="0.5" stopColor="#6b2c21" />
          <stop offset="1" stopColor="#3d1c27" />
        </linearGradient>
      </defs>
      <rect width="480" height="270" fill="url(#kSky)" />
      <Stars points={[[60, 25], [140, 15], [220, 35], [300, 18], [370, 42], [450, 30], [35, 60]]} />
      <circle data-glow cx="360" cy="55" r="48" fill="url(#kMoonGlow)" className="origin-center [transform-box:fill-box]" />
      <circle data-float cx="360" cy="55" r="20" fill="url(#kMoon)" className="origin-center [transform-box:fill-box]" />
      <circle cx="353" cy="49" r="4" className="fill-[#9f3429]/55" />
      <circle cx="367" cy="60" r="3" className="fill-[#9f3429]/50" />
      <ellipse cx="352" cy="66" rx="18" ry="4" className="fill-[#241a30]/70" />
      <CloudGroup x={90} y={45} tone="fill-[#241a30]/90" />
      <CloudGroup x={250} y={80} scale={0.85} tone="fill-[#2c2038]/80" />
      <CloudGroup x={450} y={95} scale={0.7} tone="fill-[#241a30]/80" />
      <path d="M60 48 q 40 10 90 4" className="fill-none stroke-[#93402c]/60" strokeWidth="2" strokeLinecap="round" />
      {/* hills + pines */}
      <path d="M-10 185 Q 110 150 240 180 T 500 168 L 500 270 L -10 270 Z" className="fill-[#231b33]" />
      <PineRow
        y={158}
        xs={[90, 112, 300, 322, 344, 470]}
        height={26}
        tone="fill-[#1a1428]"
        trunkTone="fill-[#3b241f]"
        groundYs={[202, 200, 214, 219, 223, 214]}
      />
      <path d="M-10 218 Q 140 190 300 214 T 500 206 L 500 270 L -10 270 Z" className="fill-[#191325]" />
      {/* fog */}
      <g data-fog><ellipse cx="140" cy="212" rx="120" ry="12" className="fill-slate-200/10" /></g>
      <g data-fog><ellipse cx="360" cy="228" rx="140" ry="13" className="fill-slate-200/10" /></g>
      <g data-float>
        <rect x="232" y="210" width="30" height="22" rx="2" className="fill-[#3a2725]" />
        <path d="M226 211 L247 193 L268 211 Z" className="fill-[#251a20]" />
        <rect x="239" y="216" width="6" height="7" rx="1" className="fill-amber-300/85" />
        <rect x="251" y="215" width="6" height="6" rx="1" className="fill-amber-200/75" />
        <path d="M259 199 V 188 h 5 v 16" className="fill-[#2d2022]" />
      </g>
      {/* bare tree + crows */}
      <path d="M46 262 V 200 M46 226 L20 196 M46 214 L74 188 M28 206 L16 188 M66 196 L78 176" className="fill-none stroke-[#4a2a1e]" strokeWidth="5" strokeLinecap="round" />
      <path d="M20 192 q 3 -5 7 -2 l -2 4 q 4 0 3 3 l -8 -1 z" className="fill-[#141019]" />
      <path d="M74 184 q 3 -5 7 -2 l -2 4 q 4 0 3 3 l -8 -1 z" className="fill-[#141019]" />
      {/* red trees right */}
      <g data-sway className="origin-bottom-right [transform-box:fill-box]">
        <path d="M420 262 V 224 L406 206 M420 236 L436 214" className="fill-none stroke-[#4a2a1e]" strokeWidth="5" strokeLinecap="round" />
        <circle cx="402" cy="200" r="15" className="fill-[#a83232]" />
        <circle cx="428" cy="190" r="18" className="fill-[#c44f32]" />
        <circle cx="446" cy="208" r="12" className="fill-[#d47a2d]" />
      </g>
      <rect x="351" y="228" width="4" height="18" rx="1" className="fill-[#4a2a1e]" />
      <circle cx="353" cy="224" r="10" className="fill-[#c46a2b]" />
      {/* ground */}
      <path d="M-10 248 Q 120 234 260 250 T 500 244 L 500 270 L -10 270 Z" fill="url(#kGround)" />
      <path d="M-10 262 Q 160 250 320 264 T 500 258 L 500 270 L -10 270 Z" className="fill-[#611f16]/80" />
      <ellipse cx="255" cy="257" rx="26" ry="6" className="fill-[#7a3020]" />
      {([[130, 246, 1], [148, 249, 0.8], [182, 245, 1.1], [292, 254, 0.7]] as const).map(
        ([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <g data-poke>
              <rect x="-2" y="0" width="4" height="9" rx="1.5" className="fill-[#e8d9b8]" />
              <path d="M-8 1 a 8 6 0 0 1 16 0 z" className="fill-[#c0392b]" />
              <circle cx="-3" cy="-3" r="1.2" className="fill-amber-50" />
              <circle cx="3" cy="-2" r="1.2" className="fill-amber-50" />
            </g>
          </g>
        ),
      )}
      <BushCluster x={215} y={248} scale={0.8} tones={['fill-[#6a3a24]', 'fill-[#54301e]']} berries="fill-[#c0392b]" />
      <BushCluster x={320} y={256} tones={['fill-[#6a3a24]', 'fill-[#54301e]']} berries="fill-[#c46a2b]" />
      <path d="M296 262 q 14 -5 26 2" className="fill-none stroke-[#3a241c]" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M186 262 q 3 -5 7 -2 l -2 4 q 4 0 3 3 l -8 -1 z" className="fill-[#141019]" />
    </>
  );
}

// Full illustrated season scenes with living skies: clouds drift, the aurora
// shimmers, fog rolls, fireflies wander, gulls glide; particles fall on top
// Remembered across screens so a season change can crossfade even when the
// backdrop remounts in a different wrapper
let lastShownSeason: number | null = null;

function SceneSvg({ season }: { season: number }) {
  return (
    <svg
      viewBox="0 0 480 270"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
    >
      {season === 0 && <WinterScene />}
      {season === 1 && <SpringScene />}
      {season === 2 && <SummerScene />}
      {season === 3 && <AutumnScene />}
    </svg>
  );
}

export default function SeasonBackdrop({ season }: { season: number }) {
  const seasonIndex = ((season % SEASON_COUNT) + SEASON_COUNT) % SEASON_COUNT;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fadeRef = useRef<HTMLDivElement | null>(null);
  const prevSeasonRef = useRef(seasonIndex);
  const [fadeFrom, setFadeFrom] = useState<number | null>(() =>
    lastShownSeason !== null && lastShownSeason !== seasonIndex ? lastShownSeason : null,
  );

  useEffect(() => {
    if (prevSeasonRef.current !== seasonIndex) {
      setFadeFrom(prevSeasonRef.current);
      prevSeasonRef.current = seasonIndex;
    }
    lastShownSeason = seasonIndex;
  }, [seasonIndex]);

  useEffect(() => {
    if (fadeFrom === null) return;
    const el = fadeRef.current;
    const animation = el?.animate(
      [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(1.015)' },
      ],
      {
        duration: 1800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      },
    );
    const timer = setTimeout(() => setFadeFrom(null), 1900);
    return () => {
      animation?.cancel();
      clearTimeout(timer);
    };
  }, [fadeFrom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const height = container.clientHeight || 300;
    const animations: Animation[] = [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const drift = (
      el: Element,
      dx: number,
      dy: number,
      duration: number,
      delay = 0,
    ) => {
      animations.push(
        (el as SVGElement).animate(
          [
            { transform: 'translate(0px, 0px)' },
            { transform: `translate(${dx}px, ${dy}px)` },
          ],
          { duration, delay, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
        ),
      );
    };
    if (!reducedMotion) {
      container.querySelectorAll<SVGElement>('[data-star]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { opacity: 0.25, transform: 'scale(0.72)' },
              { opacity: i % 4 === 0 ? 1 : 0.75, transform: 'scale(1.15)', offset: 0.5 },
              { opacity: 0.25, transform: 'scale(0.72)' },
            ],
            {
              duration: 3200 + (i % 5) * 900,
              delay: -i * 470,
              iterations: Infinity,
              easing: 'ease-in-out',
            },
          ),
        );
      });
      container.querySelectorAll('[data-cloud]').forEach((el, i) => {
        drift(el, 12 + i * 5, i % 2 ? -2 : 2, 26000 + i * 7000, -i * 2100);
      });
      container.querySelectorAll<SVGElement>('[data-aurora]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { opacity: 0.4, transform: 'translate(-6px, 1px) scaleY(0.96)' },
              { opacity: 0.82, transform: `translate(${10 + i * 7}px, -2px) scaleY(1.05)` },
            ],
            { duration: 10000 + i * 3500, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-glow]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { opacity: 0.55, transform: 'scale(0.94)' },
              { opacity: 1, transform: 'scale(1.08)' },
            ],
            { duration: 5800 + i * 900, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-shimmer]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { opacity: 0.35, transform: 'translateX(-4px)' },
              { opacity: 0.9, transform: 'translateX(5px)', offset: 0.5 },
              { opacity: 0.35, transform: 'translateX(-4px)' },
            ],
            { duration: 4200 + i * 1100, delay: -i * 800, iterations: Infinity, easing: 'ease-in-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-sway]').forEach((el, i) => {
        animations.push(
          el.animate(
            [{ transform: 'rotate(-0.8deg)' }, { transform: 'rotate(1.2deg)' }],
            { duration: 5200 + i * 1000, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-float]').forEach((el, i) => {
        drift(el, i % 2 ? 1.5 : -1.5, -2.5, 6500 + i * 900, -i * 700);
      });
      container.querySelectorAll('[data-fog]').forEach((el, i) => {
        drift(el, 24 + i * 12, i % 2 ? 1 : -1, 30000 + i * 9000, -i * 5000);
      });
      container.querySelectorAll<SVGElement>('[data-boat]').forEach((el) => {
        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 0px) rotate(0deg)', opacity: 0 },
              { transform: 'translate(60px, -1px) rotate(0.3deg)', opacity: 1, offset: 0.05 },
              { transform: 'translate(520px, 1px) rotate(-0.4deg)', opacity: 1, offset: 0.95 },
              { transform: 'translate(580px, 0px) rotate(0deg)', opacity: 0 },
            ],
            { duration: 70000, iterations: Infinity, easing: 'linear' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-frond]').forEach((el) => {
        animations.push(
          el.animate([{ transform: 'rotate(-0.5deg)' }, { transform: 'rotate(2.5deg)' }], {
            duration: 5200,
            direction: 'alternate',
            iterations: Infinity,
            easing: 'ease-in-out',
          }),
        );
      });
      container.querySelectorAll<SVGElement>('[data-firefly]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 0px) scale(0.7)', opacity: 0.15 },
              { transform: `translate(${8 + i * 2}px, -7px) scale(1.2)`, opacity: 1, offset: 0.33 },
              { transform: `translate(${-6 - i}px, 5px) scale(0.8)`, opacity: 0.25, offset: 0.68 },
              { transform: 'translate(0px, 0px) scale(0.7)', opacity: 0.15 },
            ],
            { duration: 6200 + i * 1200, delay: -i * 900, iterations: Infinity, easing: 'ease-in-out' },
          ),
        );
      });
      container.querySelectorAll<SVGElement>('[data-gull]').forEach((el, i) => {
        animations.push(
          el.animate(
            [
              { transform: 'translate(0px, 0px)' },
              { transform: 'translate(30px, -8px)' },
              { transform: 'translate(62px, 2px)' },
              { transform: 'translate(94px, -6px)' },
            ],
            {
              duration: 12000 + i * 3000,
              delay: -i * 2600,
              iterations: Infinity,
              direction: 'alternate',
              easing: 'ease-in-out',
            },
          ),
        );
      });
      container.querySelectorAll<HTMLElement>('[data-particle]').forEach((el, i) => {
        const dx = ((i * 37 + seasonIndex * 19) % 86) - 43;
        const duration = 7200 + ((i * 977 + seasonIndex * 613) % 5200);
        const rotation = seasonIndex === 3 ? 420 : seasonIndex === 1 ? 260 : 140;
        animations.push(
          el.animate(
            [
              { transform: 'translate(0, -18px) rotate(0deg) scale(0.75)', opacity: 0 },
              { opacity: 0.9, offset: 0.12 },
              { transform: `translate(${dx * 0.45}px, ${height * 0.52}px) rotate(${rotation * 0.45}deg) scale(1)`, opacity: 0.85, offset: 0.55 },
              { transform: `translate(${dx * 0.9}px, ${height * 0.9}px) rotate(${rotation * 0.9}deg) scale(0.86)`, opacity: 0.45, offset: 0.9 },
              { transform: `translate(${dx}px, ${height + 20}px) rotate(${rotation}deg) scale(0.82)`, opacity: 0 },
            ],
            {
              duration,
              delay: -((i * 811) % duration),
              iterations: Infinity,
              easing: seasonIndex === 0 ? 'linear' : 'cubic-bezier(0.37, 0, 0.63, 1)',
            },
          ),
        );
      });
    }
    // The season's own toy: one scenery piece per backdrop wobbles when poked
    const listeners: (() => void)[] = [];
    container.querySelectorAll<SVGElement>('[data-poke]').forEach((el) => {
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.style.transformBox = 'fill-box';
      el.style.transformOrigin = 'center bottom';
      const poke = () => {
        playChompSound();
        if (reducedMotion) return;
        animations.push(
          el.animate(
            [
              { transform: 'rotate(0deg) scale(1)' },
              { transform: 'rotate(-6deg) scale(1.08)' },
              { transform: 'rotate(5deg) scale(0.94)' },
              { transform: 'rotate(-2deg) scale(1.04)' },
              { transform: 'rotate(0deg) scale(1)' },
            ],
            { duration: 650, easing: 'ease-in-out' },
          ),
        );
      };
      el.addEventListener('click', poke);
      listeners.push(() => el.removeEventListener('click', poke));
    });
    const syncPlayback = () => {
      animations.forEach((animation) => {
        if (document.hidden) animation.pause();
        else animation.play();
      });
    };
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      animations.forEach((animation) => animation.cancel());
      listeners.forEach((remove) => remove());
      document.removeEventListener('visibilitychange', syncPlayback);
    };
  }, [seasonIndex]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <SceneSvg season={seasonIndex} />
      {fadeFrom !== null && (
        <div ref={fadeRef} className="absolute inset-0">
          <SceneSvg season={fadeFrom} />
        </div>
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,transparent_0%,rgba(2,6,23,0.06)_52%,rgba(2,6,23,0.42)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-slate-950/10" />
      {PARTICLE_CLASS[seasonIndex] &&
        Array.from({ length: PARTICLE_COUNT }, (_, i) => (
          <span
            key={i}
            data-particle
            className={`absolute top-0 motion-reduce:hidden ${PARTICLE_CLASS[seasonIndex]} ${PARTICLE_LEFT[i]}`}
          />
        ))}
    </div>
  );
}

import { townSceneryFrame } from '@/lib/constants/townEditions';
import type { TownLayoutKey } from '@/lib/constants/townLayout';

// Share of the backdrop's height given to the ground below the horizon
const GROUND_SHARE = 0.4;
// Containers narrower than this aspect get the phone scene
const PHONE_ASPECT = 0.8;

export type BackdropFraming = { layout: TownLayoutKey; viewBox: string; left: number; width: number };

const round = (n: number) => Math.round(n * 10) / 10;

// Picks the scene and a viewBox of the container's exact aspect, keeping the
// horizon at the same height and the scene centred at any size
export function backdropFraming(width: number, height: number): BackdropFraming {
  const layout: TownLayoutKey = width / height < PHONE_ASPECT ? 'phone' : 'desk';
  const frame = townSceneryFrame[layout];
  const span = frame.right - frame.left;
  let scale = (height * GROUND_SHARE) / (frame.bottom - frame.horizon);
  scale = Math.min(Math.max(scale, width / span), width / frame.minWidth);
  const w = width / scale;
  const h = Math.min(height / scale, frame.bottom - frame.top);
  const x = Math.min(Math.max(frame.centre - w / 2, frame.left), frame.right - w);
  return {
    layout,
    viewBox: `${round(x)} ${round(frame.bottom - h)} ${round(w)} ${round(h)}`,
    left: round(x),
    width: round(w),
  };
}

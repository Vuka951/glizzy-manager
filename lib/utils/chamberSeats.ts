import { PARLIAMENT_SEATS } from '@/data/games/careerElections';

export const CHAMBER_VIEW_W = 400;
export const CHAMBER_VIEW_H = 220;
export const CHAMBER_SEAT_RADIUS = 5.6;
const ROWS = [12, 16, 20, 24, 28];
const INNER_RADIUS = 66;
const OUTER_RADIUS = 186;

export type ChamberSeat = { x: number; y: number; angle: number };

// Five arcs of seats, listed from the far left of the chamber to the far
// right so a party order can be painted straight onto them
function seatPositions(): ChamberSeat[] {
  const seats: ChamberSeat[] = [];
  const step = (OUTER_RADIUS - INNER_RADIUS) / (ROWS.length - 1);
  ROWS.forEach((count, row) => {
    const radius = INNER_RADIUS + row * step;
    for (let i = 0; i < count; i++) {
      const angle = Math.PI - (Math.PI * (i + 0.5)) / count;
      seats.push({
        x: CHAMBER_VIEW_W / 2 + radius * Math.cos(angle),
        y: CHAMBER_VIEW_H - 8 - radius * Math.sin(angle),
        angle,
      });
    }
  });
  return seats.sort((a, b) => b.angle - a.angle).slice(0, PARLIAMENT_SEATS);
}

export const CHAMBER_SEATS: ChamberSeat[] = seatPositions();

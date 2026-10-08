// Geometry of the rival press conference, in SVG user units. The arm roots
// sit just inside the portrait circle, so an arm reads as coming out of its
// side rather than being pinned to it
export const PRESS_ARM_ROOTS = {
  left: { x: 178, y: 168 },
  right: { x: 222, y: 168 },
} as const;

// How far an arm reaches once it is up
export const PRESS_ARM_REACH = 104;

// Where an arm waits before it goes up
export const PRESS_ARM_REST = { left: 96, right: 84 } as const;

// The call-out: arm thrown out over the lectern at the room itself
export const PRESS_ARM_POINT = 18;

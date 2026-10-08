// Who a scene stages. The speaker is whoever the situation fell on; the
// other is the opposite side of the match or the other finalist, which only
// the scenes that stage two people read
export type QuoteSceneProps = {
  speaker: string;
  other: string;
  variant?: string;
};

export const QUOTE_LINE_START_MS = 1200;
export const QUOTE_SCENE_TAIL_MS = 1500;
